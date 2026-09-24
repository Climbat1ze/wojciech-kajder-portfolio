# Flow: index_kb — entities → category → index upsert

**Layer 2 — flow contract.**

Assigns a category to every unique client entity across the **whole corpus**, then
upserts all entries into `_kb/activities.jsonl`. Runs after one or more `build_kb`
runs have archived their `validated.json` into `_kb/_runs/`.

Category is decided once per entity, not once per document — that is the whole
reason this is a separate flow from `build_kb` rather than a sixth stage on it. If
every document decided the category for its own clients, the same client would be
reclassified every period and the two decisions would eventually disagree.

## Stages

| # | Stage | Who | Reads | Writes |
|---|---|---|---|---|
| 00 | `00_collect_entities` | script | all archived `validated.json` runs | `output/entities.json` — unique clients, deduplicated against the registry |
| 01 | `01_enrich` | model decides, script applies | `00_collect_entities`'s output + the model's `decisions.json` | `output/metadata.json` — one record per entity |
| 02 | `02_index` | script | `01_enrich`'s metadata + all archived runs | `_kb/activities.jsonl` (upsert), `_kb/_registry/clients.md`, `_kb/_registry/pending_review.md` |

## Run

```
python _flows/index_kb/stages/00_collect_entities/_scripts/collect.py
#   → the model reads output/entities.json against _context/20_taxonomy.md and
#     _kb/_registry/clients.md, and writes
#     _flows/index_kb/stages/01_enrich/_scripts/decisions.json
#     — one object per entity NOT already in the registry, following
#       _prompts/D_enrichment.md
python _flows/index_kb/stages/01_enrich/_scripts/apply_decisions.py
python _flows/index_kb/stages/02_index/_scripts/index_kb.py
```

## Gates

- A value outside `_context/20_taxonomy.md` stops indexing before it reaches the
  base — never silently coerced to the nearest known value.
- An entity with no decision (not in the registry, not in the model's
  `decisions.json`) stops `01_enrich` — nothing enters the index unclassified by
  omission; it either has a category or it has `TBD`.
- The upsert in `02_index` never touches `activity` or `activity_sha256` — it adds
  exactly three fields (`category`, `subcategory`, `category_conf`) to each row.

## Known quirk: `02_index` also requires a *current* `validated.json`

`02_index` reads every archived run under `_kb/_runs/*/validated.json` **plus**
`_flows/build_kb/stages/03_validate/output/validated.json` — and it requires that
second, unarchived file to exist even if every document is already archived. In
normal use this is never a problem: `_scripts/kb_run.py --finish` always leaves it
there for whichever document was processed most recently, before archiving a copy.
It only bites if you've cleared that file by hand (or built `_kb/_runs/` some other
way, as this package's `_demo/` did). If you hit
`ERROR: validated.json not found - run build_kb/03_validate first.` with nothing
left to process, copy any one archived run's `validated.json` back to
`_flows/build_kb/stages/03_validate/output/validated.json` — the stage's own
deduplication (by `doc_key`) makes this safe to do more than once.
