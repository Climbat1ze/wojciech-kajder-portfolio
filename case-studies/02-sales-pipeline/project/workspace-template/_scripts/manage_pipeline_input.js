/**
 * manage_pipeline_input.js
 *
 * Stage 0 — Input Management
 *
 * Purpose: Watch a folder for the latest sales-pipeline spreadsheet export and copy it into
 * _input/ with a date-stamped filename, keeping an audit trail of every update.
 *
 * Configure WATCH_DIR below to point at wherever your spreadsheet actually lands — a shared
 * drive, a CRM export folder, or (as a starting default) your Downloads folder.
 *
 * Usage: node _scripts/manage_pipeline_input.js
 */

const fs = require('fs');
const path = require('path');

// ===== CONFIGURE THIS =====
// Where the raw spreadsheet export lands before you pick it up. Point this at your own
// shared-drive folder, CRM export location, or similar. Defaults to Downloads as a starting point.
const WATCH_DIR = path.join(process.env.USERPROFILE || process.env.HOME || '.', 'Downloads');
// The filename prefix this script looks for in WATCH_DIR, e.g. "pipeline_export (3).xlsx".
const FILE_PREFIX = 'pipeline';
// ===========================

const INPUT_DIR = path.join(__dirname, '../_input');
const MANIFEST_FILE = path.join(INPUT_DIR, '_input_manifest.json');

if (!fs.existsSync(INPUT_DIR)) {
    fs.mkdirSync(INPUT_DIR, { recursive: true });
    console.log('Created _input/ directory');
}

function findLatestXLSX() {
    if (!fs.existsSync(WATCH_DIR)) {
        console.error('Watched folder not found:', WATCH_DIR);
        return null;
    }

    const files = fs.readdirSync(WATCH_DIR)
        .filter(f => f.toLowerCase().startsWith(FILE_PREFIX.toLowerCase()) && f.endsWith('.xlsx'))
        .sort((a, b) => {
            const statA = fs.statSync(path.join(WATCH_DIR, a));
            const statB = fs.statSync(path.join(WATCH_DIR, b));
            return statB.mtimeMs - statA.mtimeMs;
        });

    if (files.length === 0) {
        console.log(`No ${FILE_PREFIX}*.xlsx found in ${WATCH_DIR}`);
        return null;
    }

    console.log(`Found ${files.length} matching file(s) in ${WATCH_DIR}`);
    console.log(`   Latest: ${files[0]}`);

    return files[0];
}

function generateVersionedFilename(originalName) {
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const ext = path.extname(originalName);
    return `${FILE_PREFIX}_${dateStamp}${ext}`;
}

function countRecords(xlsxPath) {
    try {
        const XLSX = require('xlsx');
        const workbook = XLSX.readFile(xlsxPath);
        let totalRecords = 0;

        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            totalRecords += Math.max(0, rawData.length - 2); // minus title + header rows
        }

        return totalRecords;
    } catch (e) {
        console.log('Could not count records:', e.message);
        return -1;
    }
}

function updateManifest(sourceFile, versionedFile, recordCount) {
    let manifest = { updates: [] };

    if (fs.existsSync(MANIFEST_FILE)) {
        try {
            manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
        } catch (e) {
            console.log('Could not read manifest, creating a new one');
        }
    }

    manifest.updates.unshift({
        date: new Date().toISOString().slice(0, 10),
        timestamp: new Date().toISOString(),
        sourceFile,
        versionedFile,
        recordCount,
        notes: 'Routine input update'
    });

    if (manifest.updates.length > 52) {
        manifest.updates = manifest.updates.slice(0, 52);
    }

    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('Input manifest updated');
}

function manageInput() {
    console.log('=== Pipeline Input Manager ===\n');

    const latestFile = findLatestXLSX();
    if (!latestFile) {
        console.log('\nNo action needed - no new file found');
        return;
    }

    const sourcePath = path.join(WATCH_DIR, latestFile);
    const versionedName = generateVersionedFilename(latestFile);
    const inputPath = path.join(INPUT_DIR, versionedName);

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const alreadyCopied = fs.readdirSync(INPUT_DIR).some(f => f.includes(today) && f.endsWith('.xlsx'));

    if (alreadyCopied) {
        console.log(`A file for today (${today}) already exists in _input/ - skipping copy`);
    } else {
        fs.copyFileSync(sourcePath, inputPath);
        console.log(`Copied to _input/: ${versionedName}`);
    }

    const recordCount = countRecords(sourcePath);
    if (recordCount > 0) {
        console.log(`Record count: ${recordCount}`);
        updateManifest(latestFile, versionedName, recordCount);
    }

    console.log('\nInput management complete!\n');
    console.log('Next step: run stage_01_convert.js');
}

manageInput();
