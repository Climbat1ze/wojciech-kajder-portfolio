#!/usr/bin/env node
'use strict';

/**
 * Data Ingestion Flow — orchestrator.
 *
 * Runs stages 01 -> 02 -> 02.5 -> 02.6, or any subset. Each stage runs as a
 * SEPARATE PROCESS, so the only channel between stages is the files each one
 * writes to its own output/ — never in-memory state. That is what makes
 * "stop after any stage, hand-edit its artifact, resume" literally true.
 *
 * Stage 02 has two passes (prepare, then --ingest) separated by a human step
 * — see stages/02_knowledge_ai_mining/CONTEXT.md. Running "all stages" here
 * only runs 02's prepare pass; --ingest is always explicit, never implied by
 * a full-flow run, because it is the pass that writes to shared _data/*.md.
 *
 * Usage:
 *   node run_flow.js                                     # every stage
 *   node run_flow.js --stage 01 --validate                # validate the catalogue
 *   node run_flow.js --stage 02 --file doc.md --pm PM01    # Stage 02, prepare (extract)
 *   node run_flow.js --stage 02 --mode map-gaps --product example_module
 *   node run_flow.js --stage 02 --ingest                   # Stage 02, ingest pass
 *   node run_flow.js --stage 02.5 --pm PM01
 *   node run_flow.js --stage 02.6 --pm PM01 --email-file reply.txt
 *   node run_flow.js --stage 02-02.6                       # a range
 *   node run_flow.js --continue-on-error                   # do not stop at the first failure
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { log } = require('../_lib/log');
const paths = require('../_lib/paths');

const STAGES_DIR = path.join(__dirname, 'stages');

const STAGES = [
  { id: '01',   dir: '01_knowledge_organic_input', name: 'Knowledge Organic Input', report: 'validation_report.json',
    description: 'Manual feature entry by the product owner; --validate checks the catalogue afterward' },
  { id: '02',   dir: '02_knowledge_ai_mining',      name: 'Knowledge AI Mining',     report: 'mining_report.json',
    description: 'Prepare a mining prompt (extract or map-gaps), or --ingest its LLM reply' },
  { id: '02.5', dir: '02.5_verification_export',    name: 'Verification Export',     report: 'export_report.json',
    description: 'Generate a reviewer email from the Active Queue' },
  { id: '02.6', dir: '02.6_verification_parse',     name: 'Verification Parse',      report: 'parse_report.json',
    description: 'Parse a reviewer reply and write VERIFIED back to _data/*.md' }
];

const FORWARDED_WITH_VALUE = ['--file', '--pm', '--mode', '--product', '--format', '--deadline', '--email', '--email-file'];
const FORWARDED_FLAGS = ['--validate', '--ingest', '--debug'];

function parseArgs(argv) {
  const options = { stage: null, continueOnError: false, help: false, forwarded: [] };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--stage' || arg === '-s') { options.stage = argv[++i]; continue; }
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
Data Ingestion Flow — Vertical Offering Generator

  node run_flow.js [options]

Stage selection
  --stage, -s <id|range>   Run one stage (02) or a range (01-02.6). Default: all.

Stage-specific parameters (forwarded as given, unused by other stages)
  --validate               Stage 01: check the feature catalogue after a manual edit
  --file <path>            Stage 02 (extract mode): source document to analyze
  --pm <PM_ID>             Stage 02 (extract): who to route content with no owner to
                           Stage 02.5: which reviewer's email to generate
                           Stage 02.6: whose reply this is
  --mode <extract|map-gaps>  Stage 02: which prompt to prepare (default extract)
  --product <name>         Stage 02 (map-gaps mode): product/catalogue to find gaps for
  --ingest                 Stage 02: run the ingest pass instead of prepare
  --format <html|md|text>  Stage 02.5: email format
  --deadline <YYYY-MM-DD>  Stage 02.5: reply-by date
  --email <text>           Stage 02.6: reviewer reply, inline
  --email-file <path>      Stage 02.6: reviewer reply, from a file

Behaviour
  --continue-on-error      Keep going after a stage fails. Off by default.
  --debug                  Verbose stage output
  --help, -h               This message

Stages
${STAGES.map((s) => `  ${s.id.padEnd(5)} ${s.name.padEnd(24)} ${s.description}`).join('\n')}

Every stage writes its artifacts to stages/<stage>/output/. Stages exchange data
only through those files, so you can stop after any stage, inspect or edit its
output, and resume from the next one. Stage 02's ingest pass and Stage 02.6 also
write to shared _data/*.md and _state/verification_queue.md — everything else
here only touches its own output/.
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

  log.section('Data Ingestion Flow');
  log.info(`Stages: ${selected.map((s) => s.id).join(' -> ')}`);
  if (options.forwarded.length) log.info(`Parameters: ${options.forwarded.join(' ')}`);
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
    if (stopped) log.info('Fix the failure and re-run from that stage, e.g. node run_flow.js --stage 02');
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
