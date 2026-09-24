# Runbook — who does each step

**Layer 3 — reference material.**

---

Legend: **script** = deterministic, runs unattended · **model** = reads for meaning,
produces a file a human can check · **human** = a decision only you can make.

| Step | Flow / stage | Who | Produces |
|---|---|---|---|
| 1 | pick the next document | human (or `kb_run.py --lista`) | — |
| 2 | `build_kb/00_prepare` | script | `output/metadata.json` — the document's key, hash, type |
| 3 | `build_kb/01_extract` | script | `output/raw_text.json` — clean text, no interpretation |
| 4 | read the line map, decide where each entry starts/ends, who the client is | model | `spec_<doc_key>.json` next to `02_read`'s script |
| 5 | `build_kb/02_read` (assemble) | script | `output/entries.json` — entries **cut from the source text**, not retyped |
| 6 | `build_kb/03_validate` | script | `output/validated.json` — `entry_id`, hash, checks against your rosters/codes |
| 7 | `build_kb/04_render_md` | script | `_kb/md/<doc_key>.md` — the human-readable twin |
| 8 | review `issues` printed by validate/render | human | correct the source or the stage contract, not the output |
| 9 | `index_kb/00_collect_entities` | script | `output/entities.json` — unique clients across the whole corpus |
| 10 | assign category per new entity (registry entities are reused, not re-decided) | model | `decisions.json` next to `01_enrich`'s script |
| 11 | `index_kb/01_enrich` (apply_decisions) | script | `output/metadata.json` — one record per entity |
| 12 | `index_kb/02_index` | script | `_kb/activities.jsonl` upserted, `_kb/_registry/clients.md` and `pending_review.md` updated |
| 13 | ask a question | human | a natural-language question |
| 14 | `query_kb/00_filter` | script | `output/hits.json` — narrowed rows only |
| 15 | `query_kb/01_answer` | model | an answer, every claim cited to `entry_id` |
| 16 | generate a report | script | `_outputs/personal/*.md`, `_outputs/topics/*.md`, or the weekly index |
| 17 | periodically: check the base hasn't drifted | script | `check_canon.py` (taxonomy), `audit_fidelity.py` (quotes vs. source) |

## Two things worth doing before you scale this up

- **Run the first document by hand, all the way through**, and read every output
  file at every gate. The failure modes this method exists to prevent (a category
  guessed instead of marked `TBD`, an entry silently dropped, a quote reworded) are
  cheap to catch here and expensive to catch after fifty documents.
- **Decide your `section` vocabulary and your taxonomy shape before processing more
  than a handful of documents.** Both are canon files (`10_row_schema.md`,
  `20_taxonomy.md`); changing them after the base has grown means a deliberate
  re-index, not a quiet patch.

---

**Updated:** 2026-09-23
