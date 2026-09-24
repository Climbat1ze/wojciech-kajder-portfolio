#!/usr/bin/env node
'use strict';

/**
 * Report Generation Flow — orchestrator.
 *
 * Runs stages 03 -> 03.2 -> 03.5 -> 04 -> 05, or any subset. Each stage runs
 * as a SEPARATE PROCESS — the only channel between them is the files in each
 * stage's own output/, which is what makes "stop after any stage, edit its
 * artifact, resume" a real, safe operation rather than a suggestion.
 *
 * Usage:
 *   node run_flow.js                                  # every stage
 *   node run_flow.js --stage 03                       # one stage
 *   node run_flow.js --stage 03-04                    # a range (includes 03.2)
 *   node run_flow.js --vertical Healthcare --mode internal --build-id 2026-01-15_Healthcare
 *   node run_flow.js --skip-html                      # omit stage 03.5
 *   node run_flow.js --continue-on-error              # do not stop at the first failure
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { log } = require('../_lib/log');
const paths = require('../_lib/paths');

const STAGES_DIR = path.join(__dirname, 'stages');

const STAGES = [
  { id: '03',   dir: '03_render_slidedeck',   name: 'Render Slide Deck',    report: 'render_report.json',
    description: 'Resolve scope from the reference tables and render slide-MD' },
  { id: '03.2', dir: '03.2_curate_scope',     name: 'Curate Scope',         report: 'curation_report.json',
    description: 'Propose a ranked pain-point shortlist; human sets Include (optional)' },
  { id: '03.5', dir: '03.5_generate_html',    name: 'Generate HTML',        report: 'html_report.json',
    description: 'Build the HTML report (optional)' },
  { id: '04',   dir: '04_review_verify_gate', name: 'Review & Verify Gate', report: 'review_report.json',
    description: 'Prepare reviewer emails and the feedback file' },
  { id: '05',   dir: '05_publish_share',      name: 'Publish & Share',      report: 'publication_report.json',
    description: 'Publish the approved deck to _outputs/_final/' }
];

const FORWARDED_WITH_VALUE = ['--vertical', '-v', '--mode', '--threshold', '--language', '--build-id', '--deadline', '--target'];
const FORWARDED_FLAGS = ['--debug'];

function parseArgs(argv) {
  const options = { stage: null, skipHtml: false, continueOnError: false, help: false, forwarded: [] };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--stage' || arg === '-s') { options.stage = argv[++i]; continue; }
    if (arg === '--skip-html') { options.skipHtml = true; continue; }
    if (arg === '--continue-on-error') { options.continueOnError = true; continue; }
    if (arg === '--help' || arg === '-h') { options.help = true; continue; }

    if (FORWARDED_WITH_VALUE.includes(arg)) { options.forwarded.push(arg, argv[++i]); continue; }
    if (FORWARDED_FLAGS.includes(arg)) { options.forwarded.push(arg); continue; }

    log.warn(`Unrecognised option ignored: ${arg}`);
  }

  return options;
}

function showHelp() {
  process.stdout.write(`
Report Generation Flow — Vertical Offering Generator

  node run_flow.js [options]

Stage selection
  --stage, -s <id|range>   Run one stage (03) or a range (03-04). Default: all.
  --skip-html              Omit stage 03.5.

Build parameters (forwarded, override vertical_offering.config.md)
  --vertical, -v <id|name> Target vertical, e.g. V01 or "Field Services"
  --mode <client|internal> Output mode
  --threshold <H|M|L>      Pain relevance floor
  --target <N>             Stage 03.2: how many pain points to suggest including
  --build-id <id>          Required by stages 04 and 05
  --deadline <YYYY-MM-DD>  Stage 04: review deadline shown in emails

Behaviour
  --continue-on-error      Keep going after a stage fails. Off by default.
  --debug                  Verbose stage output
  --help, -h               This message

Stages
${STAGES.map((s) => `  ${s.id.padEnd(5)} ${s.name.padEnd(22)} ${s.description}`).join('\n')}

Every stage writes its artifacts to stages/<stage>/output/. Stages exchange data
only through those files, so you can stop after any stage, inspect or edit its
output, and resume from the next one.
`);
}

function resolveStages(options) {
  let selected = STAGES;

  if (options.stage) {
    const parts = String(options.stage).split('-');
    const startId = parts[0];
    const endId = parts.length > 1 ? parts[1] : startId;
    const start = STAGES.findIndex((s) => s.id === startId);
    const end = STAGES.findIndex((s) => s.id === endId);

    if (start === -1 || end === -1 || start > end) {
      log.error(`Invalid stage selection: "${options.stage}". Known stages: ${STAGES.map((s) => s.id).join(', ')}`);
      process.exit(2);
    }
    selected = STAGES.slice(start, end + 1);
  }

  if (options.skipHtml) selected = selected.filter((s) => s.id !== '03.5');
  return selected;
}

function runStage(stage, options) {
  const stageDir = path.join(STAGES_DIR, stage.dir);
  const script = path.join(stageDir, 'run.js');

  if (!fs.existsSync(script)) {
    log.error(`Stage ${stage.id} is not implemented: ${paths.contract(script)} does not exist`);
    return { ok: false, implemented: false };
  }

  log.section(`Stage ${stage.id}: ${stage.name}`);

  const result = spawnSync(process.execPath, [script, ...options.forwarded], {
    cwd: stageDir,
    stdio: 'inherit'
  });

  if (result.error) {
    log.error(`Stage ${stage.id} could not be started: ${result.error.message}`);
    return { ok: false, implemented: true };
  }

  const ok = result.status === 0;

  const reportPath = path.join(stageDir, 'output', stage.report);
  if (ok && !fs.existsSync(reportPath)) {
    log.error(`Stage ${stage.id} exited 0 but wrote no artifact at ${paths.contract(reportPath)}`);
    log.error(`  A stage that reports success without producing anything is treated as a failure.`);
    return { ok: false, implemented: true, exitCode: result.status, reason: 'no artifact' };
  }

  return { ok, implemented: true, exitCode: result.status, report: reportPath };
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) { showHelp(); return 0; }

  const selected = resolveStages(options);

  log.section('Report Generation Flow');
  log.info(`Stages: ${selected.map((s) => s.id).join(' -> ')}`);
  if (options.forwarded.length) log.info(`Build parameters: ${options.forwarded.join(' ')}`);
  log.info(`On failure: ${options.continueOnError ? 'continue' : 'stop'}`);

  const results = [];
  let stopped = false;

  for (const stage of selected) {
    const outcome = runStage(stage, options);
    results.push({ stage, outcome });

    if (!outcome.ok && !options.continueOnError) {
      stopped = true;
      break;
    }
  }

  log.section('Flow summary');
  for (const { stage, outcome } of results) {
    let verdict;
    if (outcome.ok) verdict = 'ok';
    else if (!outcome.implemented) verdict = 'not implemented';
    else if (outcome.reason === 'no artifact') verdict = 'failed (exited 0 but produced no artifact)';
    else verdict = `failed (exit ${outcome.exitCode})`;
    process.stdout.write(`  ${stage.id.padEnd(5)} ${stage.name.padEnd(24)} ${verdict}\n`);
  }

  const failed = results.filter((r) => !r.outcome.ok);
  const skipped = selected.length - results.length;

  if (skipped) {
    process.stdout.write(`  ${String(skipped)} stage(s) not attempted because an earlier stage failed\n`);
  }

  if (failed.length) {
    log.error(`${failed.length} stage(s) failed`);
    if (stopped) log.info('Fix the failure and re-run from that stage, e.g. node run_flow.js --stage 03');
    return 1;
  }

  log.ok('All selected stages completed and produced artifacts');
  return 0;
}

if (require.main === module) {
  let code = 1;
  try {
    code = main();
  } catch (err) {
    log.error(`Fatal: ${err.message}`);
    if (process.argv.includes('--debug')) log.error(err.stack);
  }
  process.exit(code);
}

module.exports = { STAGES, main };
