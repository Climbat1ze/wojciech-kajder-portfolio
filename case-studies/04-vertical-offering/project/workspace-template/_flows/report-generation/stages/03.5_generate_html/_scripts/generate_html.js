'use strict';

/**
 * Render one self-contained HTML report from Stage 03's resolved scope
 * (plus, optionally, Stage 03.2's curation.md). No external dependencies —
 * the whole stylesheet is inlined from references/design_tokens.md.
 *
 * This reference implementation renders a single profile. The source
 * methodology this project is modeled on splits internal/client/account-team
 * views into three separate documents with different chrome and structure;
 * that is a real, valuable extension but is out of scope here — see
 * CONTEXT.md.
 */

const fs = require('fs');
const path = require('path');

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function badgeClass(status) {
  const s = String(status || '').trim().toUpperCase();
  if (s === 'VERIFIED') return 'badge badge-verified';
  if (s === 'TBC') return 'badge badge-tbc';
  return 'badge badge-proposed';
}

function loadCss(referencesDir) {
  const tokensFile = path.join(referencesDir, 'design_tokens.md');
  const text = fs.readFileSync(tokensFile, 'utf8');
  const match = /```css\s*\r?\n([\s\S]*?)```/.exec(text);
  return match ? match[1] : '';
}

function renderPain(pain, mode) {
  const features = pain.features.map((f) => {
    const statusBadge = mode === 'internal' ? `<span class="${badgeClass(f.status)}">${escapeHtml(f.status)}</span>` : '';
    // A verified feature can still have an unconfirmed link to this specific
    // pain — show both when the feature's own status and its mapping status disagree.
    const mappingBadge = (mode === 'internal' && f.mappingStatus && f.mappingStatus.trim().toUpperCase() !== f.status.trim().toUpperCase())
      ? ` <span class="${badgeClass(f.mappingStatus)}">mapping: ${escapeHtml(f.mappingStatus)}</span>` : '';
    const blockBadge = f.badge ? ` <span class="badge badge-proposed">${escapeHtml(f.badge.label)}</span>` : '';
    return `
      <div class="card">
        <p class="card-title">${escapeHtml(f.name)} ${statusBadge}${mappingBadge}${blockBadge}</p>
        <p class="muted">${escapeHtml(f.product)}</p>
        <p>${escapeHtml(f.howItAddresses)}</p>
        ${mode === 'internal' ? `<p class="fine">Source: ${escapeHtml(f.source)}</p>` : ''}
      </div>`;
  }).join('\n');

  const hardware = pain.hardware.length ? `
      <h4>Hardware</h4>
      <table>
        <thead><tr><th>Attribute</th><th>Value</th>${mode === 'internal' ? '<th>Status</th>' : ''}</tr></thead>
        <tbody>
          ${pain.hardware.map((h) => `<tr><td>${escapeHtml(h.attribute)}</td><td>${escapeHtml(h.value)}</td>${mode === 'internal' ? `<td><span class="${badgeClass(h.status)}">${escapeHtml(h.status)}</span></td>` : ''}</tr>`).join('\n')}
        </tbody>
      </table>` : '';

  return `
    <section class="pain" id="${escapeHtml(pain.id)}">
      <p class="overline">${escapeHtml(pain.cluster || 'Uncategorised')} &middot; Relevance ${escapeHtml(pain.relevance)}</p>
      <h3>${escapeHtml(pain.id)}: ${escapeHtml(pain.name)}</h3>
      <p>${escapeHtml(pain.description)}</p>
      ${features || '<p class="muted">No features in scope for this pain point yet.</p>'}
      ${hardware}
    </section>`;
}

function generate({ scope, config, css, includedIds }) {
  const pains = includedIds ? scope.pains.filter((p) => includedIds.has(p.id)) : scope.pains;

  const toc = pains.map((p) => `<li><a href="#${escapeHtml(p.id)}">${escapeHtml(p.id)}: ${escapeHtml(p.name)}</a></li>`).join('\n');
  const sections = pains.map((p) => renderPain(p, config.mode)).join('\n');

  const annex = (config.mode === 'internal' && scope.annex.length) ? `
    <section class="pain">
      <h3>Verification Annex</h3>
      <ul>
        ${scope.annex.map((a) => `<li>${escapeHtml(a.pain)} (${escapeHtml(a.kind)}): ${escapeHtml(a.items.join(', '))}${a.reason ? ` — ${escapeHtml(a.reason)}` : ''}</li>`).join('\n')}
      </ul>
    </section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(config.vertical.name)} — Vertical Offering</title>
<style>
${css}
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, "Segoe UI", Arial, sans-serif; background: var(--canvas); color: var(--ink); line-height: 1.5; }
.wrap { max-width: 880px; margin: 0 auto; padding: var(--s-6) var(--s-5); }
header { background: var(--panel); border-bottom: 1px solid var(--hairline); }
h1 { font-size: 32px; margin: 0 0 var(--s-2); }
h3 { font-size: 20px; margin: 0 0 var(--s-2); }
h4 { font-size: 15px; margin: var(--s-4) 0 var(--s-2); }
.overline { text-transform: uppercase; font-size: 12px; letter-spacing: .06em; color: var(--ink-muted); margin: 0 0 var(--s-2); }
.muted { color: var(--ink-muted); }
.fine { font-size: 12px; color: var(--ink-muted); }
.pain { padding: var(--s-6) 0; border-bottom: 1px solid var(--hairline); }
.card { background: var(--panel); border-radius: var(--r-md); padding: var(--s-4); margin: var(--s-3) 0; }
.card-title { font-weight: 600; margin: 0 0 var(--s-2); }
table { width: 100%; border-collapse: collapse; font-size: 14px; margin: var(--s-3) 0; }
th, td { text-align: left; padding: var(--s-2) var(--s-3); border-bottom: 1px solid var(--hairline); }
.badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.badge-verified { background: color-mix(in srgb, var(--success) 18%, transparent); color: var(--success); }
.badge-tbc { background: color-mix(in srgb, var(--warning) 18%, transparent); color: var(--warning); }
.badge-proposed { background: var(--hairline); color: var(--ink-muted); }
nav.toc ul { padding-left: var(--s-5); }
footer { padding: var(--s-6) var(--s-5); color: var(--ink-muted); font-size: 13px; }
</style>
</head>
<body>
<header>
  <div class="wrap">
    <p class="overline">Vertical Offering Report &middot; ${escapeHtml(config.mode)} mode</p>
    <h1>${escapeHtml(config.vertical.name)}</h1>
    <p class="muted">${escapeHtml(config.vertical.description || '')}</p>
  </div>
</header>
<div class="wrap">
  <nav class="toc">
    <h4>Contents</h4>
    <ul>${toc}</ul>
  </nav>
  ${sections}
  ${annex}
</div>
<footer>
  <div class="wrap">
    Generated ${new Date().toISOString().slice(0, 10)} &middot; ${pains.length} pain point(s) shown &middot; mode: ${escapeHtml(config.mode)}
  </div>
</footer>
</body>
</html>
`;
}

module.exports = { generate, loadCss };
