'use strict';

/**
 * Stage artifacts — the Layer 4 handoff points.
 *
 * Per the filesystem-as-orchestration method, stages coordinate by one
 * stage's output/ becoming the next stage's input, and a human may edit that
 * file in between. Everything here exists to make that literally true:
 *
 *  - every stage writes at least one artifact, even on failure;
 *  - artifacts are pretty-printed so they can be read and hand-edited;
 *  - a stage reads its upstream input from disk, never from memory.
 *
 * The envelope is uniform so that a reader can answer "what ran, what did it
 * read, what did it produce, and did it actually succeed" from any single
 * file. A stage that prints "done" while writing nothing real is exactly the
 * failure mode this envelope makes impossible to hide: a status of "ok" with
 * empty outputs is a visible contradiction, not a silent one.
 */

const fs = require('fs');
const path = require('path');
const paths = require('./paths');

const STATUS = { OK: 'ok', FAILED: 'failed', BLOCKED: 'blocked' };

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** The output/ directory belonging to a stage. */
function outputDir(stageDir) {
  return ensureDir(path.join(stageDir, 'output'));
}

function createEnvelope(stage, stageName) {
  return {
    stage,
    stage_name: stageName,
    status: STATUS.OK,
    timestamp: new Date().toISOString(),
    config: null,
    inputs: [],
    outputs: [],
    counts: {},
    validation: { errors: [], warnings: [] },
    data: null
  };
}

/**
 * Collects what a stage did, then writes it. Paths are recorded in the
 * project-relative ({PROJECT_ROOT}/...) form so artifacts stay readable when
 * the project is copied elsewhere.
 */
class ArtifactBuilder {
  constructor(stageDir, stage, stageName) {
    this.stageDir = stageDir;
    this.envelope = createEnvelope(stage, stageName);
  }

  config(config) {
    if (config) {
      this.envelope.config = {
        vertical: config.vertical ? `${config.vertical.id} (${config.vertical.name})` : undefined,
        relevance_threshold: config.relevance_threshold,
        mode: config.mode,
        include_hardware: config.include_hardware,
        language: config.language,
        sources: config._sources
      };
    }
    return this;
  }

  input(filePath, note) {
    this.envelope.inputs.push({ path: paths.contract(filePath), note: note || undefined });
    return this;
  }

  output(filePath, note) {
    this.envelope.outputs.push({ path: paths.contract(filePath), note: note || undefined });
    return this;
  }

  count(key, value) {
    this.envelope.counts[key] = value;
    return this;
  }

  counts(pairs) {
    Object.assign(this.envelope.counts, pairs);
    return this;
  }

  error(message) {
    this.envelope.validation.errors.push(message);
    this.envelope.status = STATUS.FAILED;
    return this;
  }

  warn(message) {
    this.envelope.validation.warnings.push(message);
    return this;
  }

  /** A refusal that is a correct outcome, not a crash (e.g. a gate saying no). */
  block(message) {
    this.envelope.validation.errors.push(message);
    this.envelope.status = STATUS.BLOCKED;
    return this;
  }

  payload(data) {
    this.envelope.data = data;
    return this;
  }

  get failed() {
    return this.envelope.status !== STATUS.OK;
  }

  /** Write a companion artifact (deck, email, html) and record it. */
  writeFile(filename, content, note) {
    const target = path.join(outputDir(this.stageDir), filename);
    fs.writeFileSync(target, content, 'utf8');
    this.output(target, note);
    return target;
  }

  /** Write the JSON envelope. Always call this, including on the failure path. */
  save(filename) {
    const target = path.join(outputDir(this.stageDir), filename);
    fs.writeFileSync(target, JSON.stringify(this.envelope, null, 2) + '\n', 'utf8');
    return target;
  }

  /** Process exit code matching the recorded status. */
  get exitCode() {
    return this.envelope.status === STATUS.OK ? 0 : 1;
  }
}

/** Strip a UTF-8 byte order mark (see tables.js for why this matters). */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** Read an artifact written by another stage. */
function read(stageDir, filename) {
  const target = path.join(stageDir, 'output', filename);
  if (!fs.existsSync(target)) {
    throw new Error(
      `Upstream artifact not found: ${paths.contract(target)}. ` +
      `Run the stage that produces it first.`
    );
  }
  try {
    return JSON.parse(stripBom(fs.readFileSync(target, 'utf8')));
  } catch (err) {
    throw new Error(`Upstream artifact is not valid JSON (${paths.contract(target)}): ${err.message}`);
  }
}

/**
 * Read an upstream artifact and refuse to proceed if it did not succeed.
 * Without this, a failed stage's stale output would silently feed the next one.
 */
function readRequired(stageDir, filename, { allowStatus = [STATUS.OK] } = {}) {
  const artifact = read(stageDir, filename);
  if (!allowStatus.includes(artifact.status)) {
    const detail = artifact.validation && artifact.validation.errors.length
      ? ` Errors: ${artifact.validation.errors.join('; ')}`
      : '';
    throw new Error(
      `Upstream stage ${artifact.stage} (${artifact.stage_name}) has status "${artifact.status}", ` +
      `so its output cannot be used.${detail}`
    );
  }
  return artifact;
}

/** Read a plain text/markdown companion artifact from a stage's output/. */
function readFile(stageDir, filename) {
  const target = path.join(stageDir, 'output', filename);
  if (!fs.existsSync(target)) {
    throw new Error(`Upstream file not found: ${paths.contract(target)}`);
  }
  return stripBom(fs.readFileSync(target, 'utf8'));
}

module.exports = {
  STATUS,
  ArtifactBuilder,
  outputDir,
  ensureDir,
  read,
  readRequired,
  readFile,
  stripBom
};
