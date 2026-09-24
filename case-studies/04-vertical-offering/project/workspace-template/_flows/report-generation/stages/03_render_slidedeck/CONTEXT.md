# Stage 03 — Render Slide Deck

**Layer 2 — Stage contract.**

---

## What this stage is

The entry point of the Report Generation Flow: deterministic, no LLM
involved. It resolves one vertical's scope from the reference tables,
applies Active Blocks, applies the `mode` filter, and renders a slide-MD
deck.

```bash
node run.js --vertical Healthcare --mode internal
node run.js -v V01 --mode client --threshold H
```

## Inputs

| Input | Purpose |
|---|---|
| `../../../vertical_offering.config.md` | vertical, threshold, mode, hardware toggle, language (CLI flags override) |
| `../../../_data/*.md` | every reference table |
| `../../../_state/vertical_offering_state.md` | the Active Blocks table |

## Process

1. Resolve the vertical's pain points from `map_pain_vertical.md`, filtered
   by `relevance_threshold`.
2. For each in-scope pain, collect features (`map_feature_pain.md`) and, if
   `include_hardware`, hardware attributes (`map_hw_pain.md`).
3. Apply Active Blocks (`_lib/state.js`): a block can `exclude` a row or add
   a `badge` to it.
4. Apply the `mode` filter:
   - `internal` — render everything, with status badges.
   - `client` — render only rows where the pain-to-vertical mapping AND the
     feature/hardware row AND its own mapping are all `Status = VERIFIED`.
     Everything else moves to the Verification Annex, not into the slides.
5. Render slide-Markdown (`---`-separated, Marp/reveal.js convention).

## Outputs

| Output | Path |
|---|---|
| Resolved scope — **the audit point**; open this first if a build looks thinner than expected | `output/filtered_data.json` |
| The deck | `output/draft_deck.md` |
| Stage envelope | `output/render_report.json` |

## Rule

`mode: client` with **zero** `VERIFIED` rows in scope is treated as an error,
not an empty-but-valid deck. An empty deck that looks like a thin real
offering is worse than a build that refuses to run and says why.
