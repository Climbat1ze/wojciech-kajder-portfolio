'use strict';

/**
 * Resolve one vertical's scope from the reference tables: which pain points
 * apply, which features and hardware attributes answer them, what Active
 * Blocks remove, and — in `mode: client` — which rows are confirmed enough
 * to render versus which move to the Verification Annex.
 *
 * This is deterministic. No LLM involved, no judgment calls beyond what the
 * config and the tables already say.
 */

const paths = require('../../../../_lib/paths');
const tables = require('../../../../_lib/tables');
const stateLib = require('../../../../_lib/state');
const configLib = require('../../../../_lib/config');

function isVerified(status) {
  return String(status).trim().toUpperCase() === 'VERIFIED';
}

function resolve(config) {
  const blocks = stateLib.compile();
  const dataGaps = [];
  const removedByBlocks = [];

  const painTable = tables.readTable(paths.project('_data', 'pain_points.md'), ['P_ID', 'Pain Point']);
  const mpvTable = tables.readTable(paths.project('_data', 'map_pain_vertical.md'), ['V_ID', 'P_ID']);
  const mfpTable = tables.readTable(paths.project('_data', 'map_feature_pain.md'), ['F_ID', 'P_ID']);
  const featureRows = tables.readAllFeatures(paths.FEATURES_DIR);
  const hwTable = config.include_hardware ? tables.readTable(paths.project('_data', 'hardware_attributes.md'), ['HW_ID']) : null;
  const mhpTable = config.include_hardware ? tables.readTable(paths.project('_data', 'map_hw_pain.md'), ['HW_ID', 'P_ID']) : null;

  if (!mpvTable) throw new Error('_data/map_pain_vertical.md not found');

  const inScopeMappings = mpvTable.rows.filter((r) =>
    String(r.V_ID).trim() === config.vertical.id &&
    configLib.meetsThreshold(r.Relevance, config.relevance_threshold)
  );

  const pains = [];
  for (const mapping of inScopeMappings) {
    const pId = String(mapping.P_ID).trim();
    const painRow = painTable ? painTable.rows.find((r) => String(r.P_ID).trim() === pId) : null;
    if (!painRow) { dataGaps.push(`map_pain_vertical.md references unknown P_ID "${pId}"`); continue; }

    const blockedPain = blocks.excludedBy('pain_points', painRow);
    if (blockedPain) { removedByBlocks.push({ id: pId, kind: 'pain', blockId: blockedPain.id, reason: blockedPain.reason }); continue; }

    const features = [];
    for (const fm of (mfpTable ? mfpTable.rows.filter((r) => String(r.P_ID).trim() === pId) : [])) {
      const fId = String(fm.F_ID).trim();
      const featureRow = featureRows.find((f) => String(f.F_ID).trim() === fId);
      if (!featureRow) { dataGaps.push(`map_feature_pain.md references unknown F_ID "${fId}"`); continue; }

      const blockedFeature = blocks.excludedBy('features', featureRow);
      if (blockedFeature) { removedByBlocks.push({ id: fId, kind: 'feature', blockId: blockedFeature.id, reason: blockedFeature.reason }); continue; }

      const badge = blocks.badgeFor('features', featureRow);
      features.push({
        id: fId, name: featureRow.Feature, product: featureRow.Product,
        description: featureRow.Description, source: featureRow.Source,
        status: featureRow.Status, howItAddresses: fm['How it addresses'],
        mappingStatus: fm.Status, badge
      });
    }

    const hardware = [];
    if (config.include_hardware && mhpTable) {
      for (const hm of mhpTable.rows.filter((r) => String(r.P_ID).trim() === pId)) {
        const hwId = String(hm.HW_ID).trim();
        const hwRow = hwTable ? hwTable.rows.find((r) => String(r.HW_ID).trim() === hwId) : null;
        if (!hwRow) { dataGaps.push(`map_hw_pain.md references unknown HW_ID "${hwId}"`); continue; }
        const badge = blocks.badgeFor('hardware_attributes', hwRow);
        hardware.push({
          id: hwId, attribute: hwRow.Attribute, value: hwRow['Value/Spec'],
          status: hwRow.Status, howItAddresses: hm['How it addresses'] || hm.Note, badge
        });
      }
    }

    pains.push({
      id: pId, name: painRow['Pain Point'], cluster: painRow.Cluster,
      description: painRow.Description, relevance: mapping.Relevance,
      mappingStatus: mapping.Status, features, hardware
    });
  }

  const annex = [];
  let renderPains = pains;

  if (config.mode === 'client') {
    renderPains = [];
    for (const pain of pains) {
      const verifiedFeatures = pain.features.filter((f) => isVerified(f.status) && isVerified(f.mappingStatus));
      const verifiedHardware = pain.hardware.filter((h) => isVerified(h.status));
      const nonVerifiedFeatures = pain.features.filter((f) => !(isVerified(f.status) && isVerified(f.mappingStatus)));
      const nonVerifiedHardware = pain.hardware.filter((h) => !isVerified(h.status));

      if (nonVerifiedFeatures.length) annex.push({ pain: pain.id, kind: 'features', items: nonVerifiedFeatures.map((f) => f.id) });
      if (nonVerifiedHardware.length) annex.push({ pain: pain.id, kind: 'hardware', items: nonVerifiedHardware.map((h) => h.id) });

      if (isVerified(pain.mappingStatus) && (verifiedFeatures.length || verifiedHardware.length)) {
        renderPains.push({ ...pain, features: verifiedFeatures, hardware: verifiedHardware });
      } else {
        annex.push({ pain: pain.id, kind: 'pain', items: [pain.id], reason: 'pain-to-vertical mapping not VERIFIED, or nothing verified answers it yet' });
      }
    }

    if (!renderPains.length) {
      throw new Error(
        `mode: client produced zero VERIFIED rows in scope for vertical ${config.vertical.id} (${config.vertical.name}). ` +
        `Run the verification workflow (data-ingestion flow, stages 02.5/02.6) before a client build, or build with mode: internal in the meantime.`
      );
    }
  }

  return { pains: renderPains, removedByBlocks, annex, dataGaps, blocksApplied: blocks.summary() };
}

module.exports = { resolve, isVerified };
