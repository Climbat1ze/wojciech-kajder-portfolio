#!/usr/bin/env node
'use strict';

/**
 * Regenerate _data/feature_owner_map.md from pm_owners.md's Product Coverage
 * Map + each feature catalogue's Product column. This file is a derived
 * index, not a second source of ownership truth — never hand-edit it.
 *
 *   node _flows/_lib/tools/generate_feature_owner_map.js
 */

const fs = require('fs');
const paths = require('../paths');
const tables = require('../tables');
const owners = require('../owners');

function main() {
  const features = tables.readAllFeatures(paths.FEATURES_DIR);
  const rows = features.map((f) => {
    const owner = owners.resolveFeature(f);
    const verificationStatus = String(f.Status).trim().toUpperCase() === 'VERIFIED' ? 'VERIFIED' : 'PENDING';
    return {
      F_ID: f.F_ID,
      Feature: f.Feature,
      Product: f.Product,
      PM_ID: owner.resolved ? (owner.assigned ? owner.pmId : 'PENDING') : 'UNRESOLVED',
      Verification_Status: verificationStatus,
      Source_File: f._file
    };
  });

  const header = '| F_ID | Feature | Product | PM_ID | Verification_Status | Source_File |';
  const sep = '|------|---------|---------|-------|---------------------|-------------|';
  const body = rows.map((r) =>
    `| ${r.F_ID} | ${r.Feature} | ${r.Product} | ${r.PM_ID} | ${r.Verification_Status} | ${r.Source_File} |`
  );

  const content = [
    '<!-- Vertical Offering: Feature to reviewer (PM) mapping -->',
    '<!--                                                                          -->',
    '<!-- GENERATED FILE — DO NOT EDIT BY HAND.                                    -->',
    '<!-- Source of truth: _data/pm_owners.md (Product Coverage Map)               -->',
    '<!--                + _data/features/*.md (Product column)                    -->',
    '<!-- Regenerate:  node _flows/_lib/tools/generate_feature_owner_map.js        -->',
    '<!--                                                                          -->',
    '<!-- PM_ID values: a PM_ID, or PENDING (product listed with no owner yet),    -->',
    '<!-- or UNRESOLVED (product absent from pm_owners.md).                        -->',
    `<!-- Generated: ${new Date().toISOString().slice(0, 10)} -->`,
    '',
    header,
    sep,
    ...body,
    ''
  ].join('\n');

  const target = paths.project('_data', 'feature_owner_map.md');
  fs.writeFileSync(target, content, 'utf8');
  console.log(`Wrote ${rows.length} row(s) to ${paths.contract(target)}`);
}

main();
