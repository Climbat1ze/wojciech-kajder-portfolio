'use strict';

/**
 * Run configuration for the Vertical Offering Generator flows.
 *
 * Reads the single vertical_offering.config.md at the project root. The values
 * live in a fenced ```yaml block; only the small subset of YAML this project
 * uses is supported (scalars, booleans, inline and block lists), so there is no
 * external dependency.
 *
 * Two things this module deliberately does:
 *  - it validates the full key set up front, so a missing key surfaces
 *    immediately instead of silently producing a wrong deck later;
 *  - it records which values came from the file and which from the command
 *    line, so a stage artifact can show what actually applied.
 */

const fs = require('fs');
const paths = require('./paths');
const tables = require('./tables');

const REQUIRED_KEYS = [
  'vertical',
  'relevance_threshold',
  'mode',
  'include_hardware',
  'language',
  'feature_files'
];

const DEFAULTS = {
  relevance_threshold: 'M',
  mode: 'internal',
  include_hardware: true,
  language: 'EN',
  feature_files: 'all'
};

const THRESHOLD_ORDER = { H: 3, M: 2, L: 1 };

function coerce(raw) {
  const value = raw.trim();
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\[.*\]$/.test(value)) {
    return value.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  return value.replace(/^["']|["']$/g, '');
}

/** Extract the first fenced yaml block from a markdown document. */
function extractYamlBlock(content) {
  const match = /```ya?ml\s*\r?\n([\s\S]*?)```/i.exec(content);
  if (!match) throw new Error('No ```yaml block found in the config file');
  return match[1];
}

function parseYamlSubset(text) {
  const result = {};
  let listKey = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const listItem = /^\s*-\s+(.*)$/.exec(line);
    if (listItem && listKey) {
      result[listKey].push(coerce(listItem[1]));
      continue;
    }

    const pair = /^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/.exec(line.trim());
    if (!pair) continue;

    const [, key, rest] = pair;
    if (rest.trim() === '') {
      result[key] = [];
      listKey = key;
    } else {
      result[key] = coerce(rest);
      listKey = null;
    }
  }

  return result;
}

/** Resolve a vertical given either a V_ID or a display name. */
function resolveVertical(value) {
  const table = tables.readTable(paths.project('_data', 'verticals.md'), ['V_ID', 'Vertical']);
  if (!table) throw new Error('Cannot read _data/verticals.md');

  if (!table.rows.length) {
    throw new Error(
      '_data/verticals.md has no rows yet. This template ships with empty tables — ' +
      'add at least one vertical before running a build (see _data/README.md).'
    );
  }

  const needle = String(value).trim().toLowerCase();
  const row =
    table.rows.find((r) => String(r.V_ID).trim().toLowerCase() === needle) ||
    table.rows.find((r) => String(r.Vertical).trim().toLowerCase() === needle);

  if (!row) {
    const known = table.rows.map((r) => `${r.V_ID} (${r.Vertical})`).join(', ');
    throw new Error(`Unknown vertical: "${value}". Known verticals: ${known}`);
  }

  return { id: row.V_ID.trim(), name: row.Vertical.trim(), description: row.Description || '' };
}

/**
 * Load configuration, applying command-line overrides.
 * `overrides` uses the same key names as the file.
 */
function load(overrides = {}) {
  const file = paths.CONFIG_FILE;
  if (!fs.existsSync(file)) {
    throw new Error(`Config file not found: ${paths.contract(file)}`);
  }

  const fromFile = parseYamlSubset(extractYamlBlock(fs.readFileSync(file, 'utf8')));
  const merged = { ...DEFAULTS, ...fromFile };
  const sources = {};

  for (const key of Object.keys(merged)) {
    sources[key] = Object.prototype.hasOwnProperty.call(fromFile, key) ? 'config' : 'default';
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === null || value === '') continue;
    merged[key] = typeof merged[key] === 'boolean' ? String(value) === 'true' : value;
    sources[key] = 'cli';
  }

  const missing = REQUIRED_KEYS.filter((k) => merged[k] === undefined || merged[k] === '');
  if (missing.length) {
    throw new Error(
      `Config is missing required key(s): ${missing.join(', ')}. ` +
      `Expected all of: ${REQUIRED_KEYS.join(', ')} in ${paths.contract(file)}`
    );
  }

  const threshold = String(merged.relevance_threshold).toUpperCase();
  if (!THRESHOLD_ORDER[threshold]) {
    throw new Error(`relevance_threshold must be H, M or L (got "${merged.relevance_threshold}")`);
  }

  const mode = String(merged.mode).toLowerCase();
  if (mode !== 'client' && mode !== 'internal') {
    throw new Error(`mode must be "client" or "internal" (got "${merged.mode}")`);
  }

  return {
    vertical: resolveVertical(merged.vertical),
    relevance_threshold: threshold,
    mode,
    include_hardware: merged.include_hardware === true || merged.include_hardware === 'true',
    language: String(merged.language).toUpperCase(),
    feature_files: merged.feature_files,
    _sources: sources,
    _file: paths.contract(file)
  };
}

/** True when `relevance` clears the configured floor. */
function meetsThreshold(relevance, threshold) {
  const got = THRESHOLD_ORDER[String(relevance).trim().toUpperCase()];
  const floor = THRESHOLD_ORDER[String(threshold).trim().toUpperCase()];
  if (!got || !floor) return false;
  return got >= floor;
}

/** Human-readable summary for logs and artifacts. */
function describe(config) {
  return [
    `vertical=${config.vertical.id} (${config.vertical.name})`,
    `threshold=${config.relevance_threshold}`,
    `mode=${config.mode}`,
    `hardware=${config.include_hardware}`,
    `language=${config.language}`
  ].join('  ');
}

module.exports = {
  load,
  meetsThreshold,
  describe,
  resolveVertical,
  REQUIRED_KEYS,
  THRESHOLD_ORDER
};
