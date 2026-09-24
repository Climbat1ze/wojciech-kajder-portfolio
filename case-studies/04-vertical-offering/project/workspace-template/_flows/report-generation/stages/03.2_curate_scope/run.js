#!/usr/bin/env node
'use strict';

/**
 * Stage 03.2 — Curate Scope (optional).
 *
 * Only matters when the full in-scope pain-point list is too long for a
 * customer-facing document. Proposes a ranked shortlist; a human marks the
 * final Include decision by hand in output/curation.md. Affects nothing by
 * itself — it only changes what Stage 03.5 renders for the client-facing
 * output.
 */

const path = require('path');
const { ArtifactBuilder, readRequired } = require('../../../_lib/artifact');
const { log } = require('../../../_lib/log');

const { rank } = require('./_scripts/rank_pains');
const { mergeAndWrite } = require('./_scripts/curation_table');

const STAGE_ID = '03.2';
const STAGE_NAME = 'Curate Scope';
const RENDER_STAGE_DIR = path.join(__dirname, '..', '03_render_slidedeck');

function parseArgs(argv) {
  const opts = { target: 8 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--target') opts.target = parseInt(argv[++i], 10);
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const builder = new ArtifactBuilder(__dirname, STAGE_ID, STAGE_NAME);

  try {
    readRequired(RENDER_STAGE_DIR, 'render_report.json');
    const scope = require(path.join(RENDER_STAGE_DIR, 'output', 'filtered_data.json'));
    builder.input(path.join(RENDER_STAGE_DIR, 'output', 'filtered_data.json'), 'resolved scope from Stage 03');

    const ranked = rank(scope.pains, opts.target);
    const curationPath = path.join(__dirname, 'output', 'curation.md');
    const rows = mergeAndWrite(curationPath, ranked);
    builder.output(curationPath, 'editable shortlist — Include column is yours to set');

    builder.counts({
      pains_in_scope: scope.pains.length,
      suggested: ranked.filter((r) => r.suggested).length,
      target: opts.target
    });

    log.ok(`Wrote output/curation.md (${rows.length} row(s), ${ranked.filter((r) => r.suggested).length} suggested).`);
    log.info('Edit the Include column, then run Stage 03.5 — it reads this file for the client/kam-style output.');
  } catch (err) {
    builder.error(err.message);
    log.error(err.message);
  }

  builder.save('curation_report.json');
  return builder.exitCode;
}

if (require.main === module) {
  process.exit(main());
}
