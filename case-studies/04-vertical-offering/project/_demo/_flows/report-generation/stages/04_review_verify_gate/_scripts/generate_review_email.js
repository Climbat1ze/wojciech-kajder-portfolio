'use strict';

/**
 * Group a build's in-scope features by owning reviewer (PM) and render one
 * review email per reviewer. Only reviewers who actually have content in
 * this specific build are contacted — not a fixed roster.
 */

const owners = require('../../../../_lib/owners');

function groupByOwner(scope) {
  const byPm = new Map();
  const unassigned = [];

  const seen = new Set();
  for (const pain of scope.pains) {
    for (const f of pain.features) {
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      const owner = owners.resolveProduct(f.product);
      if (owner.resolved && owner.assigned) {
        if (!byPm.has(owner.pmId)) byPm.set(owner.pmId, { pm: owners.person(owner.pmId), features: [] });
        byPm.get(owner.pmId).features.push(f);
      } else {
        unassigned.push(f);
      }
    }
  }

  return { byPm, unassigned };
}

function renderEmail({ pmName, buildId, vertical, features, deadline }) {
  const items = features.map((f) => `<li><strong>${f.name}</strong> (${f.product}) — ${f.description}</li>`).join('\n');
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:640px;margin:0 auto;padding:20px;">
<h2>Vertical Offering Review — ${vertical.name} (${buildId})</h2>
<p>Hi ${pmName},</p>
<p>A Vertical Offering build for <strong>${vertical.name}</strong> includes content from your product(s). Please review your section(s) below.</p>
<ul>${items}</ul>
<p>Deadline: <strong>${deadline}</strong></p>
<p>Reply with "Approved" if the section is accurate, or describe what needs to change.</p>
</body></html>`;
}

module.exports = { groupByOwner, renderEmail };
