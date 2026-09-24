'use strict';

/**
 * Stage 02, ingest pass: take the parsed LLM reply and actually write to
 * shared data.
 *
 * Non-negotiable rule, regardless of mode: every ID the LLM wrote is
 * discarded and reassigned from the true current sequence at ingest time.
 * A model's guessed F_ID/P_ID/S_ID is never trusted, and its guessed
 * PM_Assigned is always recomputed from _data/pm_owners.md.
 */

const fs = require('fs');
const path = require('path');
const paths = require('../../../../_lib/paths');
const tables = require('../../../../_lib/tables');
const owners = require('../../../../_lib/owners');
const queue = require('./queue');

function maxId(table, column, prefix) {
  if (!table) return 0;
  const nums = table.values(column).map((v) => tables.parseNumericId(v, prefix)).filter((n) => n !== null);
  return nums.length ? Math.max(...nums) : 0;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function deadlinePlusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * extract mode: writes new features, pain points, mappings and sources.
 * Returns a report object; throws on unrecoverable errors (missing target file).
 */
function ingestExtract({ parsed, product, pm }) {
  const report = { created: { features: [], pain_points: [], sources: [] }, mappings: { map_feature_pain: 0, map_pain_vertical: 0 }, queued: 0, rejected: [] };

  const targetFile = paths.project('_data', 'features', `${product}.md`);
  if (!fs.existsSync(targetFile)) {
    throw new Error(`Target catalogue does not exist: _data/features/${product}.md. Create it first (copy _data/features/_example_module.md).`);
  }

  // --- Sources first, so new feature/pain rows can cite a genuinely new S_ID.
  const sourcesTable = tables.readTable(paths.project('_data', 'sources.md'), ['S_ID']);
  let sBase = maxId(sourcesTable, 'S_ID', 'S');
  const sourceIdMap = {}; // llm-written S_ID -> real S_ID, only for rows in the Sources section
  const newSourceRows = [];
  for (const row of parsed.sources) {
    sBase += 1;
    const realId = 'S' + tables.padId(sBase);
    sourceIdMap[String(row.S_ID).trim()] = realId;
    newSourceRows.push({ S_ID: realId, Type: row.Type, Title: row.Title, 'URL/Path': row['URL/Path'], Feeds: row.Feeds, Status: 'PROPOSED' });
    report.created.sources.push(realId);
  }
  if (newSourceRows.length && sourcesTable) { sourcesTable.append(newSourceRows); sourcesTable.save(); }

  function resolveSourceRef(raw) {
    return String(raw).split(',').map((s) => s.trim()).filter(Boolean)
      .map((s) => sourceIdMap[s] || s)
      .join(', ');
  }

  // --- Features.
  const featureTable = tables.readTable(targetFile, tables.CANONICAL_FEATURE_HEADERS);
  let fBase = tables.maxFeatureId(paths.FEATURES_DIR);
  const featureIdMap = {};
  const newFeatureRows = [];
  const queuedFeatures = [];
  for (const row of parsed.features) {
    fBase += 1;
    const realId = 'F' + tables.padId(fBase);
    featureIdMap[String(row.F_ID).trim()] = realId;
    const productName = row.Product || product;
    newFeatureRows.push({ F_ID: realId, Feature: row.Feature, Product: productName, Description: row.Description, Source: resolveSourceRef(row.Source), Status: 'PROPOSED' });
    const owner = owners.resolveProduct(productName);
    queuedFeatures.push({ id: realId, summary: `${realId}: ${row.Feature}`, table: `features/${product}.md`, pmAssigned: owner.resolved && owner.assigned ? owner.pmId : (pm || 'PENDING') });
    report.created.features.push(realId);
  }
  if (newFeatureRows.length) { featureTable.append(newFeatureRows); featureTable.save(); }

  // --- Pain points.
  const painFile = paths.project('_data', 'pain_points.md');
  const painTable = tables.readTable(painFile, ['P_ID', 'Pain Point']);
  let pBase = maxId(painTable, 'P_ID', 'P');
  const painIdMap = {};
  const newPainRows = [];
  const queuedPains = [];
  for (const row of parsed.pain_points) {
    pBase += 1;
    const realId = 'P' + tables.padId(pBase);
    painIdMap[String(row.P_ID).trim()] = realId;
    newPainRows.push({ P_ID: realId, 'Pain Point': row['Pain Point'], Cluster: row.Cluster, Description: row.Description, Source: resolveSourceRef(row.Source), Status: 'PROPOSED' });
    queuedPains.push({ id: realId, summary: `${realId}: ${row['Pain Point']}`, table: 'pain_points.md', pmAssigned: pm || 'PENDING' });
    report.created.pain_points.push(realId);
  }
  if (newPainRows.length && painTable) { painTable.append(newPainRows); painTable.save(); }

  function resolveFeatureRef(raw) {
    const key = String(raw).trim();
    return featureIdMap[key] || key;
  }
  function resolvePainRef(raw) {
    const key = String(raw).trim();
    return painIdMap[key] || key;
  }

  const knownFeatureIds = new Set(tables.readAllFeatures(paths.FEATURES_DIR).map((f) => String(f.F_ID).trim()));
  const knownPainIds = new Set((tables.readTable(painFile, ['P_ID', 'Pain Point']) || { values: () => [] }).values('P_ID').map((v) => v.trim()));
  const knownVerticalIds = new Set((tables.readTable(paths.project('_data', 'verticals.md'), ['V_ID', 'Vertical']) || { values: () => [] }).values('V_ID').map((v) => v.trim()));

  // --- map_feature_pain.
  const mfpFile = paths.project('_data', 'map_feature_pain.md');
  const mfpTable = tables.readTable(mfpFile, ['F_ID', 'P_ID']);
  const newMfpRows = [];
  const queuedMappings = [];
  for (const row of parsed.map_feature_pain) {
    const fId = resolveFeatureRef(row.F_ID);
    const pId = resolvePainRef(row.P_ID);
    if (!knownFeatureIds.has(fId) && !newFeatureRows.some((r) => r.F_ID === fId)) { report.rejected.push({ row, reason: `F_ID "${row.F_ID}" does not resolve to a known feature` }); continue; }
    if (!knownPainIds.has(pId) && !newPainRows.some((r) => r.P_ID === pId)) { report.rejected.push({ row, reason: `P_ID "${row.P_ID}" does not resolve to a known pain point` }); continue; }
    newMfpRows.push({ F_ID: fId, P_ID: pId, 'How it addresses': row['How it addresses'], Status: 'PROPOSED', Proposed_By: `LLM (batch ${today()})`, PM_Assigned: row.PM_Assigned || 'PENDING' });
    queuedMappings.push({ id: `${fId}-${pId}`, summary: `${fId} -> ${pId}`, table: 'map_feature_pain.md', pmAssigned: row.PM_Assigned || 'PENDING' });
    report.mappings.map_feature_pain += 1;
  }
  if (newMfpRows.length && mfpTable) { mfpTable.append(newMfpRows); mfpTable.save(); }

  // --- map_pain_vertical.
  const mpvFile = paths.project('_data', 'map_pain_vertical.md');
  const mpvTable = tables.readTable(mpvFile, ['V_ID', 'P_ID']);
  const newMpvRows = [];
  for (const row of parsed.map_pain_vertical) {
    const vId = String(row.V_ID).trim();
    const pId = resolvePainRef(row.P_ID);
    if (!knownVerticalIds.has(vId)) { report.rejected.push({ row, reason: `V_ID "${row.V_ID}" is not a known vertical` }); continue; }
    if (!knownPainIds.has(pId) && !newPainRows.some((r) => r.P_ID === pId)) { report.rejected.push({ row, reason: `P_ID "${row.P_ID}" does not resolve to a known pain point` }); continue; }
    newMpvRows.push({ V_ID: vId, P_ID: pId, Relevance: row.Relevance, 'SME Note': row['SME Note'], Status: 'PROPOSED' });
    report.mappings.map_pain_vertical += 1;
  }
  if (newMpvRows.length && mpvTable) { mpvTable.append(newMpvRows); mpvTable.save(); }

  // --- Queue everything new for review.
  const allocate = queue.entryIdAllocator();
  const entries = [];
  let offset = 0;
  for (const item of [...queuedFeatures, ...queuedPains, ...queuedMappings]) {
    offset += 1;
    entries.push({
      Entry_ID: allocate(offset),
      Table: item.table,
      Content_Summary: item.summary,
      Proposed_By: 'LLM (Claude)',
      PM_Assigned: item.pmAssigned,
      Date_Added: today(),
      Status: 'PENDING',
      Deadline: deadlinePlusDays(3)
    });
  }
  queue.appendEntries(entries);
  report.queued = entries.length;

  return report;
}

/** map-gaps mode: only writes map_feature_pain rows for features/pains that already exist. */
function ingestMapGaps({ parsed, product }) {
  const report = { mappings: { map_feature_pain: 0 }, queued: 0, unmappable: parsed.unmappable.length, rejected: [] };

  const knownFeatureIds = new Set(tables.readAllFeatures(paths.FEATURES_DIR).map((f) => String(f.F_ID).trim()));
  const painTable = tables.readTable(paths.project('_data', 'pain_points.md'), ['P_ID', 'Pain Point']);
  const knownPainIds = new Set(painTable ? painTable.values('P_ID').map((v) => v.trim()) : []);

  const mfpFile = paths.project('_data', 'map_feature_pain.md');
  const mfpTable = tables.readTable(mfpFile, ['F_ID', 'P_ID']);
  const newMfpRows = [];
  const queuedMappings = [];

  for (const row of parsed.map_feature_pain) {
    const fId = String(row.F_ID).trim();
    const pId = String(row.P_ID).trim();
    if (!knownFeatureIds.has(fId)) { report.rejected.push({ row, reason: `F_ID "${fId}" is not an existing feature` }); continue; }
    if (!knownPainIds.has(pId)) { report.rejected.push({ row, reason: `P_ID "${pId}" is not an existing pain point` }); continue; }

    const featureRow = tables.readAllFeatures(paths.FEATURES_DIR).find((f) => String(f.F_ID).trim() === fId);
    const owner = owners.resolveProduct(featureRow.Product);
    const pmAssigned = owner.resolved && owner.assigned ? owner.pmId : 'PENDING';

    newMfpRows.push({ F_ID: fId, P_ID: pId, 'How it addresses': row['How it addresses'], Status: 'PROPOSED', Proposed_By: `LLM (batch ${today()})`, PM_Assigned: pmAssigned });
    queuedMappings.push({ summary: `${fId} -> ${pId}`, table: 'map_feature_pain.md', pmAssigned });
    report.mappings.map_feature_pain += 1;
  }
  if (newMfpRows.length && mfpTable) { mfpTable.append(newMfpRows); mfpTable.save(); }

  const allocate = queue.entryIdAllocator();
  const entries = queuedMappings.map((item, i) => ({
    Entry_ID: allocate(i + 1),
    Table: item.table,
    Content_Summary: item.summary,
    Proposed_By: 'LLM (Claude)',
    PM_Assigned: item.pmAssigned,
    Date_Added: today(),
    Status: 'PENDING',
    Deadline: deadlinePlusDays(3)
  }));
  queue.appendEntries(entries);
  report.queued = entries.length;

  return report;
}

module.exports = { ingestExtract, ingestMapGaps };
