/**
 * stage_03_report.js
 *
 * Stage 03 — Generate HTML Report
 *
 * Purpose: Generate a self-contained interactive HTML report from the normalized pipeline data:
 * KPI tiles, stage-distribution bars, ranking tables, and a week-over-week delta against the
 * previous run. No external template file and no CDN dependencies — this script renders its own
 * HTML inline so the reference is runnable with nothing but the `xlsx` package installed.
 *
 * Inputs:
 *   - stages/02_process/output/processed_data.json
 *   - _output/_final/pipeline_report_*.html (previous, for week-over-week delta)
 *
 * Usage: node _scripts/stage_03_report.js
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../stages/02_process/output/processed_data.json');
const OUTPUT_DIR = path.join(__dirname, '../_output/_drafts');
const FINAL_DIR = path.join(__dirname, '../_output/_final');
const DATE_STAMP = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const DATE_FORMATTED = new Date().toISOString().split('T')[0];

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(FINAL_DIR)) fs.mkdirSync(FINAL_DIR, { recursive: true });

// The two sheet names this template expects. A real deployment may have different sheet names —
// update these two constants, and the field names referenced below, to match your spreadsheet.
const SALES_SHEET = 'Sales Pipeline';
const DELIVERY_SHEET = 'Delivery Projects';

function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseUnitCount(value) {
    if (value === null || value === undefined) return 0;
    const str = String(value).trim();
    if (!str) return 0;
    if (/^\d+$/.test(str)) return parseInt(str, 10);
    const suffixMatch = str.match(/(\d+(?:\.\d+)?)\s*[kKmM]\b/);
    if (suffixMatch) {
        const num = parseFloat(suffixMatch[1]);
        if (suffixMatch[0].toLowerCase().includes('m')) return Math.round(num * 1000000);
        if (suffixMatch[0].toLowerCase().includes('k')) return Math.round(num * 1000);
    }
    const n = parseInt(str.replace(/[^\d]/g, ''), 10);
    return isNaN(n) ? 0 : n;
}

// ===== PROCESS DATA FROM STAGE 2 =====
function processStage2Data(data) {
    const salesRecords = (data.processed?.[SALES_SHEET]?.records || [])
        .filter(r => r['Account Name'])
        .map(r => ({
            account: r['Account Name'],
            businessUnit: r['Business Unit']?.trim() || null,
            units: parseUnitCount(r['Deal Size (Units)']),
            stage: r['Stage'],
            industry: r['Industry'],
            products: (r['Product Line(s)'] || '').split(/[,;]+/).map(s => s.trim()).filter(Boolean),
            owners: (r['Owner'] || '').split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean),
            supporters: (r['Supported By'] || '').split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean),
        }));

    const deliveryRecords = (data.processed?.[DELIVERY_SHEET]?.records || [])
        .filter(r => r['Project / Account'])
        .map(r => ({
            project: r['Project / Account'],
            businessUnit: r['Business Unit']?.trim() || null,
            stage: r['Stage'],
            owners: (r['Owner'] || '').split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean),
            description: r['Project Description'] || '',
        }));

    return { salesRecords, deliveryRecords };
}

// ===== PIPELINE STATS =====
function pipelineStats(records) {
    const totalOpportunities = records.length;
    const totalUnits = records.reduce((s, r) => s + (r.units || 0), 0);
    const won = records.filter(r => r.stage === 'Won').length;
    const onHold = records.filter(r => r.stage === 'On Hold').length;

    const stageDist = {};
    records.forEach(r => { if (r.stage) stageDist[r.stage] = (stageDist[r.stage] || 0) + 1; });

    const buMap = {};
    records.forEach(r => {
        if (r.businessUnit) {
            if (!buMap[r.businessUnit]) buMap[r.businessUnit] = { count: 0, units: 0 };
            buMap[r.businessUnit].count++;
            buMap[r.businessUnit].units += (r.units || 0);
        }
    });
    const businessUnitRank = Object.entries(buMap)
        .map(([name, d]) => ({ name, count: d.count, units: d.units }))
        .sort((a, b) => b.count - a.count);

    const industryMap = {};
    records.forEach(r => { if (r.industry) industryMap[r.industry] = (industryMap[r.industry] || 0) + 1; });
    const industryRank = Object.entries(industryMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const productMap = {};
    records.forEach(r => { (r.products || []).forEach(p => { productMap[p] = (productMap[p] || 0) + 1; }); });
    const productRank = Object.entries(productMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return { totalOpportunities, totalUnits, won, onHold, stageDist, businessUnitRank, industryRank, productRank };
}

function deliveryStats(records) {
    const totalProjects = records.length;
    const stageDist = {};
    records.forEach(r => { if (r.stage) stageDist[r.stage] = (stageDist[r.stage] || 0) + 1; });

    const buMap = {};
    records.forEach(r => { if (r.businessUnit) buMap[r.businessUnit] = (buMap[r.businessUnit] || 0) + 1; });
    const businessUnitRank = Object.entries(buMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return { totalProjects, stageDist, businessUnitRank, projects: records };
}

// ===== DELTA CALCULATION =====
function calcDelta(current, prev, isInverted) {
    if (prev === null || prev === undefined) return null;
    const diff = current - prev;
    if (diff === 0) return { class: 'neutral', text: '— 0' };
    const sign = diff > 0 ? '+' : '';
    const isPositive = isInverted ? diff < 0 : diff > 0;
    const arrow = isInverted ? (diff > 0 ? '▼' : '▲') : (diff > 0 ? '▲' : '▼');
    return { class: isPositive ? 'positive' : 'negative', text: arrow + ' ' + sign + diff };
}

// ===== HTML GENERATORS =====
function kpiTile(val, label, color, delta) {
    const deltaHtml = delta ? `<div class="delta ${delta.class}">${delta.text}</div>` : '';
    return `<div class="tile" style="border-top-color:${color}">
      <div class="stat">${esc(val)}</div>
      <div class="label">${esc(label)}</div>
      ${deltaHtml}
    </div>`;
}

function stageDistHTML(dist) {
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    if (!total) return '<p class="no-data">No stage data</p>';
    let h = '<div class="stage-dist">';
    for (const [s, c] of Object.entries(dist)) {
        if (!c) continue;
        const pct = ((c / total) * 100).toFixed(1);
        h += `<div class="sr"><div class="sl">${esc(s)}</div>
          <div class="sb-c"><div class="sb" style="width:${pct}%"></div></div>
          <div class="sc">${c} <span class="sp">(${pct}%)</span></div></div>`;
    }
    return h + '</div>';
}

function rankTable(items, showUnits) {
    if (!items.length) return '<p class="no-data">No data</p>';
    const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
    let h = '<table class="rt"><thead><tr><th>#</th><th>Name</th>';
    h += showUnits ? '<th>Opportunities</th><th>Units</th>' : '<th>Count</th>';
    h += '</tr></thead><tbody>';
    items.forEach((it, i) => {
        h += `<tr><td>${i < 3 ? medals[i] : i + 1}</td><td>${esc(it.name)}</td>`;
        h += showUnits ? `<td>${it.count}</td><td>${(it.units || 0).toLocaleString()}</td>` : `<td>${it.count}</td>`;
        h += '</tr>';
    });
    return h + '</tbody></table>';
}

function projectTable(items) {
    if (!items.length) return '<p class="no-data">No projects</p>';
    let h = '<table class="rt"><thead><tr><th>#</th><th>Project</th><th>Stage</th><th>Description</th></tr></thead><tbody>';
    items.forEach((p, i) => {
        const d = (p.description || '').substring(0, 200) + (p.description && p.description.length > 200 ? '...' : '');
        h += `<tr><td>${i + 1}</td><td>${esc(p.project)}</td><td>${esc(p.stage || 'N/A')}</td><td class="dc">${esc(d)}</td></tr>`;
    });
    return h + '</tbody></table>';
}

// ===== FIND PREVIOUS REPORT =====
function findPreviousReport() {
    if (!fs.existsSync(FINAL_DIR)) return null;
    const files = fs.readdirSync(FINAL_DIR)
        .filter(f => /^pipeline_report_\d{8}\.html$/.test(f))
        .filter(f => f !== `pipeline_report_${DATE_STAMP}.html`)
        .sort();
    const prevFiles = files.filter(f => {
        const dateStr = f.match(/(\d{8})/)[1];
        return dateStr < DATE_STAMP;
    });
    return prevFiles.length > 0 ? path.join(FINAL_DIR, prevFiles[prevFiles.length - 1]) : null;
}

function extractPrevData(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf-8');
        const jsonMatch = html.match(/<script id="report-data" type="application\/json">([\s\S]*?)<\/script>/);
        if (jsonMatch) return JSON.parse(jsonMatch[1]);
        return null;
    } catch (e) {
        console.error('Error extracting previous report data:', e.message);
        return null;
    }
}

// ===== MAIN =====
console.log('=== Stage 03: Generate HTML Report ===\n');

if (!fs.existsSync(INPUT_FILE)) {
    throw new Error('Processed data not found. Run stage_02_process.js first.');
}

const stage2Data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
console.log('Loaded processed data from Stage 02\n');

const { salesRecords, deliveryRecords } = processStage2Data(stage2Data);
console.log(`Records: Sales Pipeline=${salesRecords.length}, Delivery Projects=${deliveryRecords.length}\n`);

const salesStats = pipelineStats(salesRecords);
const deliveryStatsResult = deliveryStats(deliveryRecords);

const executive = {
    totalOpportunities: salesStats.totalOpportunities + deliveryStatsResult.totalProjects,
    totalUnits: salesStats.totalUnits,
    won: salesStats.won,
    onHold: salesStats.onHold,
};

let prevData = null;
const prevReportPath = findPreviousReport();
if (prevReportPath) {
    console.log('Previous report found:', path.basename(prevReportPath));
    prevData = extractPrevData(prevReportPath);
} else {
    console.log('No previous report found - week-over-week delta will not be displayed');
}

const ePrev = prevData && prevData.executive ? prevData.executive : {};
const sPrev = prevData && prevData.sales ? prevData.sales : {};
const dPrev = prevData && prevData.delivery ? prevData.delivery : {};

const execKPIs =
    kpiTile(executive.totalOpportunities, 'Total Opportunities', '#2451B8', calcDelta(executive.totalOpportunities, ePrev.totalOpportunities, false)) +
    kpiTile(executive.totalUnits.toLocaleString(), 'Total Units', '#3B82F6', calcDelta(executive.totalUnits, ePrev.totalUnits, false)) +
    kpiTile(executive.won, 'Won', '#059669', calcDelta(executive.won, ePrev.won, false)) +
    kpiTile(executive.onHold, 'On Hold', '#DC2626', calcDelta(executive.onHold, ePrev.onHold, true));

const salesKPIs =
    kpiTile(salesStats.totalOpportunities, 'Opportunities', '#2451B8', calcDelta(salesStats.totalOpportunities, sPrev.totalOpportunities, false)) +
    kpiTile(salesStats.totalUnits.toLocaleString(), 'Total Units', '#3B82F6', calcDelta(salesStats.totalUnits, sPrev.totalUnits, false)) +
    kpiTile(salesStats.won, 'Won', '#059669', calcDelta(salesStats.won, sPrev.won, false)) +
    kpiTile(salesStats.onHold, 'On Hold', '#DC2626', calcDelta(salesStats.onHold, sPrev.onHold, true));

const deliveryKPIs =
    kpiTile(deliveryStatsResult.totalProjects, 'Projects', '#2451B8', calcDelta(deliveryStatsResult.totalProjects, dPrev.totalProjects, false));

const reportDataObj = {
    dateStamp: DATE_STAMP,
    executive: { totalOpportunities: executive.totalOpportunities, totalUnits: executive.totalUnits, won: executive.won, onHold: executive.onHold },
    sales: { totalOpportunities: salesStats.totalOpportunities, totalUnits: salesStats.totalUnits, won: salesStats.won, onHold: salesStats.onHold },
    delivery: { totalProjects: deliveryStatsResult.totalProjects },
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sales Pipeline Report - ${DATE_FORMATTED}</title>
<style>
  :root { --primary:#2451B8; --primary-dark:#173A8A; --bg:#F7F9FC; --card:#FFFFFF; --text:#1F2937; --muted:#6B7280; --border:#E5E7EB; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 24px; }
  h1 { color: var(--primary-dark); font-size: 1.5em; }
  h2.st { color: var(--primary-dark); border-bottom: 2px solid var(--border); padding-bottom: 8px; margin-top: 32px; }
  .meta { color: var(--muted); font-size: 0.9em; margin-bottom: 24px; }
  .tabs { display: flex; gap: 4px; border-bottom: 2px solid var(--border); margin-bottom: 24px; }
  .tab-btn { padding: 10px 18px; cursor: pointer; border: none; background: none; font-weight: 600; color: var(--muted); border-bottom: 3px solid transparent; }
  .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
  .tab-content { display: none; }
  .tab-content.active { display: block; }
  .kg { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .tile { background: var(--card); border-top: 4px solid var(--primary); border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .tile .stat { font-size: 2em; font-weight: 700; color: var(--primary-dark); }
  .tile .label { font-size: 0.8em; text-transform: uppercase; color: var(--muted); margin-top: 4px; }
  .delta { font-size: 0.85em; font-weight: 600; margin-top: 6px; }
  .delta.positive { color: #059669; }
  .delta.negative { color: #DC2626; }
  .delta.neutral { color: #94A3B8; }
  .sec { background: var(--card); border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  table.rt { width: 100%; border-collapse: collapse; margin-top: 8px; }
  table.rt th { background: var(--primary-dark); color: #fff; text-align: left; padding: 8px 10px; font-size: 0.85em; }
  table.rt td { padding: 8px 10px; border-bottom: 1px solid var(--border); font-size: 0.9em; }
  table.rt tr:nth-child(even) { background: #FAFBFD; }
  .dc { color: var(--muted); }
  .stage-dist .sr { display: grid; grid-template-columns: 140px 1fr 80px; align-items: center; gap: 8px; margin-bottom: 6px; }
  .sb-c { background: #EEF1F6; border-radius: 6px; overflow: hidden; height: 14px; }
  .sb { background: var(--primary); height: 100%; }
  .sp { color: var(--muted); }
  .no-data { color: var(--muted); font-style: italic; }
</style>
</head>
<body>
<h1>Sales Pipeline Report</h1>
<div class="meta">Generated ${DATE_FORMATTED}${prevData ? ' &middot; compared against ' + prevData.dateStamp : ' &middot; no prior report to compare against'}</div>

<div class="tabs">
  <button class="tab-btn active" onclick="swTab(this,'executive')">Executive Summary</button>
  <button class="tab-btn" onclick="swTab(this,'sales')">Sales Pipeline</button>
  <button class="tab-btn" onclick="swTab(this,'delivery')">Delivery Projects</button>
</div>

<div id="executive" class="tab-content active">
  <div class="kg">${execKPIs}</div>
  <div class="sec"><h2 class="st">Top Business Units</h2>${rankTable(salesStats.businessUnitRank.slice(0, 10), true)}</div>
  <div class="sec"><h2 class="st">Top Industries</h2>${rankTable(salesStats.industryRank.slice(0, 10), false)}</div>
</div>

<div id="sales" class="tab-content">
  <div class="kg">${salesKPIs}</div>
  <div class="sec"><h2 class="st">Stage Distribution</h2>${stageDistHTML(salesStats.stageDist)}</div>
  <div class="sec"><h2 class="st">Business Units</h2>${rankTable(salesStats.businessUnitRank, true)}</div>
  <div class="sec"><h2 class="st">Product Lines</h2>${rankTable(salesStats.productRank, false)}</div>
</div>

<div id="delivery" class="tab-content">
  <div class="kg">${deliveryKPIs}</div>
  <div class="sec"><h2 class="st">Stage Distribution</h2>${stageDistHTML(deliveryStatsResult.stageDist)}</div>
  <div class="sec"><h2 class="st">Business Units</h2>${rankTable(deliveryStatsResult.businessUnitRank, false)}</div>
  <div class="sec"><h2 class="st">All Projects</h2>${projectTable(deliveryStatsResult.projects)}</div>
</div>

<script id="report-data" type="application/json">${JSON.stringify(reportDataObj)}</script>
<script>
function swTab(btn, id) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(id).classList.add('active');
}
</script>
</body>
</html>`;

const draftPath = path.join(OUTPUT_DIR, `pipeline_report_${DATE_STAMP}.html`);
const finalPath = path.join(FINAL_DIR, `pipeline_report_${DATE_STAMP}.html`);

fs.writeFileSync(draftPath, html, 'utf-8');
fs.writeFileSync(finalPath, html, 'utf-8');

console.log('\nReport saved to:', draftPath);
console.log('Report saved to:', finalPath);
console.log('\nStage 03 completed successfully!');
console.log('Week-over-week delta: ' + (prevData ? 'enabled' : 'no prior data'));
