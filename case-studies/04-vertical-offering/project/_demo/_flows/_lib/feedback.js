'use strict';

/**
 * Build feedback file access, shared by stage 04 (creates/extends it) and
 * stage 05 (reads it as the publish gate).
 *
 * The file lives at _state/[Build_ID]_build_feedback.md. It is meant to be
 * edited by a human — a PM's Status cell is how they record their decision —
 * so writes here are additive only: re-running stage 04 adds PM rows that are
 * newly needed and never touches a Status a human has already set.
 */

const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const tables = require('./tables');

const PM_HEADERS = ['PM_ID', 'PM_Name', 'Section(s)', 'Status', 'Comment', 'Timestamp'];
const BUILD_INFO_HEADERS = ['Field', 'Value'];
const BUILD_STATUS_HEADERS = ['Stage', 'Status', 'Date'];

const STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  CHANGES_NEEDED: 'Changes Needed',
  BLOCKED: 'Blocked'
};

function filePath(buildId) {
  return path.join(paths.STATE_DIR, `${buildId}_build_feedback.md`);
}

function render({ buildId, buildDate, vertical, mode, draftMd, draftHtml, deadline, pmRows }) {
  const pmTableRows = pmRows.map((r) =>
    `| ${r.pmId} | ${r.pmName} | ${r.sections} | ${STATUS.PENDING} | — | — |`
  ).join('\n');

  return `# Vertical Offering — Build Feedback

**Build ID:** \`${buildId}\`

**Purpose:** Collect reviewer feedback on a compiled Vertical Offering deck (Stage 04)
**Layer:** L4 — Working Artifact

---

## Build Information

| Field | Value |
|-------|-------|
| **Build ID** | \`${buildId}\` |
| **Build Date** | \`${buildDate}\` |
| **Vertical** | \`${vertical.id} ${vertical.name}\` |
| **Mode** | \`${mode}\` |
| **Draft Location (MD)** | \`${draftMd}\` |
| **Draft Location (HTML)** | \`${draftHtml || '— stage 03.5 not run —'}\` |
| **Review Deadline** | \`${deadline}\` |

---

## Reviewer Feedback

| PM_ID | PM_Name | Section(s) | Status | Comment | Timestamp |
|-------|---------|------------|--------|---------|-----------|
${pmTableRows}

**Status Values:**
- \`Pending\` — Awaiting review
- \`Approved\` — Reviewer approved their section
- \`Changes Needed\` — Reviewer requested changes
- \`Blocked\` — Critical issue, cannot proceed

---

## Change Requests

| CR_ID | PM_ID | Section | Change_Description | Priority | Status | Resolved_By | Resolved_At |
|-------|-------|---------|-------------------|----------|--------|-------------|-------------|
| — | — | — | — | — | — | — | — |

---

## Build Status

| Stage | Status | Date |
|-------|--------|------|
| Build Completed (Stage 03) | Done | ${buildDate} |
| Feedback Collection (Stage 04) | In Progress | ${buildDate} |
| All Reviewers Approved | Pending | — |
| Ready for Publish (Stage 05) | Pending | — |

---

**Update process:** stage 04 adds reviewer rows as builds require them; each reviewer edits their own Status/Comment cells.
`;
}

/**
 * Create the feedback file if it does not exist, or extend it if it does.
 * Never overwrites a Status a human has already set.
 *
 * Returns { created, addedPMs, filePath }.
 */
function ensureFile(params) {
  const target = filePath(params.buildId);

  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, render(params), 'utf8');
    return { created: true, addedPMs: params.pmRows.map((r) => r.pmId), path: target };
  }

  const table = tables.readTable(target, PM_HEADERS);
  if (!table) {
    throw new Error(`${paths.contract(target)} exists but has no recognisable Reviewer Feedback table`);
  }

  const existing = new Set(table.values('PM_ID'));
  const toAdd = params.pmRows.filter((r) => !existing.has(r.pmId));

  if (toAdd.length) {
    table.append(toAdd.map((r) => ({
      PM_ID: r.pmId,
      PM_Name: r.pmName,
      'Section(s)': r.sections,
      Status: STATUS.PENDING,
      Comment: '—',
      Timestamp: '—'
    })));
    table.save();
  }

  return { created: false, addedPMs: toAdd.map((r) => r.pmId), path: target };
}

/** Read reviewer rows: [{pmId, pmName, sections, status, comment, timestamp}]. */
function readPmFeedback(buildId) {
  const target = filePath(buildId);
  if (!fs.existsSync(target)) {
    throw new Error(`Feedback file not found: ${paths.contract(target)}. Run stage 04 first.`);
  }
  const table = tables.readTable(target, PM_HEADERS);
  if (!table) throw new Error(`${paths.contract(target)} has no Reviewer Feedback table`);

  return table.rows
    .filter((r) => String(r.PM_ID).trim() && String(r.PM_ID).trim() !== '—')
    .map((r) => ({
      pmId: String(r.PM_ID).trim(),
      pmName: String(r.PM_Name).trim(),
      sections: String(r['Section(s)']).trim(),
      status: String(r.Status).trim(),
      comment: String(r.Comment).trim(),
      timestamp: String(r.Timestamp).trim()
    }));
}

function readBuildInfo(buildId) {
  const target = filePath(buildId);
  const table = tables.readTable(target, BUILD_INFO_HEADERS);
  if (!table) return {};
  const info = {};
  for (const row of table.rows) {
    const key = String(row.Field).replace(/\*/g, '').trim();
    info[key] = String(row.Value).replace(/`/g, '').trim();
  }
  return info;
}

/** Which reviewers have not approved yet, with their current status. */
function pendingApprovals(rows) {
  return rows.filter((r) => r.status !== STATUS.APPROVED);
}

/** Update a named row in the Build Status table (matched by exact Stage text). */
function updateBuildStatus(buildId, stageLabel, status, date) {
  const target = filePath(buildId);
  const table = tables.readTable(target, BUILD_STATUS_HEADERS);
  if (!table) return false;

  const row = table.rows.find((r) => String(r.Stage).trim() === stageLabel);
  if (!row) return false;

  table.set(row, 'Status', status);
  table.set(row, 'Date', date);
  table.save();
  return true;
}

module.exports = {
  STATUS,
  filePath,
  render,
  ensureFile,
  readPmFeedback,
  readBuildInfo,
  pendingApprovals,
  updateBuildStatus,
  PM_HEADERS,
  BUILD_INFO_HEADERS,
  BUILD_STATUS_HEADERS
};
