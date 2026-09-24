#!/usr/bin/env node
'use strict';

/**
 * Stage 03 — Render Slide Deck.
 *
 * Deterministic, no LLM: reads vertical_offering.config.md + _data/*.md,
 * resolves the vertical's scope, applies Active Blocks and the mode filter,
 * and renders slide-Markdown. Refuses (non-zero exit) rather than emitting
 * an empty or misleading deck when `mode: client` has zero VERIFIED rows in
 * scope.
 */

const configLib = require('../../../_lib/config');
const { ArtifactBuilder } = require('../../../_lib/artifact');
const { log } = require('../../../_lib/log');
const paths = require('../../../_lib/paths');

const { resolve } = require('./_scripts/resolve_scope');
const { renderDeck } = require('./_scripts/render_deck');

const STAGE_ID = '03';
const STAGE_NAME = 'Render Slide Deck';

function parseArgs(argv) {
  const overrides = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--vertical' || a === '-v') overrides.vertical = argv[++i];
    else if (a === '--mode') overrides.mode = argv[++i];
    else if (a === '--threshold') overrides.relevance_threshold = argv[++i];
    else if (a === '--language') overrides.language = argv[++i];
  }
  return overrides;
}

function main() {
  const overrides = parseArgs(process.argv.slice(2));
  const builder = new ArtifactBuilder(__dirname, STAGE_ID, STAGE_NAME);

  try {
    const config = configLib.load(overrides);
    builder.config(config);
    builder.input(paths.CONFIG_FILE, 'run configuration');
    builder.input(paths.DATA_DIR, 'reference tables');
    builder.input(paths.STATE_FILE, 'Active Blocks');

    log.info(configLib.describe(config));

    const scope = resolve(config);
    builder.writeFile('filtered_data.json', JSON.stringify(scope, null, 2) + '\n', 'resolved scope — the audit point');

    const { markdown, summary } = renderDeck(scope, config);
    builder.writeFile('draft_deck.md', markdown, 'slide-Markdown deck');

    for (const gap of scope.dataGaps) builder.warn(gap);

    builder.counts({
      pains_in_scope: scope.pains.length,
      features: new Set(scope.pains.flatMap((p) => p.features.map((f) => f.id))).size,
      hardware_attributes: new Set(scope.pains.flatMap((p) => p.hardware.map((h) => h.id))).size,
      removed_by_blocks: scope.removedByBlocks.length,
      annex_items: scope.annex.length,
      data_gaps: scope.dataGaps.length
    });

    log.ok(summary);
  } catch (err) {
    builder.error(err.message);
    log.error(err.message);
  }

  builder.save('render_report.json');
  return builder.exitCode;
}

if (require.main === module) {
  process.exit(main());
}
