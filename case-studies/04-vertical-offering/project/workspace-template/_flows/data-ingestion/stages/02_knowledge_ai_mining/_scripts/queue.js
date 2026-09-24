'use strict';

/**
 * Active/Resolved Verification Queue access, shared by stage 02 (writes new
 * Active entries), stage 02.5 (reads a reviewer's Active entries) and stage
 * 02.6 (moves entries to Resolved).
 */

const paths = require('../../../../_lib/paths');
const tables = require('../../../../_lib/tables');

const ACTIVE_HEADERS = ['Entry_ID', 'Table', 'Content_Summary', 'Proposed_By', 'PM_Assigned', 'Date_Added', 'Status', 'Deadline'];
const RESOLVED_HEADERS = ['Entry_ID', 'Table', 'Content_Summary', 'Decision', 'Decision_By', 'Decision_Date', 'Notes'];

function queueFile() {
  return paths.project('_state', 'verification_queue.md');
}

function readActive() {
  const t = tables.readTable(queueFile(), ACTIVE_HEADERS);
  if (!t) throw new Error(`Active Queue table not found in ${paths.contract(queueFile())}`);
  return t;
}

function readResolved() {
  const t = tables.readTable(queueFile(), RESOLVED_HEADERS);
  if (!t) throw new Error(`Resolved Queue table not found in ${paths.contract(queueFile())}`);
  return t;
}

/** Returns a function that turns a 1-based batch offset into the next free VQ-### id. */
function entryIdAllocator() {
  const active = readActive();
  const resolved = readResolved();
  const nums = [...active.values('Entry_ID'), ...resolved.values('Entry_ID')]
    .map((id) => { const m = /^VQ-(\d+)$/i.exec(String(id).trim()); return m ? parseInt(m[1], 10) : null; })
    .filter((n) => n !== null);
  const base = nums.length ? Math.max(...nums) : 0;
  return (offset) => 'VQ-' + String(base + offset).padStart(3, '0');
}

function appendEntries(entries) {
  if (!entries.length) return;
  const active = readActive();
  active.append(entries);
  active.save();
}

function forPm(pmId) {
  const active = readActive();
  return active.rows.filter((r) => String(r.PM_Assigned).trim() === String(pmId).trim());
}

/** Move one entry from Active to Resolved. Returns the removed row, or null if not found. */
function moveToResolved(entryId, { decision, decisionBy, decisionDate, notes }) {
  const active = readActive();
  const idx = active.rows.findIndex((r) => String(r.Entry_ID).trim() === String(entryId).trim());
  if (idx === -1) return null;

  const row = active.rows[idx];
  const summary = { Entry_ID: row.Entry_ID, Table: row.Table, Content_Summary: row.Content_Summary };
  active.rows.splice(idx, 1);
  active.save();

  const resolved = readResolved();
  resolved.append([{
    ...summary,
    Decision: decision,
    Decision_By: decisionBy,
    Decision_Date: decisionDate,
    Notes: notes || '—'
  }]);
  resolved.save();

  return row;
}

module.exports = {
  ACTIVE_HEADERS,
  RESOLVED_HEADERS,
  queueFile,
  readActive,
  readResolved,
  entryIdAllocator,
  appendEntries,
  forPm,
  moveToResolved
};
