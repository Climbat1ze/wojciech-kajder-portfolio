'use strict';

/**
 * Build the reviewer verification email: every Active Queue item addressed
 * to one PM, batched into a single message (not one email per item — a
 * product owner reviews their whole pending portfolio at once).
 */

const paths = require('../../../../_lib/paths');
const tables = require('../../../../_lib/tables');
const owners = require('../../../../_lib/owners');

function lookupDetail(item) {
  if (item.Table.startsWith('features/')) {
    const file = paths.project('_data', item.Table);
    const t = tables.readTable(file, tables.CANONICAL_FEATURE_HEADERS);
    const id = item.Content_Summary.split(':')[0].trim();
    const row = t ? t.rows.find((r) => String(r.F_ID).trim() === id) : null;
    return row ? { kind: 'feature', id, name: row.Feature, product: row.Product, description: row.Description, source: row.Source } : null;
  }
  if (item.Table === 'pain_points.md') {
    const t = tables.readTable(paths.project('_data', 'pain_points.md'), ['P_ID', 'Pain Point']);
    const id = item.Content_Summary.split(':')[0].trim();
    const row = t ? t.rows.find((r) => String(r.P_ID).trim() === id) : null;
    return row ? { kind: 'pain_point', id, name: row['Pain Point'], cluster: row.Cluster, description: row.Description, source: row.Source } : null;
  }
  if (item.Table === 'map_feature_pain.md') {
    const [fId, pId] = item.Content_Summary.split('->').map((s) => s.trim());
    const featuresTable = tables.readAllFeatures(paths.FEATURES_DIR);
    const feature = featuresTable.find((f) => String(f.F_ID).trim() === fId);
    const painTable = tables.readTable(paths.project('_data', 'pain_points.md'), ['P_ID', 'Pain Point']);
    const pain = painTable ? painTable.rows.find((r) => String(r.P_ID).trim() === pId) : null;
    const mfp = tables.readTable(paths.project('_data', 'map_feature_pain.md'), ['F_ID', 'P_ID']);
    const mapping = mfp ? mfp.rows.find((r) => String(r.F_ID).trim() === fId && String(r.P_ID).trim() === pId) : null;
    return {
      kind: 'mapping',
      id: `${fId}-${pId}`,
      feature: feature ? feature.Feature : fId,
      product: feature ? feature.Product : '',
      pain: pain ? pain['Pain Point'] : pId,
      howItAddresses: mapping ? mapping['How it addresses'] : ''
    };
  }
  return null;
}

function buildItems(entries) {
  return entries.map((entry, i) => ({ number: i + 1, entryId: entry.Entry_ID, detail: lookupDetail(entry), raw: entry }));
}

function renderText(items, pmName, deadline) {
  const lines = [`Vertical Offering — Verification Required`, '', `Hi ${pmName},`, '', `You have ${items.length} item(s) pending review.`, `Deadline: ${deadline}`, ''];
  for (const item of items) {
    lines.push(`ITEM #${item.number}: ${item.entryId}`);
    if (item.detail) {
      if (item.detail.kind === 'feature') {
        lines.push(`  Feature: ${item.detail.id} — ${item.detail.name} (${item.detail.product})`);
        lines.push(`  Description: ${item.detail.description}`);
        lines.push(`  Source: ${item.detail.source}`);
      } else if (item.detail.kind === 'pain_point') {
        lines.push(`  Pain point: ${item.detail.id} — ${item.detail.name} (${item.detail.cluster})`);
        lines.push(`  Description: ${item.detail.description}`);
        lines.push(`  Source: ${item.detail.source}`);
      } else if (item.detail.kind === 'mapping') {
        lines.push(`  Mapping: ${item.detail.feature} (${item.detail.product}) -> ${item.detail.pain}`);
        lines.push(`  How it addresses: ${item.detail.howItAddresses}`);
      }
    } else {
      lines.push(`  ${item.raw.Content_Summary}`);
    }
    lines.push('');
  }
  lines.push('HOW TO RESPOND', '', 'Reply with one line per decision:', '  accept 1, 2', '  correct 3 (what should change)', '  reject 4 (reason)', '');
  return lines.join('\n');
}

