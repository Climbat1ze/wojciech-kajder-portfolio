'use strict';

/**
 * Rank in-scope pain points for a shortlist, spreading the picks across
 * clusters (round-robin) instead of letting one dominant cluster crowd out
 * the rest, then by relevance and by how much of the cluster is already
 * VERIFIED.
 */

const RELEVANCE_ORDER = { H: 3, M: 2, L: 1 };

function verifiedShare(pain) {
  const items = [...pain.features, ...pain.hardware];
  if (!items.length) return 0;
  const verified = items.filter((i) => String(i.status).trim().toUpperCase() === 'VERIFIED').length;
  return verified / items.length;
}

function rank(pains, target) {
  const byCluster = new Map();
  for (const pain of pains) {
    const cluster = pain.cluster || 'Uncategorised';
    if (!byCluster.has(cluster)) byCluster.set(cluster, []);
    byCluster.get(cluster).push(pain);
  }
  for (const list of byCluster.values()) {
    list.sort((a, b) => (RELEVANCE_ORDER[b.relevance] || 0) - (RELEVANCE_ORDER[a.relevance] || 0) || verifiedShare(b) - verifiedShare(a));
  }

  const clusters = [...byCluster.values()];
  const ordered = [];
  let round = 0;
  while (ordered.length < pains.length) {
    let addedThisRound = false;
    for (const list of clusters) {
      if (list[round]) { ordered.push(list[round]); addedThisRound = true; }
    }
    if (!addedThisRound) break;
    round++;
  }

  return ordered.map((pain, i) => ({ pain, suggested: i < target }));
}

module.exports = { rank, verifiedShare };
