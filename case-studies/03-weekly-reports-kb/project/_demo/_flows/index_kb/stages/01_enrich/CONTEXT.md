# Stage 01 — Enrich

**Layer 2 — stage contract.**

## Does

Assembles `output/metadata.json` from the model's decisions plus the registry's
memory. An entity already in `_kb/_registry/clients.md` gets its category copied
across without being re-decided — that is what keeps classification stable
between runs instead of re-rolled every time.

## Reads

- `00_collect_entities`'s `output/entities.json`
- `_kb/_registry/clients.md`
- `_flows/index_kb/stages/01_enrich/_scripts/decisions.json` — written by the model,
  one object per entity **not already in the registry**, following
  `_prompts/D_enrichment.md`:

```json
[
  {"entity": "Trailhead Logistics", "canonical_name": "Trailhead Logistics Inc.",
   "aliases": ["Trailhead Logistics"], "category": "Logistics & Transportation",
   "subcategory": "Freight & Trucking", "category_conf": "stated/high"}
]
```

## Writes

`output/metadata.json`: one record per entity (from the registry or from
`decisions.json`).

## Gate

- Any entity with neither a registry hit nor a `decisions.json` entry stops the
  run — nothing is indexed unclassified by omission.
- A `category`/`subcategory` pair not found in `_context/20_taxonomy.md` stops the
  run here, before it reaches the index.

## Run

```
python _scripts/apply_decisions.py
```