function renderMarkdown(items, pmName, deadline) {
  const lines = [`# Vertical Offering — Verification Required`, '', `Hi ${pmName},`, '', `You have **${items.length}** item(s) pending review. Deadline: **${deadline}**`, ''];
  for (const item of items) {
    lines.push(`## ITEM #${item.number}: ${item.entryId}`, '');
    if (item.detail) {
      if (item.detail.kind === 'feature') {
        lines.push(`| Field | Value |`, `|---|---|`, `| Feature | ${item.detail.id} — ${item.detail.name} |`, `| Product | ${item.detail.product} |`, `| Description | ${item.detail.description} |`, `| Source | ${item.detail.source} |`);
      } else if (item.detail.kind === 'pain_point') {
        lines.push(`| Field | Value |`, `|---|---|`, `| Pain point | ${item.detail.id} — ${item.detail.name} |`, `| Cluster | ${item.detail.cluster} |`, `| Description | ${item.detail.description} |`, `| Source | ${item.detail.source} |`);
      } else if (item.detail.kind === 'mapping') {
        lines.push(`| Field | Value |`, `|---|---|`, `| Feature | ${item.detail.feature} (${item.detail.product}) |`, `| Pain point | ${item.detail.pain} |`, `| How it addresses | ${item.detail.howItAddresses} |`);
      }
    } else {
      lines.push(item.raw.Content_Summary);
    }
    lines.push('');
  }
  lines.push('---', '', '**How to respond** — reply with one line per decision:', '', '```', 'accept 1, 2', 'correct 3 (what should change)', 'reject 4 (reason)', '```');
  return lines.join('\n');
}

function renderHtml(items, pmName, deadline) {
  const rows = items.map((item) => {
    let body = '';
    if (item.detail) {
      if (item.detail.kind === 'feature') {
        body = `<dl><dt>Feature</dt><dd>${item.detail.id} — ${item.detail.name}</dd><dt>Product</dt><dd>${item.detail.product}</dd><dt>Description</dt><dd>${item.detail.description}</dd><dt>Source</dt><dd>${item.detail.source}</dd></dl>`;
      } else if (item.detail.kind === 'pain_point') {
        body = `<dl><dt>Pain point</dt><dd>${item.detail.id} — ${item.detail.name}</dd><dt>Cluster</dt><dd>${item.detail.cluster}</dd><dt>Description</dt><dd>${item.detail.description}</dd><dt>Source</dt><dd>${item.detail.source}</dd></dl>`;
      } else if (item.detail.kind === 'mapping') {
        body = `<dl><dt>Feature</dt><dd>${item.detail.feature} (${item.detail.product})</dd><dt>Pain point</dt><dd>${item.detail.pain}</dd><dt>How it addresses</dt><dd>${item.detail.howItAddresses}</dd></dl>`;
      }
    } else {
      body = `<p>${item.raw.Content_Summary}</p>`;
    }
    return `<div class="item"><div class="item-header">ITEM #${item.number}: ${item.entryId}</div><div class="item-body">${body}</div></div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 720px; margin: 0 auto; padding: 24px; }
  .header { background: #2563eb; color: #fff; padding: 20px 24px; border-radius: 8px 8px 0 0; }
  .summary { background: #f4f6fb; padding: 14px 16px; border-left: 4px solid #2563eb; margin: 16px 0; }
  .item { border: 1px solid #ddd; margin: 14px 0; border-radius: 6px; overflow: hidden; }
  .item-header { background: #2563eb; color: #fff; padding: 10px 14px; font-weight: 600; }
  .item-body { padding: 14px; }
  .item-body dt { font-weight: 600; color: #2563eb; margin-top: 8px; }
  .item-body dd { margin: 2px 0 8px; }
  .reply-box { background: #eef2ff; padding: 14px 16px; border-radius: 6px; margin: 20px 0; }
  .reply-box code, pre { background: #fff; padding: 2px 6px; border-radius: 4px; }
</style>
</head>
<body>
  <div class="header"><h1 style="margin:0;font-size:20px;">Vertical Offering — Verification Required</h1></div>
  <p>Hi ${pmName},</p>
  <div class="summary"><strong>${items.length}</strong> item(s) pending review. Deadline: <strong>${deadline}</strong></div>
  ${rows}
  <div class="reply-box">
    <h3 style="margin-top:0;">How to respond</h3>
    <pre>accept 1, 2
correct 3 (what should change)
reject 4 (reason)</pre>
  </div>
</body>
</html>`;
}

module.exports = { lookupDetail, buildItems, renderText, renderMarkdown, renderHtml };
