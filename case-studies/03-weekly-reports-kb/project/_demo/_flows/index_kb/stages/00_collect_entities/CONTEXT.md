# Stage 00 — Collect entities

**Layer 2 — stage contract.**

## Does

Scans every archived `build_kb` run and every current, not-yet-archived one, and
lists the unique client entities across all of them, flagging which ones are
already in the entity registry (and can therefore be skipped) versus which ones
need a fresh decision.

## Reads

`_kb/_runs/*/validated.json`, `_flows/build_kb/stages/03_validate/output/validated.json`
(the current run, if not yet archived), `_kb/_registry/clients.md`

## Writes

`output/entities.json`:

```json
{
  "entities": [
    {"entity": "Trailhead Logistics", "occurrences": 4, "in_registry": false,
     "sample": "...", "first_entry_id": "2025-W05-BU-02"}
  ]
}
```

## Run

```
python _scripts/collect.py
```

Next: hand `output/entities.json` to the model along with `_prompts/D_enrichment.md`
and `_context/20_taxonomy.md`. It writes its decisions to
`_flows/index_kb/stages/01_enrich/_scripts/decisions.json`.
