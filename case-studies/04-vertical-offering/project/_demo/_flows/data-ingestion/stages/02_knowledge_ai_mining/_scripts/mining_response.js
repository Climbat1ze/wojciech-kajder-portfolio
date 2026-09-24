'use strict';

/**
 * Parse the LLM's saved reply (output/mining_response.md) into structured
 * sections. The prompt templates (_prompts/analyze_source.md,
 * _prompts/map_gaps.md) define the exact section headings and column order
 * this parser expects.
 */

const tables = require('../../../../_lib/tables');

/** Find the first markdown table within an array of lines. */
function extractTable(lines) {
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    const next = lines[i + 1].trim();
    if (!line.startsWith('|') || line.startsWith('|--')) continue;
    if (!next.startsWith('|') || !/^\|[\s:|-]+\|?$/.test(next) || !next.includes('-')) continue;

    const headers = tables.splitRow(lines[i]);
    const rows = [];
    let j = i + 2;
    while (j < lines.length && lines[j].trim().startsWith('|')) {
      rows.push(tables.splitRow(lines[j]));
      j++;
    }
    return { headers, rows };
  }
  return null;
}

function rowsAsObjects(extracted) {
  if (!extracted) return [];
  return extracted.rows.map((cells) => {
    const obj = {};
    extracted.headers.forEach((h, i) => { obj[h] = cells[i] !== undefined ? cells[i] : ''; });
    return obj;
  });
}

function splitSections(content) {
  const lines = content.split(/\r?\n/);
  const sections = [];
  let current = null;
  for (const line of lines) {
    const h = /^##\s+(.+)$/.exec(line);
    if (h) { current = { heading: h[1].trim(), lines: [] }; sections.push(current); continue; }
    if (current) current.lines.push(line);
  }
  return sections;
}

/**
 * Parse a full mining response into named sections. Any section this parser
 * does not recognise (or that has no table) is simply absent from the
 * result — a stricter prompt to the LLM is the fix, not looser parsing here.
 */
function parse(content) {
  const sections = splitSections(content);
  const result = {
    features: [],
    pain_points: [],
    map_feature_pain: [],
    map_pain_vertical: [],
    sources: [],
    unmappable: []
  };

  for (const s of sections) {
    const table = extractTable(s.lines);
    if (!table) continue;
    const rows = rowsAsObjects(table);

    if (/proposed features/i.test(s.heading)) result.features.push(...rows);
    else if (/proposed pain points/i.test(s.heading)) result.pain_points.push(...rows);
    else if (/map_feature_pain/i.test(s.heading)) result.map_feature_pain.push(...rows);
    else if (/map_pain_vertical/i.test(s.heading)) result.map_pain_vertical.push(...rows);
    else if (/proposed sources/i.test(s.heading)) result.sources.push(...rows);
    else if (/unmappable/i.test(s.heading)) result.unmappable.push(...rows);
  }

  return result;
}

module.exports = { parse, extractTable, rowsAsObjects, splitSections };
