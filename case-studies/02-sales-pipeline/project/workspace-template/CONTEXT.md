# Sales Pipeline Tracker — Routing

**Layer 1 — answers: where do I go?**

---

## Reading order

| # | Document | Why |
|---|---|---|
| 1 | `CLAUDE.md` | identity of this workspace |
| 2 | `_config/stageDefinitions.md` | what each pipeline stage means |
| 3 | `stages/01_convert/CONTEXT.md` → `02_process/CONTEXT.md` → `03_report/CONTEXT.md` | the three stage contracts, in run order |

## Task routing

| Situation | Do this |
|---|---|
| First time running this copy | fill in `_config/*.md`, then `node _scripts/run_pipeline.js` |
| New spreadsheet export arrived | drop it where `manage_pipeline_input.js` expects it, then `node _scripts/run_pipeline.js` |
| A name/industry/business unit/product isn't normalizing correctly | edit the matching table in `_config/*.md` — never edit the scripts for this |
| Validation report shows unmatched owner names | either add them to `ownerNameMap.md` and your team roster in `teamDefinitions.md`, or confirm they're external and leave as-is |
| Want to change what the HTML report shows | edit `stages/03_report/CONTEXT.md` first (the contract), then `_scripts/stage_03_report.js` |
| Want a written narrative summary, not just numbers | see `_prompts/pipeline_report_prompt.md` — feed it the Stage 2 output and have an LLM draft the narrative sections |
| Re-running only one stage | each stage script only needs its own declared input file — see that stage's contract for the exact path |

## Stage outputs at a glance

| Output | Location |
|---|---|
| Converted JSON + Markdown | `stages/01_convert/output/` |
| Normalized data + validation report | `stages/02_process/output/` |
| Draft report | `_output/_drafts/` |
| Approved report | `_output/_final/` |

## Sections specific to this deployment copy

<!-- INSTANCE:BEGIN — add deployment-specific routing here (e.g. where your spreadsheet actually lives, who reviews the validation report). Left blank in the template. -->
<!-- INSTANCE:END -->

---

**Last updated:** 2026-09-23
