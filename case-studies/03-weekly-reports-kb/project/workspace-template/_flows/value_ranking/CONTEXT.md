# Flow: value_ranking — whole base → which engagements were biggest

**Layer 2 — flow contract.**

An extension of `query_kb`'s discipline to a harder question. `query_kb` asks "what
happened with X" and the rows answer directly; this flow asks "how big was X", and
the rows only answer indirectly — through a figure whose meaning lives in the
sentence around it. That gap is why a model still sits in the middle here, after a
script has done everything mechanical.

## Stages

| # | Stage | Who | Reads | Writes |
|---|---|---|---|---|
| 00 | `00_collect` | script | `_kb/activities.jsonl` | `output/candidates.json`, `output/engagement.json`, `output/coverage.json` |
| 01 | `01_assess` | model | `00_collect`'s output + `_prompts/G_value.md` | `output/valued.json` |
| 02 | `02_rank` | script | `01_assess`'s output + `00_collect`'s engagement/coverage | `output/ranking.md` |

## What each collected file is for

- `candidates.json` — every row containing something that *looks* like an amount,
  a volume, or an opportunity id. The script only points at these; it decides
  nothing about what a number means.
- `engagement.json` — a client-by-client proxy for how consistently your team was
  involved, independent of whether any row ever carried a figure.
- `coverage.json` — which periods in the requested range actually have data, so a
  ranking never silently reads as complete when the underlying corpus has gaps.

## Run

```
python _flows/value_ranking/stages/00_collect/_scripts/collect.py --since 2025-01-01
#   → hand output/candidates.json, output/coverage.json, the client registry,
#     the row schema and the taxonomy to the model with _prompts/G_value.md;
#     it writes _flows/value_ranking/stages/01_assess/output/valued.json
python _flows/value_ranking/stages/02_rank/_scripts/rank.py
```

## Two rules this flow exists to enforce

1. **Never sum amounts into one grand total.** The base only covers the periods in
   `coverage.json`; a total from a partial corpus reads as complete and is
   therefore worse than no total.
2. **A rejected candidate is reported, not silently dropped.** Programme-level
   indicators (usually anything from a `finance`-style section) get excluded from
   the ranking, but the exclusion is counted and shown — see `ranking.md` §D.
