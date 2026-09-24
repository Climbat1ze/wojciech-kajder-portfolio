#!/usr/bin/env node
'use strict';

/**
 * Stage 04 — Review & Verify Gate.
 *
 * Reads the build's resolved scope, works out which reviewers actually have
 * content in it, generates a review email per reviewer, and creates/extends
 * the human-edited feedback file that Stage 05 gates on. Sends nothing —
 * that is a human action.
 */

const fs = require('fs');
const path = require('path');
const { ArtifactBuilder, readRequired } = require('../../../_lib/artifact');
const feedback = require('../../../_lib/feedback');
const naming = require('../../../_lib/naming');
const { log } = require('../../../_lib/log');

const { groupByOwner, renderEmail } = require('./_scripts/generate_review_email');

const STAGE_ID = '04';
const STAGE_NAME = 'Review & Verify Gate';
const RENDER_STAGE_DIR = path.join(__dirname, '..', '03_render_slidedeck');
const HTML_STAGE_DIR = path.join(__dirname, '..', '03.5_generate_html');

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--build-id') opts.buildId = argv[++i];
    else if (a === '--deadline') opts.deadline = argv[++i];
  }
  return opts;
}

function defaultDeadline() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 10);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const builder = new ArtifactBuilder(__dirname, STAGE_ID, STAGE_NAME);

  try {
    const renderReport = readRequired(RENDER_STAGE_DIR, 'render_report.json');
    const scope = JSON.parse(fs.readFileSync(path.join(RENDER_STAGE_DIR, 'output', 'filtered_data.json'), 'utf8'));
    builder.input(path.join(RENDER_STAGE_DIR, 'output', 'filtered_data.json'), 'resolved scope');

    const config = renderReport.config;
    const verticalMatch = /^(\S+)\s*\((.+)\)$/.exec(config.vertical || '');
    const vertical = { id: verticalMatch ? verticalMatch[1] : config.vertical, name: verticalMatch ? verticalMatch[2] : config.vertical };

    const buildId = opts.buildId || naming.defaultBuildId(vertical);
    const deadline = opts.deadline || defaultDeadline();

    const { byPm, unassigned } = groupByOwner(scope);
    if (unassigned.length) {
      builder.warn(`${unassigned.length} feature(s) in scope have no assigned reviewer: ${unassigned.map((f) => f.id).join(', ')}`);
    }

    const outDir = path.join(__dirname, 'output', 'emails');
    fs.mkdirSync(outDir, { recursive: true });

    const pmRows = [];
    for (const [pmId, { pm, features }] of byPm) {
      const pmName = pm ? pm.name : pmId;
      const html = renderEmail({ pmName, buildId, vertical, features, deadline });
      const target = path.join(outDir, `${pmId}.html`);
      fs.writeFileSync(target, html, 'utf8');
      builder.output(target, `review email for ${pmId}`);
      pmRows.push({ pmId, pmName, sections: features.map((f) => f.product).filter((v, i, a) => a.indexOf(v) === i).join(', ') });
    }

    let draftHtml = '';
    if (fs.existsSync(path.join(HTML_STAGE_DIR, 'output', 'report.html'))) {
      draftHtml = path.relative(process.cwd(), path.join(HTML_STAGE_DIR, 'output', 'report.html'));
    }

    const feedbackResult = feedback.ensureFile({
      buildId,
      buildDate: new Date().toISOString().slice(0, 10),
      vertical,
      mode: config.mode,
      draftMd: path.relative(process.cwd(), path.join(RENDER_STAGE_DIR, 'output', 'draft_deck.md')),
      draftHtml,
      deadline,
      pmRows
    });
    builder.output(feedbackResult.path, feedbackResult.created ? 'created' : 'extended');

    builder.payload({ build_id: buildId, reviewers: [...byPm.keys()], unassigned: unassigned.map((f) => f.id) });
    builder.counts({ reviewers_notified: byPm.size, unassigned_features: unassigned.length });

    log.ok(`Prepared ${byPm.size} review email(s) for build ${buildId}.`);
    log.info(`Feedback file: ${feedback.filePath(buildId)}`);
  } catch (err) {
    builder.error(err.message);
    log.error(err.message);
  }

  builder.save('review_report.json');
  return builder.exitCode;
}

if (require.main === module) {
  process.exit(main());
}
