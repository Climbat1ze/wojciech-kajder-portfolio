# Flow: query_kb — question → answer with citations

**Layer 2 — flow contract.**

Retrieval here is **structural, not semantic**: a script narrows the index by
field, and only the model reads the result — never the whole index. This is what
makes the method work without a vector database.

## Stages

| # | Stage | Who | Reads | Writes |
|---|---|---|---|---|
| 00 | `00_filter` | script | `_kb/activities.jsonl` + your filter arguments | `output/hits.json` |
| 01 | `01_answer` | model | `00_filter`'s hits + `_prompts/F_query.md` | an answer, not a file the pipeline consumes further |

## Run

```
python _flows/query_kb/stages/00_filter/_scripts/filter.py --category "Manufacturing" --since 2025-01-01
#   → hand output/hits.json, the question, _context/10_row_schema.md and
#     _context/20_taxonomy.md to the model, together with _prompts/F_query.md
```

## Gate

If the filter returns zero hits, the model must say so plainly and suggest which
condition to loosen (usually the date range or subcategory) — never answer from
outside the hits.
