# Sales Pipeline Reference — Demo Routing

**Layer 1 — answers: where do I go?**

---

## Reading order

| # | Document | Why |
|---|---|---|
| 1 | `CLAUDE.md` | what's fictional here, and what actually ran |
| 2 | `stages/01_convert/output/pipeline_data.md` | see the converted fictional data |
| 3 | `stages/02_process/output/validation_report.md` | see normalization + validation catch two deliberately awkward entries |
| 4 | `_output/_final/pipeline_report_20260923.html` | open in a browser — the finished report |

## If you want to re-run it

```bash
cd _demo
npm install
node _scripts/stage_01_convert.js
node _scripts/stage_02_process.js
node _scripts/stage_03_report.js
```

Re-running will overwrite today's date-stamped output with identical content (the fictional input
doesn't change), and will still pick up `pipeline_report_20260916.html` for the week-over-week
delta — see `CLAUDE.md` for why that one file is hand-built rather than a real second run.

## If you want to try your own tweak

Edit `_demo/_config/industryMap.md` (or any other config table) and re-run Stage 2 and Stage 3
only — you don't need to redo Stage 1, since the underlying spreadsheet didn't change:

```bash
node _scripts/stage_02_process.js
node _scripts/stage_03_report.js
```

## Once you're done exploring

Go build your own deployment from `../workspace-template/`, not from a copy of this folder — this
folder's config tables are filled in with fictional data that isn't meant to be edited into a real
deployment.

---

**Last updated:** 2026-09-23
