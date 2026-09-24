'use strict';

/**
 * Markdown reference-table access for _data/.
 *
 * Design constraints:
 *
 * 1. Tables are identified by their HEADER, never by row content. A file can
 *    carry more than one table (a data table plus, say, a coverage-map table
 *    lower down); a content-matching parser risks reading the wrong one as a
 *    duplicate of the first.
 *
 * 2. Columns are addressed by name, never by position. Not every catalogue
 *    file has the same column set (a feature file may carry an optional extra
 *    column another one does not).
 *
 * 3. Everything outside the table region is preserved byte-for-byte. These
 *    files are meant to be edited by hand and may carry HTML comments, prose
 *    and secondary tables that must survive a programmatic write.
 *
 * 4. Writes never reorder or rewrite rows the caller did not touch.
 */

const fs = require('fs');
const path = require('path');

const CANONICAL_FEATURE_HEADERS = ['F_ID', 'Feature', 'Product', 'Description', 'Source', 'Status'];

// ---------------------------------------------------------------- cell codec

/** Split a markdown table row into cells, honouring backslash-escaped pipes. */
function splitRow(line) {
  const cells = [];
  let current = '';
  let escaped = false;

  for (const ch of line.trim()) {
    if (escaped) {
      current += ch === '|' ? '|' : '\\' + ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '|') { cells.push(current); current = ''; continue; }
    current += ch;
  }
  cells.push(current);

  // A well-formed row starts and ends with a pipe, producing empty edge cells.
  if (cells.length && cells[0].trim() === '') cells.shift();
  if (cells.length && cells[cells.length - 1].trim() === '') cells.pop();

  return cells.map((c) => c.trim());
}

