# Sales Pipeline Tracker — Reusable Workspace

**Layer 0 — answers: where am I?**

---

## What this workspace does

A self-contained workspace that turns a raw sales-opportunity spreadsheet into a normalized
dataset, a validation report, and an HTML pipeline report with a sponsor dashboard. It reads the
spreadsheet, splits it into structured records, normalizes inconsistent spellings using editable
mapping tables, calculates KPIs per pipeline, and generates a report that compares this run
against the previous one.

**This folder is fully self-contained.** It does not reference anything outside itself. You can
copy it anywhere and start from scratch.

<!-- INSTANCE:BEGIN — sections specific to this particular copy (team rules, language, production notes). Left blank in the template; fill in per deployment. -->
<!-- INSTANCE:END -->

## Before you start working in this copy

1. Fill in `_config/*.md` with your own reference data (owner names, industries, business units,
   products, team membership, stage definitions). Empty tables are valid — Stage 2 will simply
   pass values through unchanged until you add mappings.
2. Confirm where your spreadsheet actually lands (a shared drive, a downloads folder, an export
   from your CRM) and point `_scripts/manage_pipeline_input.js` at it — see the constant at the
   top of that file.
3. Read `stages/01_convert/CONTEXT.md`, `stages/02_process/CONTEXT.md` and
   `stages/03_report/CONTEXT.md` — each is a one-page contract for what that stage expects and
   produces.

## Structure

```
workspace-template/
├── CLAUDE.md                       ← L0: this file
├── CONTEXT.md                      ← L1: routing
├── _config/                        ← L3: mapping tables (empty/placeholder in this template)
│   ├── ownerNameMap.md             — owner/salesperson name normalization
│   ├── industryMap.md              — industry/vertical normalization
│   ├── businessUnitMap.md          — business unit code → full name, region
│   ├── productMap.md               — product abbreviation → full name
│   ├── teamDefinitions.md          — team membership, for filtering and reporting
│   └── stageDefinitions.md         — pipeline stage meanings and SLA thresholds
├── _prompts/                       ← optional LLM-assisted report-narrative prompts
│   ├── pipeline_report_prompt.md
│   └── sponsor_dashboard_prompt.md
├── stages/
│   ├── 01_convert/CONTEXT.md       — stage contract: spreadsheet → JSON + Markdown
│   ├── 02_process/CONTEXT.md       — stage contract: normalize + validate
│   └── 03_report/CONTEXT.md        — stage contract: KPIs + HTML report
├── _scripts/
│   ├── run_pipeline.js             — runs all stages in sequence
│   ├── manage_pipeline_input.js    — Stage 0: watch a folder, version the input file
│   ├── stage_01_convert.js         — Stage 1
│   ├── stage_02_process.js         — Stage 2
│   └── stage_03_report.js          — Stage 3
├── _input/                         ← versioned spreadsheet inputs land here
└── _output/
    ├── _drafts/                    — generated reports awaiting review
    └── _final/                     — approved reports (also the source for week-over-week deltas)
```

## Design rules that carry over from stage to stage

- **No business-specific value in a script.** Names, codes, and thresholds live in `_config/*.md`.
  If a script needs a new rule, add a table row — do not hardcode an exception.
- **Every stage's output is a plain file you can open and edit.** If Stage 2 gets something wrong,
  you can hand-edit `processed_data.json` and re-run Stage 3 without re-running Stage 1 or 2.
- **Human review points after each stage:** after Stage 1, check the record count and date
  formatting; after Stage 2, read `validation_report.md`; after Stage 3, open the HTML in a
  browser before moving it to `_output/_final/`.
- **Replayability:** re-running a stage with the same input produces the same output. Nothing
  in these scripts depends on wall-clock time except the report's own generation date stamp.

---

**Method:** filesystem-as-orchestration for staged data pipelines.
**Workspace version:** 1.0
