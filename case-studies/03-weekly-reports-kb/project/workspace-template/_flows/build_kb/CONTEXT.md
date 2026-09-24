# Flow: build_kb — document → schema-shaped entries

**Layer 2 — flow contract.**

Turns one source document into validated, schema-shaped rows and their
human-readable Markdown twin. Does not assign category — that is `index_kb`'s job,
because category is decided once per entity across the whole corpus, not per
document.

## Stages

| # | Stage | Who | Reads | Writes |
|---|---|---|---|---|
| 00 | `00_prepare` | script | `_input/` | `output/metadata.json` — document key, hash, type |
| 01 | `01_extract` | script | `00_prepare`'s metadata | `output/raw_text.json` — clean text |
| 02 | `02_read` | model decides, script assembles | `01_extract`'s text + the model's `spec_<key>.json` | `output/entries.json` |
| 03 | `03_validate` | script | `02_read`'s entries | `output/validated.json` — `entry_id`, hash, checks |
| 04 | `04_render_md` | script | `03_validate`'s output | `_kb/md/<doc_key>.md` |

## Why stage 02 is split between a model and a script

The model decides where an entry starts and ends, which section it belongs to,
who the client is — judgment calls that need reading comprehension. The script
then **cuts** the `activity` text directly out of the source, rather than having
the model retype it. That is what makes fidelity checkable instead of merely
claimed: every `activity` must appear verbatim in the source text, or the stage
refuses to write its output.

## Entry point

`_scripts/kb_run.py` drives this flow end to end for one document (`--scan` then
`--finish`). Run it rather than the five stage scripts directly, unless you are
debugging one stage in isolation.

## Gate discipline

Every stage stops on the first thing it cannot reconcile — a document that produced
zero entries in a section that clearly has content, a quote that doesn't appear in
its own source text, an `entry_id` collision. None of these are auto-corrected. Fix
the upstream cause (the spec, the source, or the stage contract) and re-run.
