# Sales Pipeline Reference

A reusable reference implementation for turning a raw sales-opportunity spreadsheet into staged
pipeline reports and a sponsor dashboard — via a filesystem-as-orchestration method: numbered
stages, config-driven mapping tables, and (optionally) an LLM-assisted step for turning the
processed numbers into a written report.

**Nothing in this folder is real company data.** Every name, business unit, industry and number
you'll see in `_demo/` is invented. The method — the stage structure, the mapping-table approach,
the way stages hand off to each other through plain files — is the thing being shared.

---

## The problem this solves

A sales team tracks its pipeline in a spreadsheet. The spreadsheet is inconsistent: the same
salesperson's name is spelled three different ways, "Healthcare" and "Health Care" and "Pharma"
are all really the same industry bucket, and a business unit is sometimes written as a short code
and sometimes spelled out. Every week someone needs a clean report and a dashboard built from
that spreadsheet, and the cleanup logic keeps drifting because it lives inside a script that only
one person can safely edit.

This method moves the cleanup logic out of code and into plain Markdown tables that anyone can
edit, and it splits the work into stages small enough that a person (or an AI assistant) can
review the output of each one before moving to the next.

## How it works

```
Raw spreadsheet
    │  (Stage 0: watch a folder, copy the newest file in with a date stamp)
    ▼
Dated input file
    │  (Stage 1: convert — read every sheet, turn Excel dates into ISO dates,
    │   emit structured JSON and a human-readable Markdown table)
    ▼
Structured JSON + Markdown
    │  (Stage 2: process — apply the mapping tables: normalize owner names,
    │   industries, business units, product names; flag anything that doesn't
    │   match a known reference list)
    ▼
Normalized JSON + validation report
    │  (Stage 3: report — calculate KPIs per pipeline, compare against last
    │   week's report for week-over-week deltas, generate an HTML report)
    ▼
HTML report + sponsor dashboard
```

Each stage:
- reads from a fixed, documented location (the previous stage's output, or a config file),
- writes to a fixed, documented location,
- has a one-page **contract** (`stages/<NN>_<name>/CONTEXT.md`) describing inputs, the
  transformation, outputs, and a verification checklist,
- can be re-run on its own — fixing a config table and re-running only Stage 2 and 3 is normal
  and expected; you do not need to redo Stage 1.

## The mapping-table approach

All business-specific normalization lives in `_config/*.md`, as plain Markdown tables:

| File | Normalizes |
|---|---|
| `ownerNameMap.md` | Inconsistent spellings of a salesperson/owner's name to one canonical form |
| `industryMap.md` | Inconsistent industry labels ("Gov", "Public Sector", "Government") to one canonical vertical |
| `businessUnitMap.md` | Short business-unit codes to full names and region |
| `productMap.md` | Product abbreviations to full product names |
| `teamDefinitions.md` | Who is on which team, for filtering and always-show-even-if-zero reporting |
| `stageDefinitions.md` | What each pipeline stage means, and SLA thresholds for how long a deal should sit in a stage |

Adding a new mapping is editing a Markdown table row — never a code change. This is the same
reason spreadsheets are popular for this kind of work, without the downside of the logic being
impossible to audit.

## Two-schema pipelines

A single tracker often holds more than one kind of pipeline with genuinely different shapes: a
standard sales pipeline (deal size in units, a sales stage, an owner) and a delivery/integration
pipeline (no unit count, a different stage vocabulary, a different owner field). The reference
keeps these as **separate sheets with separate schemas** rather than forcing one shape onto both —
see `_config/stageDefinitions.md` and the `Sales Pipeline` vs. `Delivery Projects` sheets in the
demo data. Combining them into one ranking or one KPI set is a modelling mistake worth avoiding;
report on each on its own terms and combine only at the executive-summary level (counts, not
comparable scores).

## Quick start (a new, real deployment)

1. Copy `workspace-template/` to a new folder (name it after your team or pipeline).
2. Fill in `_config/*.md` with your own owner names, industries, business units and products —
   or leave them empty and let Stage 2 pass values through unchanged until you add mappings.
3. Drop your spreadsheet where `_scripts/manage_pipeline_input.js` expects it (see that script's
   header comment — by default, a `Downloads`-style folder you configure).
4. Run `node _scripts/run_pipeline.js` from inside your copy. This runs all four stages in
   sequence.
5. Review `stages/02_process/output/validation_report.md` for anything that didn't match a known
   name or industry, then open the HTML report in `_output/_drafts/`.
6. Once you're happy with it, copy it to `_output/_final/` — that's the one you hand out.

## Quick start (seeing it work first)

Open `_demo/` instead. It has the same engine, a fictional 18-row spreadsheet-equivalent
(`_demo/_input/`), filled-in demo mapping tables, and the actual generated output at every stage
— JSON, validation report, HTML report — produced by really running the pipeline against the
fictional data. Read `_demo/CLAUDE.md` for a tour.

## What "LLM-assisted" means here

The core pipeline (Stages 0–2, and the KPI/HTML mechanics of Stage 3) is deterministic code —
same input, same output, every time. The optional layer on top, in `_prompts/`, is for turning
the *processed numbers* into prose: an executive summary, a sponsor-facing narrative, a written
explanation of what changed week over week. That is where an LLM adds value over a template
string — everything upstream of it does not need one.

---

**Style note:** this README follows the same plain-overview-first, quick-start-second structure
used elsewhere in this family of reference workspaces (see the sibling PM-tracking reference's
own README for the same shape, if you have access to it) — a short problem statement, a diagram,
then "how do I actually start."
