#!/usr/bin/env node
'use strict';

/**
 * Stage 03.5 — Generate HTML (optional).
 *
 * Renders Stage 03's resolved scope into one self-contained HTML report. If
 * Stage 03.2 produced output/curation.md, its Include column trims which
 * pain points appear here; otherwise the full scope is rendered.
 */

const fs = require('fs');
const path = require('path');
const { ArtifactBuilder, readRequired } = require('../../../_lib/artifact');
const { log } = require('../../../_lib/log');

const { generate, loadCss } = require('./_scripts/generate_html');
const { readIncluded } = require('../03.2_curate_scope/_scripts/curation_table');

const STAGE_ID = '03.5';
const STAGE_NAME = 'Generate HTML';
const RENDER_STAGE_DIR = path.join(__dirname, '..', '03_render_slidedeck');
const CURATE_STAGE_DIR = path.join(__dirname, '..', '03.2_curate_scope');

function main() {
  const builder = new ArtifactBuilder(__dirname, STAGE_ID, STAGE_NAME);

  try {
    const renderReport = readRequired(RENDER_STAGE_DIR, 'render_report.json');
    const scope = JSON.parse(fs.readFileSync(path.join(RENDER_STAGE_DIR, 'output', 'filtered_data.json'), 'utf8'));
    builder.input(path.join(RENDER_STAGE_DIR, 'output', 'filtered_data.json'), 'resolved scope from Stage 03');

    const config = renderReport.config;
    // render_report.json's config summary carries `vertical` as "V01 (Name)";
    // reconstruct enough of it for the template.
    const verticalMatch = /^(\S+)\s*\((.+)\)$/.exec(config.vertical || '');
    const vertical = { id: verticalMatch ? verticalMatch[1] : config.vertical, name: verticalMatch ? verticalMatch[2] : config.vertical, description: '' };
    const fullConfig = { ...config, vertical };

    const curationPath = path.join(CURATE_STAGE_DIR, 'output', 'curation.md');
    const includedIds = readIncluded(curationPath);
    if (includedIds) builder.input(curationPath, 'curation shortlist');

    const referencesDir = path.join(__dirname, 'references');
    const css = loadCss(referencesDir);
    const html = generate({ scope, config: fullConfig, css, includedIds });

    builder.writeFile('report.html', html, 'self-contained HTML report');
    builder.counts({
      pains_rendered: (includedIds ? scope.pains.filter((p) => includedIds.has(p.id)) : scope.pains).length,
      pains_in_scope: scope.pains.length,
      curated: !!includedIds
    });

    log.ok('Wrote output/report.html');
  } catch (err) {
    builder.error(err.message);
    log.error(err.message);
  }

  builder.save('html_report.json');
  return builder.exitCode;
}

if (require.main === module) {
  process.exit(main());
}
