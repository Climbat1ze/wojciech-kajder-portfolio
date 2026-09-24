#!/usr/bin/env node
'use strict';

/**
 * Stage 02 — Knowledge AI Mining.
 *
 * Two passes around a human LLM step — this is the one stage in either flow
 * that is not fully mechanized:
 *
 *   1. prepare (default): compose a prompt + record the request. A human then
 *      pastes stages/02.../output/mining_prompt.md into an LLM and saves the
 *      reply to stages/02.../output/mining_response.md.
 *   2. --ingest: read that saved reply, validate it, assign real IDs, and
 *      write to shared _data/*.md + _state/verification_queue.md.
 *
 * Two modes (via --mode, default extract):
 *   extract    — propose new features/pain points/mappings from a document (--file, --product)
 *   map-gaps   — link existing features to existing pain points (--product)
 */

const fs = require('fs');
const path = require('path');
const paths = require('../../../_lib/paths');
const { ArtifactBuilder } = require('../../../_lib/artifact');
const { log } = require('../../../_lib/log');

const prepareMining = require('./_scripts/prepare_mining');
const miningResponse = require('./_scripts/mining_response');
const ingestMining = require('./_scripts/ingest_mining');

const STAGE_ID = '02';
const STAGE_NAME = 'Knowledge AI Mining';

function parseArgs(argv) {
  const opts = { mode: 'extract', ingest: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--file') opts.file = argv[++i];
    else if (a === '--product') opts.product = argv[++i];
    else if (a === '--pm') opts.pm = argv[++i];
    else if (a === '--mode') opts.mode = argv[++i];
    else if (a === '--ingest') opts.ingest = true;
  }
  return opts;
}

function prepare(opts, builder) {
  if (!opts.product) throw new Error('--product is required (the target feature catalogue, e.g. --product example_module)');

  let result;
  if (opts.mode === 'map-gaps') {
    result = prepareMining.buildMapGapsPrompt({ product: opts.product });
  } else {
    if (!opts.file) throw new Error('extract mode requires --file <source document>');
    result = prepareMining.buildExtractPrompt({ file: opts.file, product: opts.product, pm: opts.pm });
  }

  builder.writeFile('mining_prompt.md', result.prompt, 'prompt to paste into an LLM');
  const request = { mode: opts.mode, product: opts.product, pm: opts.pm || null, file: opts.file || null, timestamp: new Date().toISOString() };
  builder.writeFile('mining_request.json', JSON.stringify(request, null, 2) + '\n', 'recorded request parameters');

  log.ok('Prompt written to output/mining_prompt.md.');
  log.info('Next: paste it into an LLM, save the reply to output/mining_response.md, then re-run with --ingest.');
  builder.counts({ mode: opts.mode, product: opts.product });
}

function ingest(builder) {
  const requestPath = path.join(__dirname, 'output', 'mining_request.json');
  const responsePath = path.join(__dirname, 'output', 'mining_response.md');

  if (!fs.existsSync(requestPath)) throw new Error('output/mining_request.json not found — run the prepare pass first.');
  if (!fs.existsSync(responsePath)) throw new Error('output/mining_response.md not found — save the LLM reply there first.');

  const request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
  const responseText = fs.readFileSync(responsePath, 'utf8');
  builder.input(requestPath, 'request parameters');
  builder.input(responsePath, 'saved LLM reply');

  const parsed = miningResponse.parse(responseText);

  let report;
  if (request.mode === 'map-gaps') {
    report = ingestMining.ingestMapGaps({ parsed, product: request.product });
  } else {
    report = ingestMining.ingestExtract({ parsed, product: request.product, pm: request.pm });
  }

  if (report.rejected && report.rejected.length) {
    builder.writeFile('rejected.json', JSON.stringify(report.rejected, null, 2) + '\n', 'rows that failed validation');
    for (const r of report.rejected) builder.warn(`Rejected: ${r.reason}`);
  }
  if (report.unmappable) {
    builder.writeFile('unmappable.json', JSON.stringify(parsed.unmappable, null, 2) + '\n', 'features with no genuine pain-point match');
  }

  builder.payload(report);
  builder.counts({
    features_created: report.created ? report.created.features.length : 0,
    pain_points_created: report.created ? report.created.pain_points.length : 0,
    sources_created: report.created ? report.created.sources.length : 0,
    mappings_created: (report.mappings && (report.mappings.map_feature_pain || 0) + (report.mappings.map_pain_vertical || 0)) || 0,
    queued_for_review: report.queued,
    rejected: report.rejected.length
  });

  log.ok(`Ingested ${request.mode} response for product "${request.product}". ${report.queued} item(s) queued for review.`);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const builder = new ArtifactBuilder(__dirname, STAGE_ID, STAGE_NAME);

  try {
    if (opts.ingest) ingest(builder);
    else prepare(opts, builder);
  } catch (err) {
    builder.error(err.message);
    log.error(err.message);
  }

  builder.save('mining_report.json');
  return builder.exitCode;
}

if (require.main === module) {
  process.exit(main());
}
