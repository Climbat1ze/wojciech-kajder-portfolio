# Routing

**Layer 1 — where do I go?**

---

Same routing as `workspace-template/CONTEXT.md` — this file only adds where to
look for the *filled-in* version of each thing.

| I want to see… | Go to |
|---|---|
| a filled-in category taxonomy | `_context/20_taxonomy.md` |
| a filled-in team roster | `_config/teamRoster.md` |
| a filled-in unit-code canon | `_config/businessUnitCodes.md` |
| the fictional source documents | `_input/Reports 2025/Reports 2025 originals/` |
| a generated per-document Markdown page | `_kb/md/2025-W05.md` (or W06, W07, or the case study) |
| the generated flat index | `_kb/activities.jsonl` |
| the generated entity registry | `_kb/_registry/clients.md` |
| the one entity that landed as `TBD` | `_kb/_registry/pending_review.md` |
| an archived per-document build_kb run (hand-built — see `_input/README.md`) | `_kb/_runs/2025-W05/validated.json` (etc.) |
| the entities collected before category assignment (script actually ran) | `_flows/index_kb/stages/00_collect_entities/output/entities.json` |
| the model's category decisions for this corpus | `_flows/index_kb/stages/01_enrich/_scripts/decisions.json` |
| a question answered with citations | `_flows/query_kb/stages/01_answer/output/answer_example.md` |
| which fictional engagements were biggest | `_flows/value_ranking/stages/02_rank/output/ranking.md` |
| the known "period" quirk for non-recurring documents, live | Bracken Manufacturing Co. shows 3 periods in `ranking.md` §B, but only 2 (`2025-W06`, `2025-W07`) are real weekly periods — the third comes from the case study's date-slug key; see `_context/10_row_schema.md` → "Known limitation" |
| a generated per-person report | `_outputs/personal/sam_okafor.md` |
| a generated per-topic report | `_outputs/topics/logistics_transportation.md` |
| a generated running index of processed documents | `_outputs/weekly_index.md` |

For everything else — how a stage works, what a field means, why a rule exists —
the answer lives in the same place it does in `workspace-template/`, because this
is the same engine.

---

**Updated:** 2026-09-23
