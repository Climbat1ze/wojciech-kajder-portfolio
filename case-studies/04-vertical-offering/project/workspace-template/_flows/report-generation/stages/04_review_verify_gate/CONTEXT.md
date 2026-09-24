# Stage 04 — Review & Verify Gate

**Layer 2 — Stage contract.**

---

## What this stage is

Routes the build's content to the reviewers who actually own it — not a
fixed roster, only reviewers whose features made it into this specific
build's scope — and creates the human-edited file Stage 05 gates on.

```bash
node run.js --build-id 2026-01-15_Healthcare --deadline 2026-01-18
```

## Inputs

| Input | Purpose |
|---|---|
| `../03_render_slidedeck/output/filtered_data.json` | resolved scope |
| `../03_render_slidedeck/output/render_report.json` | must be status `ok` |
| `../03.5_generate_html/output/report.html` | optional, linked from the feedback file if present |
| `../../../_data/pm_owners.md` | product -> reviewer routing |
| `--build-id` (default: derived from vertical + date), `--deadline` |

## Outputs

| Output | Path |
|---|---|
| One review email per reviewer with content in scope | `output/emails/<PM_ID>.html` |
| Stage envelope | `output/review_report.json` |
| The gate Stage 05 reads | `../../../_state/[Build_ID]_build_feedback.md` — **outside this stage's own `output/`**, because it is human-edited and read by another stage |

## Rule

**This stage never sends anything.** Generating the emails is mechanical;
sending them, and later updating each reviewer's `Status`/`Comment` cell in
the feedback file as replies come in, are human actions.

Re-running this stage for the same build adds any newly-relevant reviewer
rows to the feedback file but never touches a `Status` a human already set —
see `_lib/feedback.js`.
