# Vertical Offering — Run Configuration

**Layer 4 — working artifact.** This file changes between runs; it is the
single control surface for a build. There is exactly one config file in this
project.

```yaml
# Target vertical. Accepts a V_ID (V01) or the vertical name as written in
# _data/verticals.md. Resolved against that table.
# This template ships with an empty verticals table — add at least one row
# there before a build will resolve.
vertical: CHANGE_ME

# Pain relevance floor, read from map_pain_vertical.Relevance.
# H = high only, M = high + medium, L = everything.
relevance_threshold: M

# internal — renders all rows with status badges (VERIFIED / PROPOSED / TBC).
# client   — renders VERIFIED rows only; everything else moves to the annex.
mode: internal

# Include the hardware_attributes.md / map_hw_pain.md content.
include_hardware: true

# Output language for the deck. Reference tables are always EN.
language: EN

# Feature catalogues to load from _data/features/.
#   all          — every file that declares a canonical feature table (default)
#   [a.md, b.md] — an explicit list
# "all" is the recommended value: an explicit list silently drops features
# when a new catalogue is added.
feature_files: all
```

---

## Parameters

| Key | Values | Default | Notes |
|-----|--------|---------|-------|
| `vertical` | `V_ID` or vertical name | — | Required. Must exist in `_data/verticals.md` |
| `relevance_threshold` | `H` \| `M` \| `L` | `M` | Filters `map_pain_vertical.Relevance` |
| `mode` | `client` \| `internal` | `internal` | See warning below |
| `include_hardware` | `true` \| `false` | `true` | Include hardware-attribute content |
| `language` | `EN` \| ... | `EN` | Deck language |
| `feature_files` | `all` or list | `all` | Catalogues under `_data/features/` |

Any key may be overridden per run from the command line, for example
`node run_flow.js --stage 03 --vertical Healthcare --mode internal`. A
command-line value takes precedence and is recorded in the stage artifact, so
a build always shows which parameters actually applied.

## Warning about `mode: client`

`client` renders only rows whose `Status` is `VERIFIED`. A freshly-seeded
project has few or none. A client build with zero `VERIFIED` rows in scope is
treated as an error, not an empty deck — see
`_flows/report-generation/stages/03_render_slidedeck/CONTEXT.md`.

## Related

| What | Where |
|------|-------|
| Active Blocks (build filters) | `_state/vertical_offering_state.md` — the only authoritative copy |
| Reference tables | `_data/` |
| Change log | `_state/vertical_offering_state.md` |