/** Encode a value for use inside a markdown table cell. */
function encodeCell(value) {
  if (value === null || value === undefined) return '—';
  return String(value)
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function isTableLine(line) {
  return line.trim().startsWith('|');
}

function isSeparatorLine(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return false;
  return /^\|[\s:|-]+\|?$/.test(trimmed) && trimmed.includes('-');
}

// ------------------------------------------------------------------ parsing

/**
 * Find every markdown table in a list of lines.
 * Returns descriptors with absolute line indices into `lines`.
 */
function locateTables(lines) {
  const tables = [];

  for (let i = 0; i < lines.length - 1; i++) {
    if (!isTableLine(lines[i]) || !isSeparatorLine(lines[i + 1])) continue;
    if (isSeparatorLine(lines[i])) continue;

    const headers = splitRow(lines[i]);
    const dataStart = i + 2;
    let end = dataStart;
    while (end < lines.length && isTableLine(lines[end])) end++;

    tables.push({
      headerIndex: i,
      separatorIndex: i + 1,
      dataStart,
      dataEnd: end, // exclusive
      headers
    });

    i = end - 1;
  }

  return tables;
}

function headerMatches(headers, required) {
  const present = new Set(headers.map((h) => h.toLowerCase()));
  return required.every((r) => present.has(r.toLowerCase()));
}

// -------------------------------------------------------------- Table class

class Table {
  constructor(filePath, lines, descriptor, eol) {
    this.filePath = filePath;
    this._lines = lines;
    this._descriptor = descriptor;
    this._eol = eol;
    this.headers = descriptor.headers.slice();

    this.rows = [];
    for (let i = descriptor.dataStart; i < descriptor.dataEnd; i++) {
      const cells = splitRow(this._lines[i]);
      this.rows.push(this._makeRow(cells, i));
    }
  }

  _makeRow(cells, lineIndex) {
    const row = { _lineIndex: lineIndex, _cells: cells.slice() };
    this.headers.forEach((header, idx) => {
      row[header] = cells[idx] !== undefined ? cells[idx] : '';
    });
    return row;
  }

  /** Case-insensitive column lookup; returns the canonical header or null. */
  column(name) {
    const found = this.headers.find((h) => h.toLowerCase() === String(name).toLowerCase());
    return found || null;
  }

  has(name) {
    return this.column(name) !== null;
  }

  value(row, name) {
    const col = this.column(name);
    return col ? row[col] : undefined;
  }

  find(predicate) {
    return this.rows.filter(predicate);
  }

  /** Values of one column across all rows, blanks dropped. */
  values(name) {
    const col = this.column(name);
    if (!col) return [];
    return this.rows.map((r) => r[col]).filter((v) => v !== undefined && v !== '' && v !== '—');
  }

  /** Append rows given as plain objects keyed by header name. */
  append(objects) {
    for (const obj of objects) {
      const cells = this.headers.map((h) => {
        const key = Object.keys(obj).find((k) => k.toLowerCase() === h.toLowerCase());
        return encodeCell(key === undefined ? '' : obj[key]);
      });
      this.rows.push(this._makeRow(cells, -1));
    }
    return this;
  }

  /** Set one cell on an existing row. */
  set(row, name, value) {
    const col = this.column(name);
    if (!col) throw new Error(`Column not found in ${path.basename(this.filePath)}: ${name}`);
    const idx = this.headers.indexOf(col);
    row[col] = encodeCell(value);
    row._cells[idx] = row[col];
    row._dirty = true;
    return this;
  }

  /**
   * Add a column to the table. `fill` is either a literal or a function
   * receiving each row. Existing rows are backfilled; the header and
   * separator lines are rewritten.
   */
  addColumn(name, fill) {
    if (this.has(name)) return this;
    this.headers.push(name);
    for (const row of this.rows) {
      const value = encodeCell(typeof fill === 'function' ? fill(row) : fill);
      row[name] = value;
      row._cells.push(value);
    }
    this._descriptor.headersChanged = true;
    return this;
  }

  _renderRow(cells) {
    return '| ' + cells.map((c) => (c === '' ? '—' : c)).join(' | ') + ' |';
  }

  /** Rebuild the file content with the table region replaced. */
  render() {
    const d = this._descriptor;
    const before = this._lines.slice(0, d.headerIndex);
    const after = this._lines.slice(d.dataEnd);

    const headerLine = this._renderRow(this.headers);
    const separatorLine = '|' + this.headers.map((h) => '-'.repeat(Math.max(3, h.length + 2))).join('|') + '|';

    const bodyLines = this.rows.map((row) => {
      // Untouched rows keep their original formatting verbatim.
      if (row._lineIndex >= 0 && !d.headersChanged && !row._dirty) {
        return this._lines[row._lineIndex];
      }
      const cells = this.headers.map((h, i) => (row._cells[i] !== undefined ? row._cells[i] : ''));
      return this._renderRow(cells);
    });

    const headerBlock = d.headersChanged
      ? [headerLine, separatorLine]
      : [this._lines[d.headerIndex], this._lines[d.separatorIndex]];

    return before.concat(headerBlock, bodyLines, after).join(this._eol);
  }

  save() {
    fs.writeFileSync(this.filePath, this.render(), 'utf8');
    return this.filePath;
  }
}

// -------------------------------------------------------------- public API

function detectEol(content) {
  return content.includes('\r\n') ? '\r\n' : '\n';
}

/**
 * Strip a UTF-8 byte order mark. These files are meant to be hand-edited, and
 * several editors add a BOM on save; left in place it glues itself to the
 * first cell of the first table or to a leading HTML comment.
 */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * Read the table in `filePath` whose header contains every column in
 * `requiredHeaders`. Returns null when the file has no such table.
 */
function readTable(filePath, requiredHeaders) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Table file not found: ${filePath}`);
  }
  const content = stripBom(fs.readFileSync(filePath, 'utf8'));
  const eol = detectEol(content);
  const lines = content.split(/\r?\n/);
  const descriptors = locateTables(lines);

  const required = requiredHeaders && requiredHeaders.length ? requiredHeaders : null;
  const match = required
    ? descriptors.find((d) => headerMatches(d.headers, required))
    : descriptors[0];

  if (!match) return null;
  return new Table(filePath, lines, match, eol);
}

/** Every table in a file, for inspection and diagnostics. */
function readAllTables(filePath) {
  const content = stripBom(fs.readFileSync(filePath, 'utf8'));
  const eol = detectEol(content);
  const lines = content.split(/\r?\n/);
  return locateTables(lines).map((d) => new Table(filePath, lines, d, eol));
}

/** Feature files that actually declare a canonical feature table. */
function readFeatureTables(featuresDir) {
  const result = [];
  for (const name of fs.readdirSync(featuresDir).sort()) {
    if (!name.endsWith('.md')) continue;
    const filePath = path.join(featuresDir, name);
    const table = readTable(filePath, CANONICAL_FEATURE_HEADERS);
    if (table) result.push({ file: name, path: filePath, table });
  }
  return result;
}

/** All feature rows across all catalogues, each tagged with its source file. */
function readAllFeatures(featuresDir) {
  const features = [];
  for (const { file, table } of readFeatureTables(featuresDir)) {
    for (const row of table.rows) {
      features.push({ ...row, _file: file });
    }
  }
  return features;
}

function parseNumericId(id, prefix) {
  const match = new RegExp(`^${prefix}(\\d+)$`, 'i').exec(String(id).trim());
  return match ? parseInt(match[1], 10) : null;
}

/** Highest F_ID across every feature catalogue — F_ID is a single global sequence. */
function maxFeatureId(featuresDir) {
  const numbers = readAllFeatures(featuresDir)
    .map((f) => parseNumericId(f.F_ID, 'F'))
    .filter((n) => n !== null);
  return numbers.length ? Math.max(...numbers) : 0;
}

/** Zero-pad an ID number to at least 2 digits, per this project's ID convention (F01, P01, ...). */
function padId(n) {
  return String(n).padStart(2, '0');
}

function nextFeatureId(featuresDir) {
  return 'F' + padId(maxFeatureId(featuresDir) + 1);
}

/** Duplicate F_IDs across catalogues, which the global-sequence rule forbids. */
function findDuplicateFeatureIds(featuresDir) {
  const seen = new Map();
  for (const feature of readAllFeatures(featuresDir)) {
    const id = String(feature.F_ID).trim();
    if (!id) continue;
    if (!seen.has(id)) seen.set(id, []);
    seen.get(id).push(feature._file);
  }
  return [...seen.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([id, files]) => ({ id, files }));
}

module.exports = {
  CANONICAL_FEATURE_HEADERS,
  readTable,
  readAllTables,
  readFeatureTables,
  readAllFeatures,
  maxFeatureId,
  nextFeatureId,
  findDuplicateFeatureIds,
  parseNumericId,
  padId,
  splitRow,
  encodeCell,
  stripBom,
  Table
};
