#!/usr/bin/env node
'use strict';

/**
 * Stage 02.5 — Verification Export.
 *
 * Deterministic mail-merge: every Active Queue item addressed to one
 * reviewer, batched into a single ready-to-send message. Does not modify the
 * queue — that happens in Stage 02.6, once the reviewer has replied.
 */

const path = require('path');
const paths = require('../../../_lib/paths');
const owners = require('../../../_lib/owners');
const { ArtifactBuilder } = require('../../../_lib/artifact');
const { log } = require('../../../_lib/log');

const queue = require('../02_knowledge_ai_mining/_scripts/queue');
const generateEmail = require('./_scripts/generate_email');

const STAGE_ID = '02.5';
const STAGE_NAME = 'Verification Export';

function parseArgs(argv) {
  const opts = { format: 'html', deadline: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pm') opts.pm = argv[++i];
    else if (a === '--format') opts.format = argv[++i];
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
    if (!opts.pm) throw new Error('--pm <PM_ID> is required');

    const entries = queue.forPm(opts.pm);
    if (!entries.length) {
      builder.warn(`No Active Queue items are assigned to ${opts.pm}. Nothing to export.`);
      builder.counts({ items: 0 });
      builder.save('export_report.json');
      log.warn(`No pending items for ${opts.pm}.`);
      return builder.exitCode;
    }

    const person = owners.person(opts.pm);
    const pmName = person ? person.name : opts.pm;
    const deadline = opts.deadline || defaultDeadline();

    const items = generateEmail.buildItems(entries);

    let content;
    let ext;
    if (opts.format === 'md') { content = generateEmail.renderMarkdown(items, pmName, deadline); ext = 'md'; }
    else if (opts.format === 'text') { content = generateEmail.renderText(items, pmName, deadline); ext = 'txt'; }
    else { content = generateEmail.renderHtml(items, pmName, deadline); ext = 'html'; }

    const filename = `verification_email_${opts.pm}.${ext}`;
    builder.writeFile(filename, content, `verification email for ${opts.pm}`);

    // number -> Entry_ID map, so Stage 02.6 resolves a reply against the
    // exact numbering this email used, even if the queue changes afterward.
    const numberMap = {};
    for (const item of items) numberMap[item.number] = item.entryId;
    builder.payload({ pm: opts.pm, pm_name: pmName, deadline, number_to_entry_id: numberMap });

    builder.counts({ items: items.length });
    log.ok(`Wrote output/${filename} (${items.length} item(s) for ${pmName}).`);
  } catch (err) {
    builder.error(err.message);
    log.error(err.message);
  }

  builder.save('export_report.json');
  return builder.exitCode;
}

if (require.main === module) {
  process.exit(main());
}
