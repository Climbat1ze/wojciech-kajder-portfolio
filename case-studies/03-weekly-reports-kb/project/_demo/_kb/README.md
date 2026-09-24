# `_kb/` — the knowledge base (demo instance)

Same product as `workspace-template/_kb/README.md` describes — read that for the
full explanation of the two representations, the registries, and the rules that
hold the base together. This note only adds what's specific to the demo.

## What's here and how it got here

- `md/*.md` and `_runs/*/validated.json` were **hand-built** to the exact shape
  `build_kb` would have produced (see `../_input/README.md` for why: the demo's
  source documents are plain text, not real `.msg`/`.docx`).
- `activities.jsonl` and both files in `_registry/` were produced by **actually
  running** `index_kb`'s three stages against those hand-built `validated.json`
  files — see `../_flows/index_kb/stages/01_enrich/_scripts/decisions.json` for
  the model-authored category decisions that run consumed.

## Quick facts about this corpus

- 4 documents, 18 entries, 5 client entities, 4 categories used, 1 entity `TBD`.
- One opportunity (`OP2025010042`, Trailhead Logistics Inc.) recurs across three
  weeks and resolves to a signed deal — see
  `_flows/value_ranking/stages/02_rank/output/ranking.md` §A.
