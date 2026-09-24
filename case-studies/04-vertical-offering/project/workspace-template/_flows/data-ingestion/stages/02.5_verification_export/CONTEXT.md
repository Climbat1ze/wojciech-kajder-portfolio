# Stage 02.5 — Verification Export

**Layer 2 — Stage contract.**

---

## What this stage is

A deterministic mail-merge, not an LLM step. It reads every Active Queue
item assigned to one reviewer and renders them into a single ready-to-send
message — the reviewer's **whole** pending portfolio in one email, not one
message per item. Piecemeal delivery (a separate email per proposal) creates
communication chaos; batching by reviewer is a deliberate design choice.

## Inputs

| Input | Purpose |
|---|---|
| `--pm <PM_ID>` (required) | whose Active Queue items to export |
| `--format <html\|md\|text>` (default `html`) | output format |
| `--deadline <YYYY-MM-DD>` (default: +3 days) | reply-by date shown in the email |
| `_state/verification_queue.md` (Active Queue) | the items to include |
| `_data/pm_owners.md` | resolve `PM_ID` to a display name |
| `_data/features/*.md`, `_data/pain_points.md`, `_data/map_feature_pain.md` | fuller detail for each queued item |

## Outputs

| Output | Path |
|---|---|
| The email | `output/verification_email_<PM_ID>.{html,md,txt}` |
| Stage envelope, including the `number -> Entry_ID` map | `output/export_report.json` |

**The number -> Entry_ID map matters downstream.** Stage 02.6 reads it from
this stage's own `export_report.json` rather than recomputing item numbers
against a possibly-since-changed live queue. If the queue changed for this
reviewer after this export ran (a new batch was ingested for them), re-run
this stage before parsing their reply — otherwise "accept 1, 2" could apply
to the wrong items.

## Rule

This stage never writes to `_state/verification_queue.md`. It only reads it.
The queue only changes in Stage 02 (new entries) and Stage 02.6 (entries
resolved).
