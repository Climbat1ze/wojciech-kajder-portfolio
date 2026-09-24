# Vertical Offering Generator

**Layer 0 — workspace identity. Answers: where am I?**

---

## What this project is

A self-contained pipeline that generates industry-vertical offering
documents: it maps **product features** to **customer pain points** to
**industry verticals**, using an LLM-assisted authoring pipeline with a
structured product-manager (PM) review and feedback loop. The method is
**filesystem-as-orchestration**: every stage is a plain script or prompt that
reads and writes real files, so a human can inspect, hand-edit, or resume the
process at any point.

**This folder is fully self-contained.** It does not reference anything
outside itself. Copy it anywhere and it keeps working.

**This copy holds no real data.** Every reference table under `_data/` is
either empty (header-only) or carries a placeholder row, and
`vertical_offering.config.md` points at a vertical that does not exist yet.
Fill in your own product, pain points, verticals and mappings before running
a build. If you want to see the whole pipeline work end-to-end against a
worked example first, look at the sibling `_demo/` folder instead — it is the
same engine plus a small, entirely fictional dataset.

## The method in one picture

```
_data/verticals.md  ──┐
                       │  (map_pain_vertical.md)
_data/pain_points.md ─┼─────────────────────────► which pains matter for
                       │                             this vertical, and how much
_data/features/*.md ──┘
        │  (map_feature_pain.md)
        └─────────────────────────► which features answer each pain, and how

        Flow A: Data Ingestion              Flow B: Report Generation
        (build the knowledge base)          (build a deck from it)
        ───────────────────────────         ──────────────────────────
        01 organic input (manual)           03 render slide deck
        02 AI-assisted mining               03.2 curate scope (optional)
        02.5 verification export            03.5 generate HTML (optional)
        02.6 verification parse             04 review & verify gate
                                             05 publish & share
```

Two independent flows, run from `_flows/data-ingestion/` and
`_flows/report-generation/` — real `node run_flow.js` commands, no other
interface. Every stage is a separate process that reads and writes real
files; nothing is held in memory between stages, so you can stop after any
one of them, hand-edit its output, and resume.

## Structure

```
Vertical Offering Generator/
├── CLAUDE.md                  <- L0: this file
├── CONTEXT.md                 <- L1: routing
├── README.md                  <- orientation for a new reader
├── vertical_offering.config.md<- L4: the one control surface for a build
│
├── _context_sources/          <- INPUT: drop source documents here (whitepapers,
│                                  product docs, case studies) for Stage 02 to mine
├── _data/                     <- L3: reference tables (features, pain points,
│                                  verticals, mappings, sources, PM owners)
├── _state/                    <- L4: change log, Active Blocks, verification
│                                  queue, PM response log, per-build feedback
├── _prompts/                  <- L2: the LLM-driven authoring method, as prompts
├── _pm-guides/                <- process guides for whoever runs this day to day
├── _flows/                    <- the two flows + shared library (_lib/)
└── _outputs/
    ├── _drafts/                <- in-progress builds
    └── _final/                 <- published decks
```

## Status values

Every reference table uses the same small set of statuses:

| Status | Meaning | Who sets it |
|---|---|---|
| `VERIFIED` | A human confirmed this row | Stage 01 (organic entry) or Stage 02.6 (accepting an AI proposal) |
| `PROPOSED` | An AI-assisted pass proposed this row; nobody has confirmed it yet | Stage 02 only |
| `TBC` | Hardware attribute value not yet confirmed against an authoritative source | Stage 02 only, hardware table only |

There is a fourth real decision — **rejected** — but it is not a `Status`
value written into `_data/*.md`. A rejected AI proposal is left at
`PROPOSED` forever; the rejection and its reason live only in
`_state/pm_responses.md`. See `_flows/data-ingestion/stages/02.6_verification_parse/CONTEXT.md`
for why.

## Rules that hold everywhere in this project

1. **`Status = VERIFIED` can only be set by a human** — directly (Stage 01)
   or by accepting an AI proposal (Stage 02.6). No script sets it on its own.
2. **Every claim needs a citation.** A feature or pain point with no `Source`
   is rejected, not written with a blank citation.
3. **IDs are global sequences, never per-file.** `F_ID` in particular is one
   sequence across every file in `_data/features/` — see `_data/README.md`.
4. **Active Blocks live in exactly one place** —
   `_state/vertical_offering_state.md`. Nothing else should keep a second
   copy of that table.
5. **A build is not published without every relevant reviewer's approval.**
   Stage 05 enforces this mechanically; there is no override flag.

## Where to start

- **New to this project?** `README.md`, then `_pm-guides/README.md`.
- **Setting up your own data?** `_data/README.md`, then `_prompts/bootstrap_structure.md`.
- **Running a build?** `_pm-guides/PM_Guide_Creating_Vertical_Offering.md`.
- **Adding or verifying features?** `_pm-guides/PM_Guide_Managing_Features_and_Pains.md`.

---

**Method:** filesystem-as-orchestration (a Model-Workspace-Protocol-style
approach): plain files and folders as the coordination layer between
mechanical stages, an LLM-assisted authoring step, and human review.
