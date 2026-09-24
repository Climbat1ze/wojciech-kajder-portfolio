# Vertical Offering Generator

A reference implementation for generating industry-vertical offering
documents from a feature-to-pain-point-to-vertical mapping, using an
LLM-assisted authoring pipeline with a structured product-manager (PM) review
and feedback loop — via a filesystem-as-orchestration method.

This copy (`workspace-template/`) is the engine only: every reference table
is empty or a placeholder. To see the whole thing run against a small,
entirely fictional example first, look at the sibling `_demo/` folder.

## Requirements

- Node.js 18+ (no external packages — everything under `_flows/` uses only
  the Node standard library).
- An LLM you can paste a prompt into (this project doesn't call one for you
  — see "Where the LLM fits in" below).

## Quick start

```bash
# 1. Describe your project's data model
open _data/README.md

# 2. Add at least one vertical, one pain point, one feature, one source, one
#    mapping row, and one PM owner — see _data/README.md for the exact
#    schema of each table. (Or run the bootstrap prompt in an LLM: see
#    _prompts/bootstrap_structure.md.)

# 3. Point the config at your vertical
open vertical_offering.config.md

# 4. Check the data is internally consistent
node _flows/_lib/tools/check_integrity.js

# 5. Build a deck
cd _flows/report-generation
node run_flow.js --stage 03 --mode internal
cat stages/03_render_slidedeck/output/draft_deck.md

# 6. Optional: render an HTML report
node run_flow.js --stage 03.5
open stages/03.5_generate_html/output/report.html
```

## Where the LLM fits in

One stage in the whole pipeline is not fully mechanical: Stage 02 (Knowledge
AI Mining), in the data-ingestion flow. It has two passes:

1. `node run_flow.js --stage 02 --file <doc> --product <name>` composes a
   prompt (from `_prompts/analyze_source.md`) and writes it to
   `output/mining_prompt.md`.
2. **You** paste that file into an LLM and save the reply to
   `output/mining_response.md`.
3. `node run_flow.js --stage 02 --ingest` reads that reply, discards every ID
   the model wrote, reassigns real ones, and writes the result to `_data/*.md`
   at `Status = PROPOSED` — never `VERIFIED`.

Every other stage is a plain script with no LLM call.

## The two flows

| Flow | Folder | Purpose |
|---|---|---|
| **Data Ingestion** | `_flows/data-ingestion/` | Build and verify the reference tables |
| **Report Generation** | `_flows/report-generation/` | Turn verified (or all) data into a deck, route it for review, publish it |

Full stage-by-stage detail: `_flows/data-ingestion/CLAUDE.md` and
`_flows/report-generation/CLAUDE.md`.

## Guides

| Guide | For |
|---|---|
| `_pm-guides/PM_Guide_Integrated_Process.md` | The end-to-end picture: both flows, timelines, RACI, governance |
| `_pm-guides/PM_Guide_Managing_Features_and_Pains.md` | Adding features, verifying AI proposals |
| `_pm-guides/PM_Guide_Creating_Vertical_Offering.md` | Building, reviewing and publishing a deck |
| `_data/README.md` | The full data model — every table's schema |

## Extending this reference

Things a real deployment of this method often adds, which this reference
implementation deliberately keeps out of scope (see the relevant stage's
`CONTEXT.md` for exactly where):

- **A richer, quote-verified description registry** per feature, built from
  literal source-document quotes (`_prompts/enrich_features.md` documents
  the prompt for this; there is no supporting code here).
- **Multiple rendered output profiles** from one resolved scope — for
  example a full internal review copy alongside a shorter, customer-facing
  one with different structure, not just a different status filter
  (`_flows/report-generation/stages/03.5_generate_html/CONTEXT.md`).
- **A slash-command or chat interface** in front of the CLI. Every command in
  this project is a real `node run_flow.js ...` invocation; there is no other
  interface layer.

None of these change the core method (the mapping structure, the two-pass
LLM stage, the review/feedback loop, filesystem-as-orchestration) — they are
depth you can add on top of it.
