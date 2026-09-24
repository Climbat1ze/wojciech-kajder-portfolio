'use strict';

/**
 * Project state: Active Blocks and the change log.
 *
 * _state/vertical_offering_state.md is the single authoritative copy of the
 * Active Blocks table. Nothing else in this project should keep its own copy
 * of that list — a second copy is how a block silently drifts out of sync
 * with what a build actually applies.
 *
 * Each ACTIVE block compiles into a predicate. A block that cannot be
 * compiled is a hard error rather than a silently ignored row — a filter
 * that quietly does nothing defeats the point of having it.
 */

const paths = require('./paths');
const tables = require('./tables');

const BLOCK_HEADERS = ['Block_ID', 'Status', 'Scope', 'Match', 'Pattern', 'Action', 'Reason'];
const LOG_HEADERS = ['Date', 'Action', 'Description', 'Path'];

const VALID_MATCH = new Set(['contains', 'equals', 'id', 'regex', 'all']);

function stripFormatting(value) {
  return String(value == null ? '' : value).trim().replace(/^`+|`+$/g, '');
}

function parseScope(scope) {
  const raw = stripFormatting(scope);
  if (raw === '—' || raw === '') return { entity: null, column: null };
  const dot = raw.indexOf('.');
  if (dot === -1) return { entity: raw, column: '*' };
  return { entity: raw.slice(0, dot), column: raw.slice(dot + 1) };
}

function parseAction(action) {
  const raw = stripFormatting(action).toLowerCase();
  if (raw.startsWith('badge:')) return { kind: 'badge', label: stripFormatting(action).slice(6) };
  if (raw === 'exclude' || raw === 'none') return { kind: raw };
  throw new Error(`Unknown Active Block action: "${action}" (expected exclude, none or badge:<text>)`);
}

function buildMatcher(block) {
  const pattern = stripFormatting(block.pattern);

  switch (block.match) {
    case 'all':
      return () => true;
    case 'contains': {
      const needle = pattern.toLowerCase();
      return (value) => String(value == null ? '' : value).toLowerCase().includes(needle);
    }
    case 'equals':
    case 'id': {
      const needle = pattern.toLowerCase();
      return (value) => String(value == null ? '' : value).trim().toLowerCase() === needle;
    }
    case 'regex': {
      let re;
      try {
        re = new RegExp(pattern, 'i');
      } catch (err) {
        throw new Error(`Active Block ${block.id} has an invalid regex pattern: ${err.message}`);
      }
      return (value) => re.test(String(value == null ? '' : value));
    }
    default:
      throw new Error(`Active Block ${block.id} has an unknown Match type: "${block.match}"`);
  }
}

/** Read every Active Block row, retired ones included. */
function readBlocks() {
  const table = tables.readTable(paths.STATE_FILE, BLOCK_HEADERS);
  if (!table) {
    throw new Error(
      `Active Blocks table not found in ${paths.contract(paths.STATE_FILE)}. ` +
      `Expected a table with columns: ${BLOCK_HEADERS.join(', ')}`
    );
  }

  return table.rows.map((row) => {
    const status = stripFormatting(row.Status).toUpperCase();
    const block = {
      id: stripFormatting(row.Block_ID),
      status,
      active: status === 'ACTIVE',
      scope: parseScope(row.Scope),
      match: stripFormatting(row.Match).toLowerCase(),
      pattern: stripFormatting(row.Pattern),
      reason: stripFormatting(row.Reason),
      raw: row
    };

    if (!block.active) {
      block.action = { kind: 'none' };
      block.test = () => false;
      return block;
    }

    if (!VALID_MATCH.has(block.match)) {
      throw new Error(
        `Active Block ${block.id} has Match="${row.Match}", which is not one of ${[...VALID_MATCH].join(', ')}`
      );
    }
    if (!block.scope.entity) {
      throw new Error(`Active Block ${block.id} is ACTIVE but has no Scope`);
    }

    block.action = parseAction(row.Action);
    block.test = buildMatcher(block);
    return block;
  });
}

/**
 * Compile the block table into something a stage can apply.
 * `entity` is one of: features, map_feature_pain, hardware_attributes, content.
 */
function compile(blocks = readBlocks()) {
  const active = blocks.filter((b) => b.active);

  function evaluate(entity, row, actionKind) {
    for (const block of active) {
      if (block.scope.entity !== entity) continue;
      if (block.action.kind !== actionKind) continue;

      const column = block.scope.column;
      const candidates = column === '*'
        ? Object.keys(row).filter((k) => !k.startsWith('_'))
        : [column];

      for (const key of candidates) {
        const actualKey = Object.keys(row).find((k) => k.toLowerCase() === key.toLowerCase());
        const value = actualKey ? row[actualKey] : (column === '*' ? '' : undefined);
        if (block.match === 'all' || block.test(value)) {
          return block;
        }
      }
    }
    return null;
  }

  return {
    blocks,
    active,

    /** Returns the blocking rule, or null when the row survives. */
    excludedBy(entity, row) {
      return evaluate(entity, row, 'exclude');
    },

    /** Returns the badge rule that applies to this row, or null. */
    badgeFor(entity, row) {
      const block = evaluate(entity, row, 'badge');
      return block ? { blockId: block.id, label: block.action.label } : null;
    },

    summary() {
      return active.map((b) => ({
        id: b.id,
        scope: `${b.scope.entity}.${b.scope.column}`,
        match: b.match,
        pattern: b.pattern,
        action: b.action.kind === 'badge' ? `badge:${b.action.label}` : b.action.kind
      }));
    }
  };
}

/** Append a row to the change log: every change to tables or config gets a line here. */
function appendLogEntry({ action, description, path: touched, date }) {
  const table = tables.readTable(paths.STATE_FILE, LOG_HEADERS);
  if (!table) {
    throw new Error(`Change log table not found in ${paths.contract(paths.STATE_FILE)}`);
  }

  table.append([{
    Date: date || new Date().toISOString().slice(0, 10),
    Action: action,
    Description: description,
    Path: Array.isArray(touched) ? touched.join(', ') : touched
  }]);

  return table.save();
}

module.exports = {
  readBlocks,
  compile,
  appendLogEntry,
  BLOCK_HEADERS,
  LOG_HEADERS
};
