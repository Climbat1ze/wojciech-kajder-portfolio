# Knowledge Base Workspace — Reference Product

**Layer 0 — workspace identity. Answers: where am I?**

---

## What this workspace does

Reads company documents (status-report emails, case studies, update notes — as
`.msg` / `.docx`, extendable to `.pptx`), and turns them into one thing that can be
searched with context: a flat index where **one row = one activity**, plus a
readable Markdown page per document for when a citation needs its surrounding
context. A question against the base runs in two moves: a script narrows the index
by field (category, date, client, person) to the rows that match, then a model reads
only those rows and answers with citations back to `entry_id`. This is retrieval
without a vector database — structural, cheap, explainable, and portable, because
the whole base is a folder of text files.

**This folder is fully self-contained.** Nothing in it refers to any path outside
itself. Copy it anywhere and it runs.

## Structure

```
workspace-template/
├── CLAUDE.md                  ← this file
├── CONTEXT.md                 ← routing
├── _context/                  ← canon: method, row schema, category taxonomy
├── _config/
│   ├── teamMembers.md         ← ONLY distorted spellings seen in documents → canonical name
│   └── businessUnitCodes.md   ← your own controlled list of unit/team codes, if you use them
├── _prompts/                  ← the four prompts the model runs on (extraction, enrichment, query, value)
├── _scripts/                  ← shared library: extraction primitive, filter, stats, canon check, fidelity audit, report builders
├── _flows/
│   ├── build_kb/stages/       ← document → schema-shaped entries (00_prepare … 04_render_md)
│   ├── index_kb/stages/       ← entities → category → index upsert (00_collect_entities … 02_index)
│   ├── query_kb/stages/       ← question → answer with citations (00_filter → 01_answer)
│   └── value_ranking/stages/  ← whole base → which engagements were biggest (00_collect → 02_rank)
├── _input/                    ← INPUT: your source documents (kept out of version control)
├── _kb/                       ← the product: activities.jsonl, md/, _registry/
└── _outputs/                  ← generated reports (created by _scripts/build_*.py)
```

## Before you process anything

1. Fill in `_context/20_taxonomy.md` with your own controlled category vocabulary.
   The two-level shape (category → detail) is a suggestion, not a requirement — a
   single flat list works too, as long as it is a **closed, versioned list**, not
   values invented per document.
2. If your reports name subsidiaries, regional teams, or business units by code,
   fill `_config/businessUnitCodes.md` with your own canon. If they don't, delete
   the `business_unit` section from the row schema and from `_context/00_method.md`
   §4 rather than leaving a section nobody ever populates.
3. Leave `_config/teamMembers.md` empty until extraction actually produces a name
   variant your roster doesn't recognise — see the file header for why it must never
   hold the roster itself.
4. Read `_context/40_runbook.md` for the order to run things in and who does what
   (script vs. model vs. you).

## Rules that hold the method together

1. **The line between determinism and understanding.** Pulling text out of a binary
   file, and writing rows to the index, is a script's job — deterministic. Deciding
   what a piece of text means (who the client is, what category it belongs to, what
   counts as one activity) is the model's job. The two are never swapped.
2. **No regex on content.** Report structure varies between documents — tables of
   different lengths, multi-line cells, sections that are sometimes missing. Pattern
   matching breaks on this; a model reading for meaning does not. Only the
   *conversion* from binary to text is mechanical.
3. **Controlled lists are canon.** A category value outside `_context/20_taxonomy.md`,
   or a field outside `_context/10_row_schema.md`, is an error, not a variant.
   Changing a controlled list is a deliberate edit to that one file, never a value
   invented in the middle of a run.
4. **A quote is permanent.** The `activity` field is copied 1:1 from the source and
   is never rewritten during enrichment. `activity_sha256` makes that provable
   instead of merely claimed — see `_context/10_row_schema.md`.
5. **Rules live in `_context/` and `_prompts/`, not in code.** Changing what the
   model pays attention to is an edit to a Markdown file, never a script.
6. **One address per role.** Nothing composes a path from pieces or hardcodes a year;
   every script reads a shared paths module. Divergent path logic across scripts is
   exactly how this kind of workspace silently forks into inconsistent copies.

---

**Method:** Model Workspace Protocol (MWP) — filesystem as orchestration layer.
**Version:** 1.0 (reference)
