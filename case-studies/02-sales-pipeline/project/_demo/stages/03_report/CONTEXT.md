# Stage 03: Generate HTML Report

**Layer 2: Stage Contract**

---

## Purpose

Generate an interactive HTML report — KPI tiles, stage-distribution bars, ranking tables, and a
week-over-week delta against the previous run — from the normalized pipeline data.

---

## Inputs

| Type | Location | Description |
|------|----------|-------------|
| **Primary** | `../02_process/output/processed_data.json` | Normalized data from Stage 02 |
| **Config** | `../../_config/teamDefinitions.md` | Which owners to show, and who not to omit |
| **History** | `../../_output/_final/pipeline_report_*.html` | Previous report, for the week-over-week delta |

---

## Process

### 1. Load Processed Data

Read `processed_data.json` from Stage 02's output.

### 2. Calculate KPIs

For each pipeline sheet:

| KPI | Calculation |
|-----|-------------|
| Total Opportunities | Count of records |
| Total Units / Scale | Sum of the deal-size field (where the sheet has one) |
| Won | Count where Stage = "Won" |
| On Hold | Count where Stage = "On Hold" |

### 3. Calculate Week-over-Week Delta

- Find the most recent previous report in `_output/_final/`.
- Extract KPI values from its embedded `<script id="report-data">` block.
- Calculate the delta (▲/▼) for each KPI. For "On Hold," an increase is shown as negative
  (red) and a decrease as positive (green) — the direction that is "good" is inverted for this
  one metric.

### 4. Generate HTML Content

Build the KPI tiles, stage-distribution bars, and ranking tables, and embed the current run's
KPI values as JSON (`<script id="report-data">`) so the *next* run can compute its own delta
against this one.

---

## Outputs

| File | Location | Description |
|------|----------|-------------|
| `pipeline_report_YYYYMMDD.html` | `../../_output/_drafts/` | Generated report, for review |
| `pipeline_report_YYYYMMDD.html` | `../../_output/_final/` | Copy here once approved |

---

## Execution

```bash
node ../../_scripts/stage_03_report.js
```

---

## Verification Checklist

- [ ] HTML file created in `_output/_drafts/`
- [ ] KPI tiles show a week-over-week delta (▲/▼) when a previous report exists
- [ ] Stage-distribution bars show percentages that sum to 100%
- [ ] `<script id="report-data">` contains valid JSON
- [ ] Report opens correctly in a browser

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `Processed data not found` | Stage 02 not run | Run `stage_02_process.js` first |
| `No previous report found` | First run, or `_output/_final/` is empty | Expected on the first run — the delta section is simply omitted |

---

## Design Notes

This template's `stage_03_report.js` renders a minimal, dependency-free HTML report inline (no
external template file, no CDN dependencies) so the reference is runnable with nothing but the
`xlsx` package installed. A real deployment will usually want a proper visual template — see the
sibling `_prompts/pipeline_report_prompt.md` for how to hand the same processed data to an LLM to
draft a richer, narrative version instead.

---

**Stage Version:** 1.0
