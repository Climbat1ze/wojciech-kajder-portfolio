# Report Generation Flow — CONTEXT.md

**Layer 1 — Routing.**

---

## Routing table

| Stage | Name | When to use | Contract |
|---|---|---|---|
| **03** | Render Slide Deck | Build a deck for one vertical from the reference tables | `stages/03_render_slidedeck/CONTEXT.md` |
| **03.2** | Curate Scope | Trim to a chosen pain-point shortlist (optional) | `stages/03.2_curate_scope/CONTEXT.md` |
| **03.5** | Generate HTML | Produce a shareable HTML report (optional) | `stages/03.5_generate_html/CONTEXT.md` |
| **04** | Review & Verify Gate | Route the deck to the reviewers who own its content | `stages/04_review_verify_gate/CONTEXT.md` |
| **05** | Publish & Share | Publish once every reviewer has approved | `stages/05_publish_share/CONTEXT.md` |

## Quick navigation

```bash
node run_flow.js --vertical <name> --mode internal --build-id <id>
node run_flow.js --stage 03
node run_flow.js --stage 03.2 --target 8
node run_flow.js --stage 03.5
node run_flow.js --stage 04 --build-id <id> --deadline <date>
node run_flow.js --stage 05 --build-id <id>
node run_flow.js --stage 03-04
```

## Stage dependencies

```
Stage 03 (Render Slide Deck)
    depends on: vertical_offering.config.md, _data/*.md, Active Blocks
    -> filtered_data.json, draft_deck.md, render_report.json
Stage 03.2 (Curate Scope)                                     [optional]
    depends on: render_report.json (status ok), filtered_data.json
    -> curation.md, curation_report.json
Stage 03.5 (Generate HTML)                                    [optional]
    depends on: render_report.json (status ok), filtered_data.json
    curation.md is read if present, optional
    -> report.html, html_report.json
Stage 04 (Review & Verify Gate)
    depends on: render_report.json (status ok), filtered_data.json
    report.html is read if present, but not required
    -> emails/<PM_ID>.html, _state/[Build_ID]_build_feedback.md
Stage 05 (Publish & Share)
    depends on: _state/[Build_ID]_build_feedback.md — every reviewer row
    must read "Approved", or the stage refuses and publishes nothing
    -> _outputs/_final/*.{md,html}, a line in _state/vertical_offering_state.md
```

A stage that reads a failed or missing upstream artifact refuses rather than
proceeding on stale or partial data — see each stage's own `CONTEXT.md`.

**The rule tying it together:** apart from
`_state/[Build_ID]_build_feedback.md` and the `_outputs/_final/`
publication, every stage writes only to its own `output/`. Stop after any
stage, hand-edit its artifact, resume from the next one.

## Related files

- **Flow identity:** `CLAUDE.md` (L0)
- **Shared library:** `../_lib/`
- **Parent project:** `../../CLAUDE.md`
- **Config file:** `../../vertical_offering.config.md`
- **Reference tables:** `../../_data/`
- **State:** `../../_state/vertical_offering_state.md`
- **Data Ingestion Flow:** `../data-ingestion/CONTEXT.md` — produces and verifies the tables this flow reads
