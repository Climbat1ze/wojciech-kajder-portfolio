'use strict';

/**
 * Render resolved scope into slide-delimited Markdown (separator `---`,
 * Marp/reveal.js convention). Deterministic — no invented content, every
 * line traces to a table row.
 */

function badge(status) {
  const s = String(status || '').trim().toUpperCase();
  if (s === 'VERIFIED') return '[VERIFIED]';
  if (s === 'TBC') return '[TBC]';
  return '[PROPOSED]';
}

function renderTitleSlide(config) {
  return [
    `# ${config.vertical.name} — Vertical Offering`,
    '',
    config.vertical.description || '_(no description on file)_',
    '',
    '```notes',
    `Mode: ${config.mode} | Threshold: ${config.relevance_threshold} | Language: ${config.language}`,
    '```'
  ].join('\n');
}

function renderScopeBoard(scope, config) {
  const byCluster = new Map();
  for (const pain of scope.pains) {
    const cluster = pain.cluster || 'Uncategorised';
    if (!byCluster.has(cluster)) byCluster.set(cluster, []);
    byCluster.get(cluster).push(pain);
  }

  const lines = ['# Scope Board', '', '| Pain | Features | Hardware |', '|---|---|---|'];
  for (const [cluster, pains] of byCluster) {
    lines.push(`| **${cluster}** | | |`);
    for (const pain of pains) {
      const features = pain.features.map((f) => f.name).join(', ') || '—';
      const hardware = pain.hardware.map((h) => h.attribute).join(', ') || '—';
      lines.push(`| ${pain.id}: ${pain.name} | ${features} | ${hardware} |`);
    }
  }
  lines.push('', '```notes', 'One-screen view of the whole offering for this vertical.', '```');
  return lines.join('\n');
}

function renderPainSlide(pain, config) {
  const lines = [
    `# ${pain.cluster || 'Uncategorised'}`,
    `## ${pain.id}: ${pain.name}`,
    '',
    pain.description,
    '',
    `Relevance: ${pain.relevance}${config.mode === 'internal' ? ` · Mapping ${badge(pain.mappingStatus)}` : ''}`,
    ''
  ];

  if (pain.features.length) {
    lines.push('### Addressing features', '');
    for (const f of pain.features) {
      const tag = config.mode === 'internal' ? ` ${badge(f.status)}` : '';
      // The feature itself and its mapping to THIS pain are verified
      // independently — a verified feature can still have an unconfirmed
      // link to a specific pain, so show both when they disagree.
      const mappingTag = (config.mode === 'internal' && f.mappingStatus && f.mappingStatus.trim().toUpperCase() !== f.status.trim().toUpperCase())
        ? ` (mapping ${badge(f.mappingStatus)})` : '';
      const blockBadge = f.badge ? ` [${f.badge.label}]` : '';
      lines.push(`- **${f.name}**${tag}${mappingTag}${blockBadge} (${f.product}) — ${f.howItAddresses}`);
      if (config.mode === 'internal') lines.push(`  - Source: ${f.source}`);
    }
    lines.push('');
  }

  if (pain.hardware.length) {
    lines.push('### Hardware', '');
    for (const h of pain.hardware) {
      const tag = config.mode === 'internal' ? ` ${badge(h.status)}` : '';
      const blockBadge = h.badge ? ` [${h.badge.label}]` : '';
      const value = h.status && h.status.trim().toUpperCase() === 'TBC' ? 'TBC (subject to confirmed spec)' : h.value;
      lines.push(`- **${h.attribute}**${tag}${blockBadge}: ${value} — ${h.howItAddresses}`);
    }
    lines.push('');
  }

  if (!pain.features.length && !pain.hardware.length) {
    lines.push('_No features or hardware attributes are in scope for this pain point yet._', '');
  }

  lines.push('```notes', `Pain point ${pain.id}, cluster ${pain.cluster}.`, '```');
  return lines.join('\n');
}

function renderHardwareSlide(scope, config) {
  const seen = new Map();
  for (const pain of scope.pains) {
    for (const h of pain.hardware) if (!seen.has(h.id)) seen.set(h.id, h);
  }
  if (!seen.size) return null;

  const lines = ['# Hardware Platform', '', '| ID | Attribute | Value / Spec | Status |', '|---|---|---|---|'];
  for (const h of seen.values()) {
    lines.push(`| ${h.id} | ${h.attribute} | ${h.value} | ${h.status} |`);
  }
  lines.push('', '```notes', 'Hardware specifications default to TBC until confirmed by an authoritative datasheet.', '```');
  return lines.join('\n');
}

function renderAnnexSlide(scope, config) {
  if (!scope.annex.length) return null;
  const lines = ['# Verification Annex — INTERNAL, not for customer', ''];
  for (const item of scope.annex) {
    lines.push(`- **${item.pain}** (${item.kind}): ${item.items.join(', ')}${item.reason ? ` — ${item.reason}` : ''}`);
  }
  lines.push('', '```notes', 'Rows here are not yet confirmed enough to show a customer.', '```');
  return lines.join('\n');
}

function renderRemovedSlide(scope, config) {
  if (config.mode !== 'internal' || !scope.removedByBlocks.length) return null;
  const lines = ['# Removed by Active Blocks — INTERNAL', ''];
  for (const item of scope.removedByBlocks) {
    lines.push(`- **${item.id}** (${item.kind}) — ${item.blockId}: ${item.reason}`);
  }
  lines.push('', '```notes', 'See _state/vertical_offering_state.md for the full Active Blocks table.', '```');
  return lines.join('\n');
}

function renderDataGapsSlide(scope) {
  const lines = ['# Data Gaps', ''];
  if (!scope.dataGaps.length) {
    lines.push('None.');
  } else {
    for (const gap of scope.dataGaps) lines.push(`- ${gap}`);
  }
  return lines.join('\n');
}

function renderDeck(scope, config) {
  const slides = [renderTitleSlide(config), renderScopeBoard(scope, config)];

  for (const pain of scope.pains) slides.push(renderPainSlide(pain, config));

  const hw = renderHardwareSlide(scope, config);
  if (hw) slides.push(hw);

  const annex = renderAnnexSlide(scope, config);
  if (annex) slides.push(annex);

  const removed = renderRemovedSlide(scope, config);
  if (removed) slides.push(removed);

  slides.push(renderDataGapsSlide(scope));

  const featureCount = new Set(scope.pains.flatMap((p) => p.features.map((f) => f.id))).size;
  const summary = `Build summary: ${config.vertical.id} (${config.vertical.name}) · ${scope.pains.length} pain point(s) in scope · ${featureCount} feature(s) · mode=${config.mode} · ${scope.annex.length} item(s) sent to annex`;

  return { markdown: slides.join('\n\n---\n\n') + '\n\n---\n\n' + summary + '\n', summary };
}

module.exports = { renderDeck };
