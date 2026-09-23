/**
 * stage_02_process.js
 *
 * Stage 02 — Process, Normalize, and Validate Data
 *
 * Purpose: Normalize pipeline data using config maps and validate owners against a team roster.
 *
 * Inputs:
 *   - stages/01_convert/output/pipeline_data.json
 *   - _config/*.md (normalization maps + team roster)
 *
 * Outputs:
 *   - output/processed_data.json
 *   - output/validation_report.md
 *
 * Usage: node _scripts/stage_02_process.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_FILE = path.join(__dirname, '../stages/01_convert/output/pipeline_data.json');
const OUTPUT_DIR = path.join(__dirname, '../stages/02_process/output');
const CONFIG_DIR = path.join(__dirname, '../_config');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Parse a two-column markdown table into a plain object map.
 * (Business-unit map has a third "Region" column; only the first two columns are used here —
 * see loadBusinessUnitMap for the full three-column parse.)
 */
function parseMarkdownTable(mdContent) {
    const result = {};
    const lines = mdContent.split('\n');

    let inTable = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('#') || trimmed === '') continue;

        if (trimmed.startsWith('|') && trimmed.includes('|')) {
            if (!inTable) {
                inTable = true;
                continue; // header row, skip
            }

            if (trimmed.includes('---')) continue; // separator row

            const cells = trimmed.split('|').map(c => c.trim()).filter(c => c);
            if (cells.length >= 2) {
                result[cells[0]] = cells[1];
            }
        }
    }

    return result;
}

/**
 * Load all config maps
 */
function loadConfigMaps() {
    const maps = {
        industry: {},
        ownerName: {},
        businessUnit: {},
        product: {},
        team: { sales: [], delivery: [], leaders: [] }
    };

    const industryPath = path.join(CONFIG_DIR, 'industryMap.md');
    if (fs.existsSync(industryPath)) {
        maps.industry = parseMarkdownTable(fs.readFileSync(industryPath, 'utf8'));
        console.log(`Loaded ${Object.keys(maps.industry).length} industry mappings`);
    }

    const ownerNamePath = path.join(CONFIG_DIR, 'ownerNameMap.md');
    if (fs.existsSync(ownerNamePath)) {
        maps.ownerName = parseMarkdownTable(fs.readFileSync(ownerNamePath, 'utf8'));
        console.log(`Loaded ${Object.keys(maps.ownerName).length} owner name mappings`);
    }

    const businessUnitPath = path.join(CONFIG_DIR, 'businessUnitMap.md');
    if (fs.existsSync(businessUnitPath)) {
        maps.businessUnit = parseMarkdownTable(fs.readFileSync(businessUnitPath, 'utf8'));
        console.log(`Loaded ${Object.keys(maps.businessUnit).length} business unit mappings`);
    }

    const productPath = path.join(CONFIG_DIR, 'productMap.md');
    if (fs.existsSync(productPath)) {
        maps.product = parseMarkdownTable(fs.readFileSync(productPath, 'utf8'));
        console.log(`Loaded ${Object.keys(maps.product).length} product mappings`);
    }

    const teamPath = path.join(CONFIG_DIR, 'teamDefinitions.md');
    if (fs.existsSync(teamPath)) {
        const content = fs.readFileSync(teamPath, 'utf8');

        const extractNames = (sectionTitle) => {
            const regex = new RegExp(sectionTitle + '[\\s\\S]*?```\\s*([\\s\\S]*?)```');
            const match = content.match(regex);
            if (match) {
                return match[1]
                    .split(/[\r\n,]+/)
                    .map(s => s.trim())
                    .filter(s => s && s.length > 2 && !s.startsWith('-') && !s.includes('**') && s !== '(empty in this template)');
            }
            return [];
        };

        maps.team.sales = extractNames('## Sales Team');
        maps.team.delivery = extractNames('## Delivery / Integration Team');
        maps.team.leaders = extractNames('## Leaders');

        console.log(`Loaded team roster: Sales=${maps.team.sales.length}, Delivery=${maps.team.delivery.length}, Leaders=${maps.team.leaders.length}`);
    }

    return maps;
}

/**
 * Normalize name using map
 */
function normalizeName(name, maps) {
    if (!name) return null;
    const trimmed = name.trim();
    if (trimmed.length < 2) return null;

    if (maps.ownerName[trimmed]) return maps.ownerName[trimmed];

    const lower = trimmed.toLowerCase();
    for (const [key, value] of Object.entries(maps.ownerName)) {
        if (key.toLowerCase() === lower) return value;
    }

    return trimmed;
}

function normalizeIndustry(industry, maps) {
    if (!industry) return null;
    const trimmed = industry.trim();
    return maps.industry[trimmed] || trimmed;
}

function normalizeBusinessUnit(unit, maps) {
    if (!unit) return null;
    const trimmed = unit.trim();
    return maps.businessUnit[trimmed] || trimmed;
}

function normalizeProduct(product, maps) {
    if (!product) return null;
    const trimmed = product.trim();
    return maps.product[trimmed] || trimmed;
}

/**
 * Split a people field (handles multiple names in one cell)
 */
function splitPeople(fieldValue) {
    if (!fieldValue) return [];
    return fieldValue
        .split(/[\r\n,]+/)
        .map(s => s.trim())
        .filter(s => s && s.length > 2);
}

/**
 * Validate owner against the team roster
 */
