'use strict';

/**
 * Read/write output/curation.md. Non-destructive: a human's `Include`
 * decision is never overwritten by a re-run — only `Suggested` is
 * recomputed, and a brand-new pain point gets a fresh Suggested value with
 * `Include` left blank for a human to set.
 */

const fs = require('fs');
const tables = require('../../../../_lib/tables');

const HEADERS = ['P_ID', 'Pain', 'Cluster', 'Relevance', 'Suggested', 'Include'];

function render(rows) {
  const header = `| ${HEADERS.join(' | ')} |`;
  const sep = '|' + HEADERS.map(() => '---').join('|') + '|';
  const body = rows.map((r) => `| ${r.P_ID} | ${r.Pain} | ${r.Cluster} | ${r.Relevance} | ${r.Suggested} | ${r.Include} |`);
  return [
    '# Vertical Offering — Curation',
    '',
    'Edit the **Include** column by hand (`Y` / `N`; blank is treated as `N`,',
    'the conservative default). Re-running this stage recomputes **Suggested**',
    'but never touches a value you already set in **Include**.',
    '',
    header,
    sep,
    ...body,
    ''
  ].join('\n');
}

/** Merge freshly-ranked rows with any existing curation.md, preserving human Include values. */
function mergeAndWrite(filePath, rankedRows) {
  let existingInclude = new Map();
  if (fs.existsSync(filePath)) {
    const table = tables.readTable(filePath, HEADERS);
    if (table) {
      for (const row of table.rows) {
        existingInclude.set(String(row.P_ID).trim(), String(row.Include).trim());
      }
    }
  }

  const rows = rankedRows.map(({ pain, suggested }) => ({
    P_ID: pain.id,
    Pain: pain.name,
    Cluster: pain.cluster || 'Uncategorised',
    Relevance: pain.relevance,
    Suggested: suggested ? 'Y' : 'N',
    Include: existingInclude.has(pain.id) ? (existingInclude.get(pain.id) || '') : ''
  }));

  fs.writeFileSync(filePath, render(rows), 'utf8');
  return rows;
}

/** Read curation.md into a Set of included P_IDs (Include=Y). Returns null if the file doesn't exist. */
function readIncluded(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const table = tables.readTable(filePath, HEADERS);
  if (!table) return null;
  return new Set(
    table.rows
      .filter((r) => String(r.Include).trim().toUpperCase() === 'Y')
      .map((r) => String(r.P_ID).trim())
  );
}

module.exports = { HEADERS, render, mergeAndWrite, readIncluded };
