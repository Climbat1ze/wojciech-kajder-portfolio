# Stage 05 — Publish & Share

**Layer 2 — Stage contract.**

---

## What this stage is

The mechanical gate at the end of Flow B. It reads
`_state/[Build_ID]_build_feedback.md` and refuses to publish — printing
exactly who is still missing — unless every reviewer row shows `Approved`.
There is no override flag.

```bash
node run.js --build-id 2026-01-15_Healthcare
```

## Inputs

| Input | Purpose |
|---|---|
| `--build-id` (required) | which build to publish |
| `../../../_state/[Build_ID]_build_feedback.md` | **the gate** |
| `../03_render_slidedeck/output/draft_deck.md` | the deck to publish |
| `../03.5_generate_html/output/report.html`, if present | published alongside the deck |

## Outputs

| Output | Path |
|---|---|
| Published deck | `../../../_outputs/_final/YYYY-MM-DD_Vertical_Offering_{Vertical}_FINAL_v{N}.{md,html}` |
| For a human to send onward | `output/stakeholder_notice.md` |
| Stage envelope | `output/publication_report.json` |
| A line in the project change log | `../../../_state/vertical_offering_state.md` |

## Rule

Publishing again for the same vertical never overwrites a previous
publication — the version number increments, and older files stay in
`_outputs/_final/` under their own name.
