'use strict';

/**
 * Stage 02, prepare pass: compose the prompt a human pastes into an LLM.
 *
 * Two modes:
 *   extract    — read a new source document, propose new features / pain
 *                points / mappings / sources
 *   map-gaps   — no new document; link features that already exist to pain
 *                points that already exist
 *
 * Both modes embed the current inventory (existing features, pain points,
 * verticals) so the LLM can avoid proposing duplicates and can reference
 * real existing IDs when a new item connects to something that already
 * exists.
 */

const fs = require('fs');
const path = require('path');
const paths = require('../../../../_lib/paths');
const tables = require('../../../../_lib/tables');

function loadInventory() {
  const features = tables.readAllFeatures(paths.FEATURES_DIR);
  const painTable = tables.readTable(paths.project('_data', 'pain_points.md'), ['P_ID', 'Pain Point']);
  const verticalTable = tables.readTable(paths.project('_data', 'verticals.md'), ['V_ID', 'Vertical']);
  return {
    features,
    painPoints: painTable ? painTable.rows : [],
    verticals: verticalTable ? verticalTable.rows : []
  };
}

function renderInventory({ features, painPoints, verticals }) {
  const lines = ['## Current Inventory', ''];

  lines.push('### Existing features (do not propose duplicates of these)');
  if (features.length) {
    lines.push('| F_ID | Feature | Product |', '|------|---------|---------|');
    for (const f of features) lines.push(`| ${f.F_ID} | ${f.Feature} | ${f.Product} |`);
  } else {
    lines.push('_(none yet)_');
  }

  lines.push('', '### Existing pain points');
  if (painPoints.length) {
    lines.push('| P_ID | Pain Point | Cluster |', '|------|------------|---------|');
    for (const p of painPoints) lines.push(`| ${p.P_ID} | ${p['Pain Point']} | ${p.Cluster || ''} |`);
  } else {
    lines.push('_(none yet)_');
  }

  lines.push('', '### Existing verticals');
  if (verticals.length) {
    lines.push('| V_ID | Vertical |', '|------|----------|');
    for (const v of verticals) lines.push(`| ${v.V_ID} | ${v.Vertical} |`);
  } else {
    lines.push('_(none yet)_');
  }

  return lines.join('\n');
}

function loadPromptTemplate(mode) {
  const file = mode === 'map-gaps' ? 'map_gaps.md' : 'analyze_source.md';
  const target = paths.project('_prompts', file);
  if (!fs.existsSync(target)) {
    throw new Error(`Prompt template not found: ${paths.contract(target)}`);
  }
  return fs.readFileSync(target, 'utf8');
}

function unmappedFeaturesForProduct(features, product) {
  const mapTable = tables.readTable(paths.project('_data', 'map_feature_pain.md'), ['F_ID', 'P_ID']);
  const mapped = new Set(mapTable ? mapTable.values('F_ID') : []);
  return features.filter((f) => f.Product && String(f._file).replace(/\.md$/, '') === product && !mapped.has(String(f.F_ID).trim()));
}

/** Build the extract-mode prompt. Requires --file and --product. */
function buildExtractPrompt({ file, product, pm }) {
  const absFile = paths.expand(file);
  if (!fs.existsSync(absFile)) {
    throw new Error(`Source document not found: ${file}`);
  }
  const sourceText = fs.readFileSync(absFile, 'utf8');
  const inventory = loadInventory();

  const parts = [
    loadPromptTemplate('extract'),
    '',
    renderInventory(inventory),
    '',
    `## Target catalogue file`,
    '',
    `Propose new features into \`_data/features/${product}.md\`. If a proposed feature belongs to a different product, say so instead of forcing it into this file.`,
    pm ? `Route anything with no existing owner to reviewer \`${pm}\`.` : '',
    '',
    '## Source document',
    '',
    `Filename: ${path.basename(absFile)}`,
    '',
    '```',
    sourceText,
    '```'
  ];

  return { prompt: parts.filter((p) => p !== undefined).join('\n'), inventory };
}

/** Build the map-gaps-mode prompt. Requires --product. */
function buildMapGapsPrompt({ product }) {
  const inventory = loadInventory();
  const unmapped = unmappedFeaturesForProduct(inventory.features, product);

  if (!unmapped.length) {
    throw new Error(`No unmapped features found for product catalogue "${product}" (either the file has none, or all its features already have a Feature-to-Pain mapping).`);
  }

  const parts = [
    loadPromptTemplate('map-gaps'),
    '',
    '## Unmapped features for this batch',
    '',
    '| F_ID | Feature | Description |',
    '|------|---------|-------------|',
    ...unmapped.map((f) => `| ${f.F_ID} | ${f.Feature} | ${f.Description} |`),
    '',
    renderInventory(inventory)
  ];

  return { prompt: parts.join('\n'), inventory, unmapped };
}

module.exports = { loadInventory, renderInventory, buildExtractPrompt, buildMapGapsPrompt, unmappedFeaturesForProduct };
