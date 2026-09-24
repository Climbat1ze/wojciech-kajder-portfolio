# Stage 02 — Rank

**Layer 2 — stage contract.**

## Does

Adds no content. Arranges what stage 01 decided into tables: engagements with a
stated amount, clients by sustained engagement, the intersection of both (scale
**and** longevity), and — importantly — what was rejected and why, plus how
complete the underlying corpus actually is. An amount shown in a table is always
in its original, source form; a parsed number exists only to sort by and is never
displayed.

## Reads

- `01_assess`'s `output/valued.json`
- `00_collect`'s `output/engagement.json` and `output/coverage.json`

## Writes

`output/ranking.md`

## Run

```
python _scripts/rank.py
```
