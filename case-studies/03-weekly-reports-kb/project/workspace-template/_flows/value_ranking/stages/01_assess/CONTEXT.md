# Stage 01 — Assess

**Layer 2 — stage contract.**

## Does

Reads the flagged candidates and decides, per engagement (not per row — several
rows across periods often describe one engagement progressing): whether the
number is a closed win, a potential/pipeline figure, a programme-level aggregate,
or unclear; what your team's actual role was; and which client it resolves to.
This stage has no script — it is entirely the model step, governed by
`_prompts/G_value.md`.

## Reads

- `00_collect`'s `output/candidates.json` and `output/coverage.json`
- `_kb/_registry/clients.md`
- `_context/10_row_schema.md`
- `_context/20_taxonomy.md`

## Writes

`output/valued.json`:

```json
{
  "meta": {"candidates": 0, "rejected_aggregates": {...}, "rejected_false_positives": {...},
           "note_on_totals": "..."},
  "deals": [
    {"client": "...", "category": "...", "status": "won", "amount": "...",
     "role": "led", "entry_ids": ["..."]}
  ]
}
```

## Hard rule

Never sum amounts across engagements. The base only covers the periods in
`coverage.json` — a computed total would read as complete and would be worse than
no total.
