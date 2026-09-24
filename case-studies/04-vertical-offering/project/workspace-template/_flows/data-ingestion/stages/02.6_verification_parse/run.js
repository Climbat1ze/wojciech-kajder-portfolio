#!/usr/bin/env node
'use strict';

/**
 * Stage 02.6 — Verification Parse.
 *
 * Parses a reviewer's reply, resolves item numbers against the SAME
 * numbering their verification email used (Stage 02.5's own
 * export_report.json — never recomputed against a possibly-changed live
 * queue), and applies the decisions:
 *
 *   accept  -> _data/*.md row: Status PROPOSED -> VERIFIED. Queue: Active -> Resolved.
 *   correct -> item stays in the Active Queue. Nothing in _data changes.
 *              Fix the wording by hand, then re-run Stage 02.5 for this reviewer.
 *   reject  -> Queue: Active -> Resolved, with the reason. The underlying
 *              _data/*.md row is left untouched at Status = PROPOSED — this
 *              project does not write a REJECTED status into _data/*.md; the
 *              rejection and its reason live only in _state/pm_responses.md.
 */

const fs = require('fs');
const path = require('path');
const paths = require('../../../_lib/paths');
const tables = require('../../../_lib/tables');
const { ArtifactBuilder } = require('../../../_lib/artifact');
const { log } = require('../../../_lib/log');

const queue = require('../02_knowledge_ai_mining/_scripts/queue');
const { parseFreeText } = require('./_scripts/parse_reply');

const STAGE_ID = '02.6';
const STAGE_NAME = 'Verification Parse';

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pm') opts.pm = argv[++i];
    else if (a === '--email') opts.email = argv[++i];
    else if (a === '--email-file') opts.emailFile = argv[++i];
  }
  return opts;
}

function loadNumberMap(pm) {
  const exportReportPath = path.join(__dirname, '..', '02.5_verification_export', 'output', 'export_report.json');
  if (!fs.existsSync(exportReportPath)) {
    throw new Error('No export_report.json found. Run Stage 02.5 for this reviewer first.');
  }
  const report = JSON.parse(fs.readFileSync(exportReportPath, 'utf8'));
  if (!report.data || report.data.pm !== pm) {
    throw new Error(`The latest Stage 02.5 export was for "${report.data ? report.data.pm : 'unknown'}", not "${pm}". Re-run Stage 02.5 --pm ${pm} first.`);
  }
  return report.data.number_to_entry_id;
}

/** Flip Status -> VERIFIED on the _data row(s) this Active Queue entry describes. */
function markVerified(queueRow) {
  if (queueRow.Table.startsWith('features/')) {
    const file = paths.project('_data', queueRow.Table);
    const t = tables.readTable(file, tables.CANONICAL_FEATURE_HEADERS);
    const id = queueRow.Content_Summary.split(':')[0].trim();
    const row = t ? t.rows.find((r) => String(r.F_ID).trim() === id) : null;
    if (row) { t.set(row, 'Status', 'VERIFIED'); t.save(); return true; }
    return false;
  }
  if (queueRow.Table === 'pain_points.md') {
    const t = tables.readTable(paths.project('_data', 'pain_points.md'), ['P_ID', 'Pain Point']);
    const id = queueRow.Content_Summary.split(':')[0].trim();
    const row = t ? t.rows.find((r) => String(r.P_ID).trim() === id) : null;
    if (row) { t.set(row, 'Status', 'VERIFIED'); t.save(); return true; }
    return false;
  }
  if (queueRow.Table === 'map_feature_pain.md') {
    const [fId, pId] = queueRow.Content_Summary.split('->').map((s) => s.trim());
    const t = tables.readTable(paths.project('_data', 'map_feature_pain.md'), ['F_ID', 'P_ID']);
    const row = t ? t.rows.find((r) => String(r.F_ID).trim() === fId && String(r.P_ID).trim() === pId) : null;
    if (row) { t.set(row, 'Status', 'VERIFIED'); t.save(); return true; }
    return false;
  }
  return false;
}

