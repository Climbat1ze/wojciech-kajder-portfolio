/**
 * run_pipeline.js
 *
 * Full workflow orchestrator — runs all stages of the sales pipeline tracker in sequence.
 *
 * Usage: node _scripts/run_pipeline.js
 *
 * Stages:
 *   0. manage_pipeline_input.js — copy the latest spreadsheet export into _input/ with a date stamp
 *   1. stage_01_convert.js      — spreadsheet -> JSON + Markdown
 *   2. stage_02_process.js      — normalize + validate
 *   3. stage_03_report.js       — generate the HTML report
 */

const { execSync } = require('child_process');
const path = require('path');

const SCRIPTS_DIR = __dirname;

function runStage(name, script) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  STAGE ${name}`);
    console.log('='.repeat(60));

    try {
        execSync(`node "${path.join(SCRIPTS_DIR, script)}"`, { encoding: 'utf8', stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`\nStage ${name} failed!`);
        return false;
    }
}

function main() {
    console.log('\nSALES PIPELINE TRACKER - FULL RUN\n');

    const startTime = Date.now();

    if (!runStage('0/3: Input Management', 'manage_pipeline_input.js')) {
        console.log('\nPipeline stopped at Stage 0. If you already placed a file directly in');
        console.log('_input/, this is fine to ignore - Stage 1 will pick it up.');
    }

    if (!runStage('1/3: Convert Spreadsheet', 'stage_01_convert.js')) {
        console.log('\nPipeline stopped at Stage 1');
        process.exit(1);
    }

    if (!runStage('2/3: Process & Validate', 'stage_02_process.js')) {
        console.log('\nPipeline stopped at Stage 2');
        process.exit(1);
    }

    if (!runStage('3/3: Generate Report', 'stage_03_report.js')) {
        console.log('\nPipeline stopped at Stage 3');
        process.exit(1);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\nPIPELINE COMPLETED SUCCESSFULLY');
    console.log(`Total duration: ${duration}s`);
    console.log('\nOutput files:');
    console.log('   - stages/01_convert/output/pipeline_data.json');
    console.log('   - stages/01_convert/output/pipeline_data.md');
    console.log('   - stages/02_process/output/processed_data.json');
    console.log('   - stages/02_process/output/validation_report.md');
    console.log('   - _output/_drafts/pipeline_report_*.html');
    console.log('\nNext steps:');
    console.log('   1. Review validation_report.md for any issues');
    console.log('   2. Open the HTML report in a browser');
    console.log('   3. Copy it to _output/_final/ once approved');
}

main();
