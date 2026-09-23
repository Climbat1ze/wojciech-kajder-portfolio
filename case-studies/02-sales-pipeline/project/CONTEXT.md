# Sales Pipeline Reference — Routing

**Layer 1 — answers: where do I go?**

---

## Reading order

| # | Document | Why |
|---|---|---|
| 1 | `CLAUDE.md` | what this workspace is |
| 2 | `README.md` | plain-language walkthrough of the method |
| 3 | `_demo/README.md` (if present) or `_demo/workspace-template equivalent` | see it working before reading the engine itself |
| 4 | `workspace-template/CLAUDE.md` | identity of the engine you would actually deploy |

## Task routing

| Task | Go to |
|---|---|
| Understand the method before doing anything | `README.md` |
| See a worked, end-to-end example | `_demo/` |
| Start a new real deployment | copy `workspace-template/` to a new folder, then follow its `CONTEXT.md` |
| Change how a spreadsheet column is normalized (owner name, industry, business unit, product) | `workspace-template/_config/*.md` — edit the table, do not touch the scripts |
| Change what a stage does | `workspace-template/stages/<NN>_<name>/CONTEXT.md` first (the contract), then the matching script in `_scripts/` |
| Change the report's look | `workspace-template/_prompts/` (if generating with an LLM) or the HTML section of `stage_03_report.js` (if generating with code) |
| Run the full pipeline | `node _scripts/run_pipeline.js` from inside the deployment copy |

## Stage map

| Stage | Script | Reads | Writes |
|---|---|---|---|
| 0 — Input intake | `_scripts/manage_pipeline_input.js` | latest spreadsheet dropped in a watched folder | dated copy in `_input/` |
| 1 — Convert | `_scripts/stage_01_convert.js` | `_input/*.xlsx` | `stages/01_convert/output/*.json`, `*.md` |
| 2 — Process | `_scripts/stage_02_process.js` | Stage 1 output + `_config/*.md` | `stages/02_process/output/processed_data.json`, `validation_report.md` |
| 3 — Report | `_scripts/stage_03_report.js` | Stage 2 output | `_output/_drafts/` and `_output/_final/*.html` |

---

**Last updated:** 2026-09-23
