# Stage 03 — Validate

**Layer 2 — stage contract.**

## Does

Never changes content. Adds the fields the model doesn't produce (`entry_id`,
`activity_sha256`, `raw_ref`) and checks entries against your controlled lists
(the team roster, business-unit codes if you use them). Violations go into
`issues[]` — they are reported, never silently fixed.

## Reads

- `02_read`'s `output/entries.json`
- `00_prepare`'s `output/metadata.json`
- your team roster (the controlling file — see `_prompts/C_extraction.md` for why
  this must never be a copy)
- `_config/teamMembers.md` (distorted-spelling registry)
- `_config/businessUnitCodes.md`, if your reports use unit codes

## Writes

`output/validated.json`: entries plus `entry_id`, `activity_sha256`, `raw_ref`,
and an `issues` list. `category`/`subcategory`/`category_conf` are **not** added
here — that is `index_kb`'s job.

## Gates

- An entry with no `activity` content → stop.
- `entry_id` values not unique within the document → stop.

## Run

```
python _scripts/validate.py
```