function appendResponseLog({ pm, accepted, rejected, corrected, rawText }) {
  const file = paths.project('_state', 'pm_responses.md');
  const headers = ['Resp_ID', 'PM_ID', 'Date', 'Entries_Accepted', 'Entries_Rejected', 'Corrections_Requested', 'Raw_Text', 'Parsed_By'];
  const t = tables.readTable(file, headers);
  if (!t) throw new Error(`Response log table not found in ${paths.contract(file)}`);

  const nums = t.values('Resp_ID').map((v) => { const m = /^RESP-(\d+)$/i.exec(v.trim()); return m ? parseInt(m[1], 10) : null; }).filter((n) => n !== null);
  const respId = 'RESP-' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');

  t.append([{
    Resp_ID: respId,
    PM_ID: pm,
    Date: new Date().toISOString().slice(0, 10),
    Entries_Accepted: accepted.join(', ') || '—',
    Entries_Rejected: rejected.map((r) => `${r.entryId} (${r.reason || 'no reason given'})`).join('; ') || '—',
    Corrections_Requested: corrected.map((c) => `${c.entryId}: ${c.note || 'no detail given'}`).join('; ') || '—',
    Raw_Text: rawText.replace(/\n/g, ' ').slice(0, 500),
    Parsed_By: 'Stage 02.6'
  }]);
  t.save();
  return respId;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const builder = new ArtifactBuilder(__dirname, STAGE_ID, STAGE_NAME);

  try {
    if (!opts.pm) throw new Error('--pm <PM_ID> is required');
    const text = opts.emailFile ? fs.readFileSync(paths.expand(opts.emailFile), 'utf8') : opts.email;
    if (!text) throw new Error('Provide the reply via --email "..." or --email-file <path>');

    const numberMap = loadNumberMap(opts.pm);
    const decisions = parseFreeText(text);

    if (!decisions.accepted.length && !decisions.corrected.length && !decisions.rejected.length) {
      builder.warn('No accept/correct/reject decisions found in the reply. Expected e.g. "accept 1, 2" or "reject 3 (reason)".');
    }

    const acceptedIds = [];
    const rejectedIds = [];
    const correctedIds = [];

    for (const n of decisions.accepted) {
      const entryId = numberMap[n];
      if (!entryId) { builder.warn(`Item #${n} not found in this reviewer's export — skipping.`); continue; }
      const row = queue.moveToResolved(entryId, { decision: 'ACCEPTED', decisionBy: opts.pm, decisionDate: new Date().toISOString().slice(0, 10) });
      if (!row) { builder.warn(`${entryId} was already resolved.`); continue; }
      const wrote = markVerified(row);
      if (!wrote) builder.warn(`${entryId} accepted, but its underlying _data row could not be located to mark VERIFIED.`);
      acceptedIds.push(entryId);
    }

    for (const { n, reason } of decisions.rejected) {
      const entryId = numberMap[n];
      if (!entryId) { builder.warn(`Item #${n} not found in this reviewer's export — skipping.`); continue; }
      const row = queue.moveToResolved(entryId, { decision: 'REJECTED', decisionBy: opts.pm, decisionDate: new Date().toISOString().slice(0, 10), notes: reason });
      if (!row) { builder.warn(`${entryId} was already resolved.`); continue; }
      rejectedIds.push({ entryId, reason });
    }

    for (const { n, note } of decisions.corrected) {
      const entryId = numberMap[n];
      if (!entryId) { builder.warn(`Item #${n} not found in this reviewer's export — skipping.`); continue; }
      correctedIds.push({ entryId, note });
    }

    const respId = appendResponseLog({ pm: opts.pm, accepted: acceptedIds, rejected: rejectedIds, corrected: correctedIds, rawText: text });

    builder.payload({ pm: opts.pm, response_id: respId, accepted: acceptedIds, rejected: rejectedIds, corrected: correctedIds });
    builder.counts({ accepted: acceptedIds.length, rejected: rejectedIds.length, corrected: correctedIds.length });

    log.ok(`${respId}: ${acceptedIds.length} accepted, ${rejectedIds.length} rejected, ${correctedIds.length} flagged for correction.`);
    if (correctedIds.length) log.info('Corrected items remain in the Active Queue — edit the wording, then re-run Stage 02.5 for this reviewer.');
  } catch (err) {
    builder.error(err.message);
    log.error(err.message);
  }

  builder.save('parse_report.json');
  return builder.exitCode;
}

if (require.main === module) {
  process.exit(main());
}
