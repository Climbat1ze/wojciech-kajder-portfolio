# Stage 02 — Index

**Layer 2 — stage contract.**

## Does

Merges every archived run's entries with the enrichment metadata and writes
`_kb/activities.jsonl`. Three rules this stage enforces:

1. A value outside the controlled list is an **error**, not a variant.
2. `activity` and `activity_sha256` are **never touched** — only `category` /
   `subcategory` / `category_conf` are added.
3. Writing is an **upsert by `entry_id`**, not an append — reprocessing a document
   overwrites its own rows instead of duplicating them.

## Reads

- all `_kb/_runs/*/validated.json` (plus the current run, if not yet archived)
- `01_enrich`'s `output/metadata.json`
- `_context/20_taxonomy.md`

## Writes

- `_kb/activities.jsonl` (upserted, sorted by `entry_id`)
- `_kb/_registry/clients.md` (rewritten from the enrichment metadata — this is the
  base's memory of past category decisions)
- `_kb/_registry/pending_review.md` (queue, not a gate — entities that indexed with
  `category: TBD`, or that were entirely new this run)

## Run

```
python _scripts/index_kb.py
```
