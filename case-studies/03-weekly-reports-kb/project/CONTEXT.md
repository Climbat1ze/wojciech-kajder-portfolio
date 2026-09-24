# Routing

**Layer 1 — where do I go?**

---

## Reading order for a newcomer

| # | Document | Why |
|---|---|---|
| 1 | `CLAUDE.md` | what this package is, and what it deliberately is not |
| 2 | `README.md` | quickstart: adopt the template, or explore the demo first |
| 3 | `workspace-template/CLAUDE.md` | identity of the product itself |
| 4 | `workspace-template/_context/00_method.md` | the method in full: layers, rules, prompts |
| 5 | `workspace-template/_context/10_row_schema.md` | the one contract every source type is reduced to |
| 6 | `_demo/` (any file) | the same product, already run once, so you can see real output |

## Task routing

| I want to… | Go to |
|---|---|
| Understand the method before adopting it | `workspace-template/_context/00_method.md` |
| See the exact fields of a knowledge-base row | `workspace-template/_context/10_row_schema.md` |
| See how a category taxonomy is meant to be structured | `workspace-template/_context/20_taxonomy.md` |
| Start a new team's copy of this workspace | `README.md` → "Adopting this for your team" |
| See the pipeline run against real (fictional) input | `_demo/_input/`, then `_demo/_kb/` |
| See a generated per-person report | `_demo/_outputs/personal/` |
| See a generated per-topic report | `_demo/_outputs/topics/` |
| See a question answered with citations | `_demo/_flows/query_kb/stages/01_answer/output/` |
| See which deals/engagements ranked as most significant | `_demo/_flows/value_ranking/stages/02_rank/output/ranking.md` |
| Change what a pipeline stage does | edit its `_flows/<flow>/stages/NN_*/CONTEXT.md` and, if mechanical, the script beside it |
| Change the extraction/enrichment/query behaviour of the model | edit the matching file in `_prompts/`, never the script |

## The four flows, one line

| Flow | Turns | Stages |
|---|---|---|
| `build_kb` | one source document → schema-shaped entries | prepare → extract → read (model) → validate → render |
| `index_kb` | unique entities across the corpus → category + index upsert | collect entities → enrich (model) → index |
| `query_kb` | a question → an answer with citations | filter (script) → answer (model) |
| `value_ranking` | the whole base → which engagements were biggest | collect candidates → assess (model) → rank |

`build_kb` and `index_kb` are corpus-building; `query_kb` and `value_ranking` are
corpus-reading. Nothing in the reading flows ever edits a row's `activity` field —
see the row schema for why that field is permanent once written.

---

**Updated:** 2026-09-23
