# Knowledge Base Workspace — Demo Instance

**Layer 0 — workspace identity. Answers: where am I?**

---

## What this is

The exact same engine as `../workspace-template/`, seeded with a small, entirely
fictional example and carried through every stage of the method by hand, so a
reader can see real generated artifacts — a per-document Markdown page, index
rows, an entity registry, a cited answer, generated reports — without touching
anyone's real data.

**The team, the company, the clients, the people, and every figure in this folder
are invented.** "Lighthouse Program" is a made-up client-support team at a
made-up device vendor, "Meridian Systems". See `_input/README.md` for the one
technical caveat this demo carries (why the source documents are `.md` files
instead of real `.msg`/`.docx`, and what that means for which scripts you can
actually run against them as-is).

## Structure

Identical to `workspace-template/` — see its `CLAUDE.md` for the full layout.
The only additions here are the fictional data and the generated artifacts:

```
_demo/
├── CLAUDE.md, CONTEXT.md      ← this instance's identity/routing
├── _context/20_taxonomy.md    ← FILLED: 4 fictional categories, 11 details
├── _config/                   ← FILLED: fictional roster, unit codes, one name variant
├── _input/                    ← 4 fictional source notes (see its README)
├── _kb/                       ← activities.jsonl, md/, _registry/ — the payoff (see note below)
├── _flows/index_kb/…/output/  ← GENERATED for real: entity collection, category decisions
├── _flows/query_kb/…/output/  ← GENERATED for real: a filtered question, a cited answer
├── _flows/value_ranking/…/output/ ← GENERATED for real (ranking) / model step (valued.json)
└── _outputs/                  ← GENERATED for real: two personal reports, three topic reports
```

## Where to look, in order

1. `_input/Reports 2025/Reports 2025 originals/` — what came in.
2. `_kb/md/2025-W05.md` (and the other three) — the readable per-document page.
3. `_kb/activities.jsonl` — the flat index, 18 rows, 15 fields each.
4. `_kb/_registry/clients.md` — five fictional clients, each resolved to one
   category, once; `pending_review.md` shows the one deliberately unresolved
   case (`TBD`).
5. `_flows/query_kb/stages/01_answer/output/answer_example.md` — a question
   answered from the index, every claim cited.
6. `_flows/value_ranking/stages/02_rank/output/ranking.md` — which
   fictional engagements were biggest, and what was rejected.
7. `_outputs/personal/` (Sam Okafor, Elena Rossi) and `_outputs/topics/`
   (Logistics & Transportation, Manufacturing, Public Sector) — reports
   generated straight from the index.

## What was hand-built vs. what a script produced

Because the source documents are plain text rather than real `.msg`/`.docx`
files (see `_input/README.md`), `build_kb`'s own scripts could not run against
them end to end. Its outputs — `_kb/md/*.md` and `_kb/_runs/*/validated.json`
(and, by extension, `_kb/activities.jsonl`'s pre-category fields) — were
therefore **hand-built** to the exact schema those scripts would have produced,
with real, verifiable SHA-256 hashes over each `activity` string.

Everything from `index_kb` onward **actually ran**: `_flows/index_kb/`'s
scripts merged the hand-built entries and wrote the real `activities.jsonl`
(after a real category decision per entity — see `01_enrich/_scripts/decisions.json`);
`_flows/query_kb/00_filter` really filtered it; `_flows/value_ranking/00_collect`
and `02_rank` really scanned and ranked it; the answer to the query and the
category decisions in `01_assess/output/valued.json` are the two model-authored
steps in the method (per `_prompts/F_query.md` and `_prompts/G_value.md`),
written by hand the way a model would produce them; every file under
`_outputs/` came from actually running `_scripts/build_*.py`.

---

**Method:** Model Workspace Protocol (MWP) — filesystem as orchestration layer.
**Status:** demo / fictional data only.
