# Report Generation Flow — Vertical Offering Generator

**Workspace Identity (Layer 0).**

---

## Where am I?

This is the **Report Generation Flow**. Its job is to turn the curated
reference tables into a shareable vertical-offering deck, route it through
reviewer approval, and publish the approved version.

**Location:** `{PROJECT_ROOT}/_flows/report-generation/`

## What this flow does

### Input
- **Config:** `../../vertical_offering.config.md` (vertical, mode, threshold,
  hardware toggle, language)
- **Reference tables:** `../../_data/*.md`
- **State:** `../../_state/vertical_offering_state.md` (Active Blocks, change log)

### Process (5 stages)
1. **Stage 03: Render Slide Deck** — resolve scope, apply Active Blocks and
   the mode filter, render slide-Markdown
2. **Stage 03.2: Curate Scope** *(optional)* — propose a ranked shortlist; a
   human marks which pain points to include
3. **Stage 03.5: Generate HTML** *(optional)* — render a self-contained HTML
   report from the same resolved scope
4. **Stage 04: Review & Verify Gate** — route the build to the reviewers who
   own its content, generate review emails, create the feedback file
5. **Stage 05: Publish & Share** — gate on full reviewer approval, then
   publish to `_outputs/_final/`

### Output
- **Slide deck (MD):** `stages/03_render_slidedeck/output/draft_deck.md`
- **HTML report:** `stages/03.5_generate_html/output/report.html`
- **Published deck:** `../../_outputs/_final/YYYY-MM-DD_Vertical_Offering_{Vertical}_FINAL_v{N}.{md,html}`

## Structure

```
report-generation/
├── CLAUDE.md                        <- L0: this file
├── CONTEXT.md                       <- L1: routing
├── run_flow.js                      <- orchestrator
└── stages/
    ├── 03_render_slidedeck/
    ├── 03.2_curate_scope/
    ├── 03.5_generate_html/
    ├── 04_review_verify_gate/
    └── 05_publish_share/
```

## Quick start

```bash
cd "{PROJECT_ROOT}/_flows/report-generation"
node run_flow.js --vertical "Field Services" --mode internal --build-id 2026-01-15_FieldServices
```

Running the full flow with no `--build-id` still runs stages 03 through
03.5, but stage 05 refuses without one — publishing must never happen
unattended before a human has reviewed the build. Stage 05 also refuses
unless every reviewer listed in the feedback file has approved, regardless of
what `--build-id` you supply.

```bash
node run_flow.js --stage 03 --vertical Healthcare
node run_flow.js --stage 03.2 --target 8          # optional — curate before rendering HTML
node run_flow.js --stage 03.5
node run_flow.js --stage 04 --build-id 2026-01-15_Healthcare --deadline 2026-01-18
node run_flow.js --stage 05 --build-id 2026-01-15_Healthcare
node run_flow.js --skip-html
node run_flow.js --help
```

## Key concepts

**Build modes vs. render profile.** `mode: client` / `mode: internal` is a
Stage 03 config value that decides which rows are even in scope for
rendering (client keeps `VERIFIED`-only). This reference implementation
renders one HTML profile from that already-filtered scope — see
`stages/03.5_generate_html/CONTEXT.md` for the fuller multi-profile pattern
this could be extended toward.

**Active Blocks live in exactly one place** —
`../../_state/vertical_offering_state.md`. No other file in this project
should keep a second copy of that table.

**Error handling is fail-loud.** A stage refuses (non-zero exit) rather than
silently producing something wrong — an unknown vertical, `mode: client`
with no `VERIFIED` rows, an incomplete set of reviewer approvals.

**Each stage is independent and replayable** — it reads only from its
upstream stage's `output/` (or `_state/`), never from in-memory state.

---

**Method:** filesystem-as-orchestration — plain files and folders as the
coordination layer between mechanical stages and human decisions.
