'use strict';

/**
 * Path resolution for the Vertical Offering Generator flows.
 *
 * This workspace is fully self-contained: everything a stage needs to read or
 * write lives under one PROJECT_ROOT (this folder), found by walking upward
 * from this file until a directory containing `_data/`, `_flows/` and
 * `CLAUDE.md` is found. There is no second, shared root outside this project —
 * if you copy this whole folder somewhere else and run it, it keeps working.
 */

const fs = require('fs');
const path = require('path');

function findUp(startDir, predicate) {
  let dir = path.resolve(startDir);
  for (;;) {
    if (predicate(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const PROJECT_ROOT = findUp(__dirname, (dir) =>
  fs.existsSync(path.join(dir, '_data')) &&
  fs.existsSync(path.join(dir, '_flows')) &&
  fs.existsSync(path.join(dir, 'CLAUDE.md'))
);

if (!PROJECT_ROOT) {
  throw new Error('Cannot locate project root (expected a directory containing _data/, _flows/ and CLAUDE.md)');
}

/** Resolve a path relative to the project root. */
function project(...segments) {
  return path.join(PROJECT_ROOT, ...segments);
}

/**
 * Expand the {PROJECT_ROOT} placeholder used in stage contracts and prompts.
 * A path with no placeholder is treated as project-relative.
 */
function expand(reference) {
  if (typeof reference !== 'string') {
    throw new TypeError(`expand() expects a string, got ${typeof reference}`);
  }
  if (reference.startsWith('{PROJECT_ROOT}')) {
    return path.join(PROJECT_ROOT, reference.slice('{PROJECT_ROOT}'.length));
  }
  if (path.isAbsolute(reference)) return reference;
  return path.join(PROJECT_ROOT, reference);
}

/** Render an absolute path back as a {PROJECT_ROOT}-relative form, for artifacts and logs. */
function contract(absolutePath) {
  const abs = path.resolve(absolutePath);
  if (abs.startsWith(PROJECT_ROOT)) {
    return path.relative(PROJECT_ROOT, abs).split(path.sep).join('/');
  }
  return abs;
}

// Well-known locations, so no stage has to spell them out.
const DATA_DIR = project('_data');
const FEATURES_DIR = project('_data', 'features');
const STATE_DIR = project('_state');
const PROMPTS_DIR = project('_prompts');
const OUTPUTS_DIR = project('_outputs');
const DRAFTS_DIR = project('_outputs', '_drafts');
const FINAL_DIR = project('_outputs', '_final');
const CONTEXT_SOURCES_DIR = project('_context_sources');
const CONFIG_FILE = project('vertical_offering.config.md');
const STATE_FILE = project('_state', 'vertical_offering_state.md');

module.exports = {
  PROJECT_ROOT,
  project,
  expand,
  contract,
  DATA_DIR,
  FEATURES_DIR,
  STATE_DIR,
  PROMPTS_DIR,
  OUTPUTS_DIR,
  DRAFTS_DIR,
  FINAL_DIR,
  CONTEXT_SOURCES_DIR,
  CONFIG_FILE,
  STATE_FILE
};
