# Stage 00 — Filter

**Layer 2 — stage contract.**

## Does

Turns filter arguments into narrowed rows from the index. Uses the shared
narrowing logic in `_scripts/kb_query.py` — the same logic `kb_stats.py` uses —
so the two tools can never answer the same question differently.

## Reads

`_kb/activities.jsonl`

## Writes

`output/hits.json`: the question (if given), the active conditions, the total
row count, the hit count, how many rows in the *whole* index carry
`category: TBD` (a completeness signal), and the hits themselves.

## Run

```
python _scripts/filter.py --category "Manufacturing" --pic "Elena Rossi" --since 2025-01-01
```

All available filters: `--category`, `--subcategory`, `--client`, `--pic`,
`--section`, `--since`, `--until`.