function validateOwner(owner, roster, maps) {
    const normalized = normalizeName(owner, maps);
    if (!normalized) return { valid: false, error: 'EMPTY', name: owner };

    const exactMatch = roster.find(m => normalizeName(m, maps) === normalized);
    if (exactMatch) return { valid: true, name: exactMatch };

    const lower = normalized.toLowerCase();
    const caseMatch = roster.find(m => normalizeName(m, maps)?.toLowerCase() === lower);
    if (caseMatch) return { valid: true, name: caseMatch };

    // Heuristic: all-caps short tokens or entries ending in a colon are usually a team/queue
    // label, not a person (e.g. "OPS", "QUEUE:") — flag separately from a genuine unknown name.
    if (/^[A-Z]{2,6}:?$/.test(owner.trim())) {
        return { valid: false, error: 'NOT_PERSON', name: owner };
    }

    return { valid: false, error: 'NOT_ON_ROSTER', name: owner };
}

/**
 * Main processing function
 */
function processData() {
    console.log('=== Stage 02: Process & Validate ===\n');

    if (!fs.existsSync(INPUT_FILE)) {
        throw new Error('Input file not found. Run stage_01_convert.js first.');
    }

    const inputData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    console.log(`Loaded ${Object.keys(inputData).length} sheets from Stage 01\n`);

    const maps = loadConfigMaps();
    console.log();

    const roster = [...maps.team.sales, ...maps.team.delivery];

    const validationResult = {
        processed: {},
        validationIssues: [],
        stats: {
            totalRecords: 0,
            normalizedNames: 0,
            normalizedIndustries: 0,
            normalizedBusinessUnits: 0,
            normalizedProducts: 0,
            validationErrors: 0
        }
    };

    for (const [sheetName, sheetData] of Object.entries(inputData)) {
        console.log(`Processing sheet: ${sheetName}`);

        const processedRecords = [];

        for (const record of sheetData.records) {
            const processed = { ...record };

            // Normalize owner field(s) — field name varies by sheet schema
            const ownerField = record['Owner'] !== undefined ? 'Owner' : null;
            if (ownerField && record[ownerField]) {
                const owners = splitPeople(record[ownerField]);
                const normalizedOwners = owners.map(o => normalizeName(o, maps));
                processed[ownerField] = normalizedOwners.filter(n => n).join(', ');

                if (roster.length > 0) {
                    owners.forEach(owner => {
                        const result = validateOwner(owner, roster, maps);
                        if (!result.valid) {
                            validationResult.validationIssues.push({
                                sheet: sheetName,
                                account: record['Account Name'] || record['Project / Account'] || 'Unknown',
                                field: ownerField,
                                value: owner,
                                error: result.error
                            });
                            validationResult.stats.validationErrors++;
                        }
                    });
                }

                if (owners.length !== normalizedOwners.filter(n => n).length) {
                    validationResult.stats.normalizedNames++;
                }
            }

            // Normalize industry
            if (record['Industry']) {
                const original = record['Industry'];
                processed['Industry'] = normalizeIndustry(original, maps);
                if (original !== processed['Industry']) {
                    validationResult.stats.normalizedIndustries++;
                }
            }

            // Normalize business unit
            if (record['Business Unit']) {
                const original = record['Business Unit'];
                processed['Business Unit'] = normalizeBusinessUnit(original, maps);
                if (original !== processed['Business Unit']) {
                    validationResult.stats.normalizedBusinessUnits++;
                }
            }

            // Normalize product line(s)
            if (record['Product Line(s)']) {
                const products = record['Product Line(s)'].split(/[,;]+/).map(s => s.trim());
                const normalized = products.map(p => normalizeProduct(p, maps));
                processed['Product Line(s)'] = normalized.filter(n => n).join(', ');
                if (products.length !== normalized.filter(n => n).length) {
                    validationResult.stats.normalizedProducts++;
                }
            }

            processedRecords.push(processed);
        }

        validationResult.processed[sheetName] = {
            ...sheetData,
            records: processedRecords
        };

        validationResult.stats.totalRecords += processedRecords.length;
        console.log(`  Processed ${processedRecords.length} records`);
    }

    const outputPath = path.join(OUTPUT_DIR, 'processed_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(validationResult, null, 2), 'utf8');
    console.log(`\nProcessed data saved to: ${outputPath}`);

    // Generate validation report
    let report = `# Stage 02 Validation Report\n\n`;
    report += `> Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `| Metric | Value |\n|--------|-------|\n`;
    report += `| Total Records | ${validationResult.stats.totalRecords} |\n`;
    report += `| Normalized Names | ${validationResult.stats.normalizedNames} |\n`;
    report += `| Normalized Industries | ${validationResult.stats.normalizedIndustries} |\n`;
    report += `| Normalized Business Units | ${validationResult.stats.normalizedBusinessUnits} |\n`;
    report += `| Normalized Products | ${validationResult.stats.normalizedProducts} |\n`;
    report += `| Validation Errors | ${validationResult.stats.validationErrors} |\n\n`;

    if (validationResult.validationIssues.length > 0) {
        report += `## Validation Issues\n\n`;
        report += `| Sheet | Account | Field | Value | Error |\n|-------|---------|-------|-------|-------|\n`;

        for (const issue of validationResult.validationIssues.slice(0, 50)) {
            report += `| ${issue.sheet} | ${issue.account} | ${issue.field} | ${issue.value} | ${issue.error} |\n`;
        }

        if (validationResult.validationIssues.length > 50) {
            report += `\n*... and ${validationResult.validationIssues.length - 50} more issues*\n`;
        }
    } else {
        report += `## Validation Issues\n\nNo validation issues found (or the team roster in \`teamDefinitions.md\` is still empty, so no owner validation was performed).\n`;
    }

    const reportPath = path.join(OUTPUT_DIR, 'validation_report.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`Validation report saved to: ${reportPath}`);

    console.log('\nStage 02 processing completed successfully\n');
    console.log('Next step: run stage_03_report.js to generate the HTML report');

    return validationResult;
}

// Run processing
try {
    processData();
} catch (error) {
    console.error('Error during processing:', error.message);
    process.exit(1);
}
