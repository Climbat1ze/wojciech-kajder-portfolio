#!/usr/bin/env node
'use strict';

/**
 * Stage 01 — Knowledge Organic Input.
 *
 * The actual "adding a feature" step is a manual table edit (see CONTEXT.md).
 * This script only implements --validate: a mechanical check that the
 * catalogue is internally consistent after such an edit. With no flags, it
 * just prints where to look.
 */

const path = require('path');
const paths = require('../../../_lib/paths');
const tables = require('../../../_lib/tables');
const { ArtifactBuilder, STATUS } = require('../../../_lib/artifact');
const { log } = require('../../../_lib/log');

const STAGE_ID = '01';
const STAGE_NAME = 'Knowledge Organic Input';
const VALID_STATUS = new Set(['VERIFIED', 'PROPOSED', 'TBC']);

function validate(builder) {
  const featuresDir = paths.FEATURES_DIR;
  builder.input(featuresDir, 'feature catalogues');

  const sources = tables.readTable(paths.project('_data', 'sources.md'), ['S_ID']);
  const sourceIds = new Set((sources ? sources.values('S_ID') : []).map((s) => s.trim()));
  builder.input(paths.project('_data', 'sources.md'), 'source registry');

  const dupes = tables.findDuplicateFeatureIds(featuresDir);
  for (const d of dupes) {
    builder.error(`Duplicate F_ID ${d.id} appears in: ${d.files.join(', ')}`);
  }

  const features = tables.readAllFeatures(featuresDir);
  let ok = 0;

  for (const f of features) {
    const id = String(f.F_ID).trim();
    const status = String(f.Status).trim().toUpperCase();
    const cited = String(f.Source || '').split(',').map((s) => s.trim()).filter(Boolean);

    if (!cited.length) {
      builder.error(`${id} (${f.Feature}) in ${f._file} has no Source`);
      continue;
    }
    if (sourceIds.size) {
      const unknown = cited.filter((s) => !sourceIds.has(s));
      if (unknown.length) {
        builder.error(`${id} in ${f._file} cites unknown Source(s): ${unknown.join(', ')}`);
        continue;
      }
    }
    if (!VALID_STATUS.has(status)) {
      builder.error(`${id} in ${f._file} has an invalid Status: "${f.Status}"`);
      continue;
    }
    ok++;
  }

  builder.counts({ features_checked: features.length, features_ok: ok, duplicate_ids: dupes.length });
  return features.length;
}

function main() {
  const args = process.argv.slice(2);
  const shouldValidate = args.includes('--validate');

  const builder = new ArtifactBuilder(__dirname, STAGE_ID, STAGE_NAME);

  if (!shouldValidate) {
    log.info('Stage 01 is a manual step: edit _data/features/<product>.md directly, then re-run with --validate.');
    log.info('See CONTEXT.md for the full procedure.');
    builder.counts({ mode: 'info-only' });
    builder.save('validation_report.json');
    return 0;
  }

  log.info('Validating the feature catalogue...');
  const total = validate(builder);

  if (builder.failed) {
    log.error(`Validation failed for one or more of ${total} feature(s). See output/validation_report.json.`);
  } else {
    log.ok(`Validation passed for all ${total} feature(s).`);
  }

  builder.save('validation_report.json');
  return builder.exitCode;
}

if (require.main === module) {
  process.exit(main());
}
