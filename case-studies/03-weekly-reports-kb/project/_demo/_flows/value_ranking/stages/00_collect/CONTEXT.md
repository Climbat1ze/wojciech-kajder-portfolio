# Stage 00 — Collect

**Layer 2 — stage contract.**

## Does

Scans the index for rows that contain something that looks like a value signal
(an amount, a volume, an opportunity id), and separately computes an engagement
proxy per client across the whole filtered range. Decides nothing about what any
number *means* — that is stage 01's job.

## Reads

`_kb/activities.jsonl` (via the same filter logic as `query_kb`)

## Writes

- `output/candidates.json` — flagged rows, `activity` reproduced verbatim, an
  `aggregate: true` flag on rows from a section that is usually a
  programme-level indicator rather than one deal
- `output/engagement.json` — per client: entries, distinct periods, distinct
  business units, distinct sections, every backing `entry_id`
- `output/coverage.json` — expected periods in range vs. periods actually present

## Run

```
python _scripts/collect.py --since 2025-01-01
```

Default range start, if `--since` is omitted, and default range end (the last
*closed* period, never a period still in progress) are set in the script —
adjust them to your own reporting cadence.
