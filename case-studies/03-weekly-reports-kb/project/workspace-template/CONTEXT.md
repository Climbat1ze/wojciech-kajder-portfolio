# Routing

**Layer 1 — where do I go?**

---

## Reading order

| # | Document | Why |
|---|---|---|
| 1 | `CLAUDE.md` | identity of this workspace |
| 2 | `_context/00_method.md` | the method: layers, rules, the four prompts inline |
| 3 | `_context/10_row_schema.md` | the one schema every source type is reduced to |
| 4 | `_context/20_taxonomy.md` | where your own controlled category vocabulary goes |
| 5 | `_context/40_runbook.md` | run order, and who does each step |

## Task routing

| Situation | Do this |
|---|---|
| First time setting this workspace up | fill `_context/20_taxonomy.md` and (if used) `_config/businessUnitCodes.md` before processing anything |
| New source document to process | drop it in `_input/<period>/<period> originals/`, then run `build_kb` (see below) |
| Want to see what's left to process | `python _scripts/kb_run.py --list` |
| Ready to process one document | `python _scripts/kb_run.py --scan <doc_key>` → have the model write `spec_<doc_key>.json` → `python _scripts/kb_run.py --finish <doc_key>` |
| New documents processed, need categories assigned | run `index_kb` (see below) |
| Have a question for the base | run `query_kb` (see below) |
| Want to know which engagements were biggest | run `value_ranking` (see below) |
| Want a report for one person | `python _scripts/build_personal_report.py "<Full Name>"` |
| Want a report for one category/topic | `python _scripts/build_topic_report.py "<Category>"` |
| Want a running index of processed documents | `python _scripts/build_weekly_index.py` |
| Want to count something across the whole base | `python _scripts/kb_stats.py --group-by <field>` |
| Want to check the taxonomy hasn't drifted | `python _scripts/check_canon.py` |
| Want to prove the index still matches the source files | `python _scripts/audit_fidelity.py` |
| Changing what the model extracts, enriches, or answers | edit the matching file in `_prompts/`, not a script |
| Changing a stage's contract | edit its `_flows/<flow>/stages/NN_*/CONTEXT.md` |

## Running `build_kb` (document → entries → index-ready rows)

```
python _scripts/kb_run.py --lista            # what's left to process
python _scripts/kb_run.py --scan <doc_key>   # prepare + extract + print the line map
#   → the model reads the line map and writes
#     _flows/build_kb/stages/02_read/_scripts/spec_<doc_key>.json
python _scripts/kb_run.py --finish <doc_key> # assemble + validate + render + archive the run
```

## Running `index_kb` (entities → category → upsert into `_kb/activities.jsonl`)

```
python _flows/index_kb/stages/00_collect_entities/_scripts/collect.py
#   → the model reads output/entities.json against _context/20_taxonomy.md
#     and writes _flows/index_kb/stages/01_enrich/_scripts/decisions.json
python _flows/index_kb/stages/01_enrich/_scripts/apply_decisions.py
python _flows/index_kb/stages/02_index/_scripts/index_kb.py
```

## Running `query_kb` (question → answer with citations)

```
python _flows/query_kb/stages/00_filter/_scripts/filter.py --vertical "<category>" --od 2025-01-01
#   → the model reads output/hits.json and _prompts/F_query.md, writes the answer
```

## Running `value_ranking` (whole base → biggest engagements)

```
python _flows/value_ranking/stages/00_collect/_scripts/collect.py
#   → the model reads output/candidates.json against _prompts/G_value.md,
#     writes _flows/value_ranking/stages/01_assess/output/valued.json
python _flows/value_ranking/stages/02_rank/_scripts/rank.py
```

## Gates

Every stage ends in a file under `output/` (or, for the two model steps, a spec/
decisions file a human can read and correct before the next stage runs). Do not skip
past a gate without looking at what it produced — that is the cheapest point to
catch a mistake. When a result is wrong, fix the **source** (the stage contract, or a
file in `_context/`/`_prompts/`), not the one output — a fixed output repairs one
run, a fixed source repairs every run after it.

---

**Updated:** 2026-09-23
