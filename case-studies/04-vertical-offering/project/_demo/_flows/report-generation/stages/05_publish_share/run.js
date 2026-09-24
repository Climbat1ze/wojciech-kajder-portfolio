#!/usr/bin/env node
'use strict';

/**
 * Stage 05 — Publish & Share.
 *
 * The gate: refuses to publish unless every reviewer listed in
 * _state/[Build_ID]_build_feedback.md shows Approved. On success, copies the
 * build's outputs into _outputs/_final/ and logs the publication.
 */

const fs = require('fs');
const path = require('path');
const paths = require('../../../_lib/paths');
const naming = require('../../../_lib/naming');
const stateLib = require('../../../_lib/state');
const feedback = require('../../../_lib/feedback');
const { ArtifactBuilder, readRequired } = require('../../../_lib/artifact');
const { log } = require('../../../_lib/log');

const STAGE_ID = '05';
const STAGE_NAME = 'Publish & Share';
const RENDER_STAGE_DIR = path.join(__dirname, '..', '03_render_slidedeck');
const HTML_STAGE_DIR = path.join(__dirname, '..', '03.5_generate_html');

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--build-id') opts.buildId = argv[++i];
  }
  return opts;
}

function nextVersion(vertical) {
  if (!fs.existsSync(paths.FINAL_DIR)) return 1;
  const pattern = naming.finalFilePattern(vertical);
  const versions = fs.readdirSync(paths.FINAL_DIR)
    .map((name) => { const m = pattern.exec(name); return m ? parseInt(m[1], 10) : null; })
    .filter((v) => v !== null);
  return (versions.length ? Math.max(...versions) : 0) + 1;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const builder = new ArtifactBuilder(__dirname, STAGE_ID, STAGE_NAME);

  try {
    if (!opts.buildId) throw new Error('--build-id is required');

    const rows = feedback.readPmFeedback(opts.buildId);
    if (!rows.length) throw new Error(`No reviewer rows found in ${feedback.filePath(opts.buildId)}. Run Stage 04 first.`);

    const pending = feedback.pendingApprovals(rows);
    if (pending.length) {
      builder.block(
        `Cannot publish: ${pending.length} reviewer(s) have not approved yet: ` +
        pending.map((r) => `${r.pmId} (${r.status})`).join(', ')
      );
      builder.save('publication_report.json');
      log.error(builder.envelope.validation.errors[0]);
      return builder.exitCode;
    }

    const renderReport = readRequired(RENDER_STAGE_DIR, 'render_report.json');
    const config = renderReport.config;
    const verticalMatch = /^(\S+)\s*\((.+)\)$/.exec(config.vertical || '');
    const vertical = { id: verticalMatch ? verticalMatch[1] : config.vertical, name: verticalMatch ? verticalMatch[2] : config.vertical };

    fs.mkdirSync(paths.FINAL_DIR, { recursive: true });
    const version = nextVersion(vertical);
    const date = new Date().toISOString().slice(0, 10);

    const mdSource = path.join(RENDER_STAGE_DIR, 'output', 'draft_deck.md');
    const mdTarget = path.join(paths.FINAL_DIR, naming.finalFilename(vertical, version, 'md', date));
    fs.copyFileSync(mdSource, mdTarget);
    builder.output(mdTarget, 'published deck (Markdown)');

    let htmlTarget = null;
    const htmlSource = path.join(HTML_STAGE_DIR, 'output', 'report.html');
    if (fs.existsSync(htmlSource)) {
      htmlTarget = path.join(paths.FINAL_DIR, naming.finalFilename(vertical, version, 'html', date));
      fs.copyFileSync(htmlSource, htmlTarget);
      builder.output(htmlTarget, 'published deck (HTML)');
    }

    stateLib.appendLogEntry({
      action: 'publish',
      description: `${opts.buildId}: published ${vertical.id} ${vertical.name}, v${version}`,
      path: [paths.contract(mdTarget), htmlTarget ? paths.contract(htmlTarget) : null].filter(Boolean)
    });

    const notice = [
      `# ${vertical.name} — Vertical Offering published`,
      '',
      `Build: ${opts.buildId}`,
      `Files: ${paths.contract(mdTarget)}${htmlTarget ? `, ${paths.contract(htmlTarget)}` : ''}`,
      '',
      'Share this with the relevant sales / account teams.'
    ].join('\n');
    builder.writeFile('stakeholder_notice.md', notice + '\n', 'for a human to send onward');

    builder.payload({ build_id: opts.buildId, vertical: vertical.id, version, md: paths.contract(mdTarget), html: htmlTarget ? paths.contract(htmlTarget) : null });
    builder.counts({ version, reviewers_approved: rows.length });

    log.ok(`Published ${vertical.name} v${version}.`);
  } catch (err) {
    builder.error(err.message);
    log.error(err.message);
  }

  builder.save('publication_report.json');
  return builder.exitCode;
}

if (require.main === module) {
  process.exit(main());
}
