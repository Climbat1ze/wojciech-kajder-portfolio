/**
 * stage_01_convert.js
 *
 * Stage 01 — Convert spreadsheet to JSON + Markdown
 *
 * Purpose: Convert the raw sales-pipeline XLSX export into structured JSON and Markdown.
 *
 * Inputs:
 *   - ../_input/pipeline_*.xlsx (latest, by filename sort)
 *
 * Process:
 *   - Read all sheets from the workbook
 *   - Convert Excel dates to ISO format
 *   - Generate JSON with structured data
 *   - Generate Markdown tables for human review
 *
 * Outputs:
 *   - output/pipeline_data.json
 *   - output/pipeline_data.md
 *
 * Usage: node _scripts/stage_01_convert.js
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Configuration
const INPUT_DIR = path.join(__dirname, '../_input');
const OUTPUT_DIR = path.join(__dirname, '../stages/01_convert/output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Find the latest XLSX file in _input/
 */
function findLatestInput() {
    if (!fs.existsSync(INPUT_DIR)) {
        throw new Error('_input/ directory not found. Run manage_pipeline_input.js first.');
    }

    const files = fs.readdirSync(INPUT_DIR)
        .filter(f => f.startsWith('pipeline_') && f.endsWith('.xlsx'))
        .sort()
        .reverse();

    if (files.length === 0) {
        throw new Error('No pipeline_*.xlsx found in _input/. Drop a spreadsheet there (or run manage_pipeline_input.js).');
    }

    console.log(`Using input file: ${files[0]}`);
    return path.join(INPUT_DIR, files[0]);
}

/**
 * Convert Excel serial date to ISO date
 */
function excelDateToISO(excelDate) {
    if (excelDate === null || excelDate === undefined || excelDate === '') return null;

    if (typeof excelDate === 'string') {
        const datePatterns = [
            /^(\d{4})-(\d{2})-(\d{2})$/,
            /^(\d{2})\/(\d{2})\/(\d{4})$/,
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        ];

        for (const pattern of datePatterns) {
            const match = excelDate.match(pattern);
            if (match) {
                if (pattern === datePatterns[0]) return excelDate;
                if (pattern === datePatterns[1]) {
                    return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
                }
                const d = new Date(excelDate);
                if (!isNaN(d)) return d.toISOString().split('T')[0];
            }
        }
        return excelDate;
    }

    if (typeof excelDate === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + excelDate * 24 * 60 * 60 * 1000);
        return date.toISOString().split('T')[0];
    }

    return null;
}

/**
 * Check if column name suggests it's a date column
 */
function isDateColumn(headerName) {
    if (!headerName) return false;
    const header = String(headerName).toLowerCase();
    return header.includes('date') || header.includes('deadline');
}

/**
 * Clean value for Markdown
 */
function cleanForMD(value) {
    if (value === null || value === undefined) return '';
    let str = String(value);
    str = str.replace(/\|/g, '\\|');
    str = str.replace(/[\r\n]+/g, ' ');
    str = str.replace(/\r/g, '');
    return str;
}

/**
 * Process cell value
 */
function processCell(value, headerName) {
    if (value === null || value === undefined || value === '') return null;

    if (headerName && isDateColumn(headerName)) {
        return excelDateToISO(value);
    }

    return value;
}

/**
 * Main conversion function
 */
function convertXLSX() {
    const inputPath = findLatestInput();
    console.log('Reading spreadsheet:', inputPath);

    const workbook = XLSX.readFile(inputPath);
    const result = {};
    let totalRecords = 0;

    console.log('Found sheets:', workbook.SheetNames);

    for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });

        if (rawData.length < 2) {
            console.log(`Skipping sheet "${sheetName}" - not enough rows`);
            continue;
        }

        // Row 1 = title, Row 2 = headers, Row 3+ = records
        const title = rawData[0] ? rawData[0][0] || sheetName : sheetName;
        const headers = rawData[1] || [];

        const validHeaderIndices = [];
        headers.forEach((h, i) => {
            if (h && String(h).trim()) {
                validHeaderIndices.push(i);
            }
        });

        const validHeaders = validHeaderIndices.map(i => String(headers[i]).trim());

        const records = [];
        for (let i = 2; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.every(cell => !cell || String(cell).trim() === '')) continue;

            const record = {};
            validHeaderIndices.forEach((headerIdx, j) => {
                const headerName = validHeaders[j];
                const rawValue = row[headerIdx];
                record[headerName] = processCell(rawValue, headerName);
            });

            // Filter out ghost rows
            const firstCol = record[validHeaders[0]];
            if (!firstCol || String(firstCol).trim() === '') continue;

            records.push(record);
        }

        result[sheetName] = {
            title: title,
            headers: validHeaders,
            records: records
        };

        totalRecords += records.length;
        console.log(`  Sheet "${sheetName}": ${records.length} records, ${validHeaders.length} columns`);
    }

    // Save JSON
    const jsonPath = path.join(OUTPUT_DIR, 'pipeline_data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
    console.log('\nJSON saved to:', jsonPath);

    // Generate Markdown
    let mdContent = `# Sales Pipeline — Converted Data\n\n`;
    mdContent += `> Generated: ${new Date().toISOString()}\n`;
    mdContent += `> Source: ${path.basename(inputPath)}\n`;
    mdContent += `> Total Records: ${totalRecords}\n\n`;

    for (const [sheetName, data] of Object.entries(result)) {
        mdContent += `---\n\n## ${data.title}\n\n`;
        mdContent += `*Sheet: ${sheetName}*\n\n`;
        mdContent += `**Records:** ${data.records.length}\n\n`;

        if (data.headers.length > 0 && data.records.length > 0) {
            mdContent += '| ' + data.headers.map(h => cleanForMD(h)).join(' | ') + ' |\n';
            mdContent += '| ' + data.headers.map(() => '---').join(' | ') + ' |\n';

            const displayRecords = data.records.slice(0, 50);
            for (const record of displayRecords) {
                mdContent += '| ' + data.headers.map(h => cleanForMD(record[h] || '')).join(' | ') + ' |\n';
            }

            if (data.records.length > 50) {
                mdContent += `\n*... and ${data.records.length - 50} more records*\n`;
            }
        }

        mdContent += '\n';
    }

    const mdPath = path.join(OUTPUT_DIR, 'pipeline_data.md');
    fs.writeFileSync(mdPath, mdContent, 'utf8');
    console.log('Markdown saved to:', mdPath);

    console.log('\n=== VERIFICATION ===');
    console.log('Total sheets:', Object.keys(result).length);
    console.log('Total records:', totalRecords);

    return result;
}

// Run conversion
try {
    convertXLSX();
    console.log('\nStage 01 conversion completed successfully\n');
    console.log('Next step: run stage_02_process.js to normalize and validate data');
} catch (error) {
    console.error('Error during conversion:', error.message);
    process.exit(1);
}
