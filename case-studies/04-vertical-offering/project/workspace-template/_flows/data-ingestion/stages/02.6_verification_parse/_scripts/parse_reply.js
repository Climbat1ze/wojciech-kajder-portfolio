'use strict';

/**
 * Parse a reviewer's free-text reply into accept/correct/reject decisions,
 * each tied to an item number from the verification email they're replying
 * to.
 *
 * Three verdicts, not two. Recording a wording complaint as a rejection
 * would permanently remove a correctable row from the catalogue — rejection
 * here does not delete or flag the underlying row (see run.js), but it does
 * mean the row stays PROPOSED forever with no further path to VERIFIED.
 * `correct` keeps that path open: the item stays in the Active Queue for a
 * human to fix the wording and re-send.
 */

const ACCEPT_RE = /\b(?:accept|akceptuj[eę]?|ok for)\s+([\d,\s]+)/gi;
const CORRECT_RE = /\b(?:correct|popraw|korekta|do poprawy)\s+(\d+)\s*(?:\(([^)]*)\))?/gi;
const REJECT_RE = /\b(?:reject|odrzu[cć]am?|nie dla)\s+(\d+)\s*(?:\(([^)]*)\)|:\s*(.*))?/gi;

function numbersFrom(match) {
  return match[1].split(/[,\s]+/).map((s) => s.trim()).filter(Boolean).map(Number);
}

/**
 * Parse free-text reply. Returns { accepted: [n...], corrected: [{n, note}],
 * rejected: [{n, reason}] }. A number may appear only once across the three
 * lists; if the text mentions it more than once, the last mention wins.
 */
function parseFreeText(text) {
  const decisions = new Map(); // number -> {verdict, note}

  let m;
  ACCEPT_RE.lastIndex = 0;
  while ((m = ACCEPT_RE.exec(text))) {
    for (const n of numbersFrom(m)) decisions.set(n, { verdict: 'accept' });
  }
  CORRECT_RE.lastIndex = 0;
  while ((m = CORRECT_RE.exec(text))) {
    decisions.set(Number(m[1]), { verdict: 'correct', note: (m[2] || '').trim() });
  }
  REJECT_RE.lastIndex = 0;
  while ((m = REJECT_RE.exec(text))) {
    decisions.set(Number(m[1]), { verdict: 'reject', note: (m[2] || m[3] || '').trim() });
  }

  const accepted = [];
  const corrected = [];
  const rejected = [];
  for (const [n, d] of decisions) {
    if (d.verdict === 'accept') accepted.push(n);
    else if (d.verdict === 'correct') corrected.push({ n, note: d.note });
    else rejected.push({ n, reason: d.note });
  }

  return { accepted, corrected, rejected };
}

module.exports = { parseFreeText };
