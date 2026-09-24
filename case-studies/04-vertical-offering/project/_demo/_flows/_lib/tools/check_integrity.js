#!/usr/bin/env node
'use strict';

/**
 * Referential-integrity check for _data/.
 *
 * Run this any time before a build, and any time after a bulk edit to the
 * reference tables:
 *
 *   node _flows/_lib/tools/check_integrity.js
 *
 * It exits non-zero on any ERROR (duplicate/orphaned IDs) and prints
 * warnings (not errors) for things worth knowing but not fatal (unmapped
 * features, low VERIFIED coverage).
 */

const path = require('path');
const paths = require('../paths');
const tables = require('../tables');

const errors = [];
const warnings = [];

function readOptional(file, requiredHeaders) {
  const fullPath = paths.project('_data', file);
  const fs = require('fs');
  if (!fs.existsSync(fullPath)) return null;
  return tables.readTable(fullPath, requiredHeaders);
}

function main() {
  const verticals = readOptional('verticals.md', ['V_ID', 'Vertical']);
  const painPoints = readOptional('pain_points.md', ['P_ID', 'Pain Point']);
  const sources = readOptional('sources.md', ['S_ID']);
  const hwAttrs = readOptional('hardware_attributes.md', ['HW_ID']);
  const mapPainVertical = readOptional('map_pain_vertical.md', ['V_ID', 'P_ID']);
  const mapFeaturePain = readOptional('map_feature_pain.md', ['F_ID', 'P_ID']);
  const mapHwPain = readOptional('map_hw_pain.md', ['HW_ID', 'P_ID']);

  const verticalIds = new Set((verticals ? verticals.values('V_ID') : []).map((v) => v.trim()));
  const painIds = new Set((painPoints ? painPoints.values('P_ID') : []).map((v) => v.trim()));
  const sourceIds = new Set((sources ? sources.values('S_ID') : []).map((v) => v.trim()));
  const hwIds = new Set((hwAttrs ? hwAttrs.values('HW_ID') : []).map((v) => v.trim()));

  // Duplicate F_IDs across feature catalogues.
  const dupes = tables.findDuplicateFeatureIds(paths.FEATURES_DIR);
  for (const d of dupes) {
    errors.push(`Duplicate F_ID ${d.id} appears in: ${d.files.join(', ')}`);
  }

  const features = tables.readAllFeatures(paths.FEATURES_DIR);
  const featureIds = new Set(features.map((f) => String(f.F_ID).trim()));

  // Every feature/pain must cite a source that actually exists.
  for (const f of features) {
    const cited = String(f.Source || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (!cited.length) { errors.push(`Feature ${f.F_ID} (${f.Feature}) has no Source`); continue; }
    for (const s of cited) {
      if (sourceIds.size && !sourceIds.has(s)) {
        errors.push(`Feature ${f.F_ID} cites unknown Source "${s}"`);
      }
    }
  }
  if (painPoints) {
    for (const p of painPoints.rows) {
      const cited = String(p.Source || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (!cited.length) errors.push(`Pain point ${p.P_ID} has no Source`);
    }
  }

  // Mapping tables must reference IDs that exist.
  if (mapPainVertical) {
    for (const row of mapPainVertical.rows) {
      if (verticalIds.size && !verticalIds.has(String(row.V_ID).trim())) {
        errors.push(`map_pain_vertical.md references unknown V_ID "${row.V_ID}"`);
      }
      if (painIds.size && !painIds.has(String(row.P_ID).trim())) {
        errors.push(`map_pain_vertical.md references unknown P_ID "${row.P_ID}"`);
      }
    }
  }
  if (mapFeaturePain) {
    for (const row of mapFeaturePain.rows) {
      if (!featureIds.has(String(row.F_ID).trim())) {
        errors.push(`map_feature_pain.md references unknown F_ID "${row.F_ID}"`);
      }
      if (painIds.size && !painIds.has(String(row.P_ID).trim())) {
        errors.push(`map_feature_pain.md references unknown P_ID "${row.P_ID}"`);
      }
    }
  }
  if (mapHwPain) {
    for (const row of mapHwPain.rows) {
      if (hwIds.size && !hwIds.has(String(row.HW_ID).trim())) {
        errors.push(`map_hw_pain.md references unknown HW_ID "${row.HW_ID}"`);
      }
      if (painIds.size && !painIds.has(String(row.P_ID).trim())) {
        errors.push(`map_hw_pain.md references unknown P_ID "${row.P_ID}"`);
      }
    }
  }

  // Warnings: unmapped features, low VERIFIED coverage.
  if (mapFeaturePain) {
    const mapped = new Set(mapFeaturePain.values('F_ID'));
    const unmapped = features.filter((f) => !mapped.has(String(f.F_ID).trim()));
    if (unmapped.length) {
      warnings.push(`${unmapped.length} feature(s) have no Feature-to-Pain mapping: ${unmapped.map((f) => f.F_ID).join(', ')}`);
    }
  }
  if (features.length) {
    const verified = features.filter((f) => String(f.Status).trim().toUpperCase() === 'VERIFIED').length;
    warnings.push(`${verified}/${features.length} features are VERIFIED (rest are PROPOSED/TBC)`);
  }

  console.log(`Checked: ${features.length} features, ${painPoints ? painPoints.rows.length : 0} pain points, ` +
    `${verticals ? verticals.rows.length : 0} verticals, ${sources ? sources.rows.length : 0} sources, ` +
    `${hwAttrs ? hwAttrs.rows.length : 0} hardware attributes.`);

  if (warnings.length) {
    console.log('\nWarnings:');
    for (const w of warnings) console.log('  - ' + w);
  }

  if (errors.length) {
    console.error('\nErrors:');
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
  }

  console.log('\nNo integrity errors found.');
  process.exit(0);
}

main();
