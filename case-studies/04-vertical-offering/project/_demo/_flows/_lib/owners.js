'use strict';

/**
 * Product -> reviewer (PM) resolution.
 *
 * _data/pm_owners.md is the only authoritative source for who owns which
 * product/module. Two deliberate design choices:
 *
 *  1. There is NO fallback owner. An unresolved product is returned as
 *     unresolved and the caller must deal with it explicitly — silently
 *     routing an unknown product to some default person is how a
 *     verification email ends up in the wrong inbox.
 *
 *  2. Aliases are explicit and listed below, never fuzzy-matched. A feature
 *     catalogue and the coverage map can legitimately use different spellings
 *     for the same product (a marketing name vs. an internal SKU name); add
 *     an alias here only when that is a deliberate, reviewed decision.
 */

const path = require('path');
const paths = require('./paths');
const tables = require('./tables');

/**
 * Product names as written in _data/features/*.md that do not literally match
 * a row in the pm_owners.md coverage map. Each entry should be a deliberate
 * decision, not a guess — delete this example once your own project has real
 * products with the same kind of naming mismatch (or leave it empty).
 */
const PRODUCT_ALIASES = {
  // Example: a catalogue file uses the customer-facing name, the coverage
  // map uses the internal module name.
  // 'example marketing name': 'Example Internal Module Name'
};

function normalise(value) {
  return String(value == null ? '' : value).trim().toLowerCase();
}

function loadOwners() {
  const file = path.join(paths.DATA_DIR, 'pm_owners.md');

  const roster = tables.readTable(file, ['PM_ID', 'PM_Name', 'Products_Owned']);
  if (!roster) throw new Error(`PM roster table not found in ${paths.contract(file)}`);

  const coverage = tables.readTable(file, ['Product', 'PM_ID', 'PM_Name']);
  if (!coverage) throw new Error(`Product Coverage Map not found in ${paths.contract(file)}`);

  const people = new Map();
  for (const row of roster.rows) {
    const id = String(row.PM_ID).trim();
    if (!id || id === '—') continue;
    people.set(id, {
      id,
      name: String(row.PM_Name).trim(),
      contact: String(row.Contact || '').trim(),
      status: String(row.Status || '').trim()
    });
  }

  const products = new Map();
  for (const row of coverage.rows) {
    const product = String(row.Product).trim();
    if (!product || product === '—') continue;
    const pmId = String(row.PM_ID).trim();
    const assigned = pmId !== '—' && pmId !== '';
    products.set(normalise(product), {
      product,
      pmId: assigned ? pmId : null,
      assigned,
      pmName: assigned && people.has(pmId) ? people.get(pmId).name : null
    });
  }

  return { people, products, file };
}

let cache = null;
function owners() {
  if (!cache) cache = loadOwners();
  return cache;
}

/**
 * Resolve the reviewer (PM) responsible for a product.
 * Returns { resolved, assigned, pmId, pmName, product, via, reason }.
 *
 *   resolved=false -> the product is not in the coverage map at all
 *   assigned=false -> the product is listed but has no PM yet (Pending)
 */
function resolveProduct(productName) {
  const { products } = owners();
  const key = normalise(productName);

  let lookupKey = key;
  let via = 'direct';
  if (!products.has(lookupKey) && PRODUCT_ALIASES[key]) {
    lookupKey = normalise(PRODUCT_ALIASES[key]);
    via = `alias:${PRODUCT_ALIASES[key]}`;
  }

  const entry = products.get(lookupKey);
  if (!entry) {
    return {
      resolved: false,
      assigned: false,
      pmId: null,
      pmName: null,
      product: String(productName).trim(),
      via: null,
      reason: `Product "${productName}" has no row in the Product Coverage Map in pm_owners.md`
    };
  }

  return {
    resolved: true,
    assigned: entry.assigned,
    pmId: entry.pmId,
    pmName: entry.pmName,
    product: entry.product,
    via,
    reason: entry.assigned ? null : `Product "${entry.product}" is listed as Pending — no reviewer assigned`
  };
}

/**
 * Resolve the reviewer for a feature row.
 *
 * Accepts either a raw _data/features/*.md row (column `Product`) or a scope
 * item shaped like one (lowercase `product`), so a caller downstream of
 * either source works without reshaping its data first.
 */
function resolveFeature(featureRow) {
  const product = featureRow.Product !== undefined ? featureRow.Product : featureRow.product;
  return resolveProduct(product);
}

function person(pmId) {
  return owners().people.get(String(pmId).trim()) || null;
}

function allPeople() {
  return [...owners().people.values()];
}

/**
 * Group features by owning reviewer. Anything that cannot be routed is
 * returned separately so a caller can report it instead of quietly dropping it.
 */
function groupFeaturesByOwner(features) {
  const byPm = new Map();
  const unassigned = [];
  const unresolved = [];

  for (const feature of features) {
    const owner = resolveFeature(feature);
    if (!owner.resolved) { unresolved.push({ feature, owner }); continue; }
    if (!owner.assigned) { unassigned.push({ feature, owner }); continue; }
    if (!byPm.has(owner.pmId)) byPm.set(owner.pmId, { pm: person(owner.pmId), features: [] });
    byPm.get(owner.pmId).features.push(feature);
  }

  return { byPm, unassigned, unresolved };
}

module.exports = {
  PRODUCT_ALIASES,
  resolveProduct,
  resolveFeature,
  person,
  allPeople,
  groupFeaturesByOwner,
  _reset: () => { cache = null; }
};
