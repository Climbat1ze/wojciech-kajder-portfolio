# Vertical Offering — Project State

**Layer 4 — working artifact.** This file is the single authoritative copy of
the Active Blocks table (`_flows/_lib/state.js` reads it) and the running
change log. Nothing else in this project should keep a second copy of
either.

## Active Blocks

Each `ACTIVE` row compiles into a filter applied by Stage 03, before the
`mode` filter. `Scope` is `<entity>.<column>` (`*` for any column) where
`<entity>` is one of `features`, `pain_points`, `map_feature_pain`,
`hardware_attributes`. `Match` is one of `contains`, `equals`, `id`, `regex`,
`all`. `Action` is `exclude`, `badge:<label>`, or `none`.

| Block_ID | Status | Scope | Match | Pattern | Action | Reason |
|----------|--------|-------|-------|---------|--------|--------|

Example (commented out — delete the `<!--`/`-->` and fill in your own values
to use it):

<!--
| BLOCK-001 | ACTIVE | features.Product | equals | Example Product | exclude | Not yet confirmed for this hardware line |
-->

## Log zmian (change log)

Every change to `_data/*.md` or `vertical_offering.config.md` gets a line
here — stage scripts append automatically where noted in their own
`CONTEXT.md`; manual edits (Stage 01) are logged by hand.

| Date | Action | Description | Path |
|------|--------|-------------|------|

## Decisions

Non-mechanical decisions worth a durable record (a scope call, a policy on
what to include) — free-form, not read by any script.

| Date | Decision | Rationale | Owner |
|------|----------|-----------|-------|

## Open questions

| Date | Question | Context | Priority | Owner |
|------|----------|---------|----------|-------|
