# Weekly Reports Knowledge Base — quickstart

This package turns a team's recurring status-report documents into a searchable
knowledge base plus generated reports. It is organized the way a workshop separates
the machine from the product: `workspace-template/` is the machine (no data, ready to
copy), `_demo/` is the same machine already fed a small invented example so you can
see it work before trusting it with anything real.

## Adopting this for your team

1. Copy `workspace-template/` to wherever your team keeps its work, and rename it.
2. Read `workspace-template/CLAUDE.md`, then `workspace-template/CONTEXT.md`.
3. Fill in your own reference material before processing anything:
   - `_context/20_taxonomy.md` — your own controlled category vocabulary (industry,
     product line, region — whatever dimension your reports need to filter by).
   - `_config/teamMembers.md` — leave empty until you hit a spelling variant; it is a
     registry of *distorted* spellings, not a roster (see the file for why).
   - `_config/businessUnitCodes.md` — your own set of valid unit/subsidiary/team codes,
     if your reports are organized that way. Delete the concept entirely if they are not.
4. Drop your source documents into `_input/<period>/<period> originals/` (see
   `_input/README.md` for the exact convention the scripts expect).
5. Run the four flows in order for each document, following
   `workspace-template/CONTEXT.md` → "The four flows, one line". `build_kb` and
   `index_kb` build the base; `query_kb` and `value_ranking` read it.
6. Generate reports from `_kb/activities.jsonl` with the scripts in `_scripts/`:
   `build_personal_report.py`, `build_topic_report.py`, `build_weekly_index.py`.

## Exploring the demo first

`_demo/` is the identical engine, seeded with a fictional team ("Lighthouse Program",
a made-up client-support group at a made-up company called Meridian Systems) and four
fictional source documents, already carried through every stage. Open, in this order:

1. `_demo/_input/Reports 2025/Reports 2025 originals/` — the fictional source notes.
2. `_demo/_kb/md/2025-W05.md` — the same content as a per-document Markdown page,
   with anchors, after the extraction stage.
3. `_demo/_kb/activities.jsonl` — the flat index: one line per activity, 15 fields.
4. `_demo/_kb/_registry/clients.md` — the entity dictionary: each fictional client
   resolved to one category, once.
5. `_demo/_flows/query_kb/stages/01_answer/output/answer_example.md` — a question
   answered from the index, with citations back to `entry_id`.
6. `_demo/_outputs/personal/` and `_demo/_outputs/topics/` — generated reports.

Nothing in `_demo/` is real. Every name, company, number and quote was invented for
this package.

## What is deliberately not included

The source this method was extracted from also has a second, adjacent pipeline that
converts the same kind of source document into a company-specific weekly status
report (an HTML page with KPI cards, a week-over-week index, and short executive
briefing notes). That pipeline is not included here: its structure is tightly bound
to one organization's own KPI catalogue, financial targets, and links to that
organization's other internal tracking projects, so reproducing its shape without
also reproducing (or badly inventing) those specifics would not be a usable
reference. What generalizes — and what this package gives you — is the knowledge-base
core underneath it: schema, taxonomy discipline, citation-backed retrieval, and
report generation driven entirely from the index rather than from any one
organization's report template.

---

**Method:** Model Workspace Protocol (MWP) — filesystem as orchestration layer.
