# Data Ingestion Flow — Vertical Offering Generator

**Workspace Identity (Layer 0).**

---

## Where am I?

This is the **Data Ingestion Flow**. Its job is to build and verify the
reference tables — `_data/features/*.md`, `_data/pain_points.md`,
`_data/sources.md`, and the `_data/map_*.md` mapping tables — that the
Report Generation Flow reads. A row only becomes `Status = VERIFIED`, and
therefore eligible for a `client`-mode build, by passing through this flow.

**Location:** `{PROJECT_ROOT}/_flows/data-ingestion/`

## What this flow does

### Input
- **Source documents** (Stage 02, `extract` mode) — whitepapers, product
  docs, case studies. Drop them in `_context_sources/` and point `--file` at
  them.
- **Direct knowledge** (Stage 01) — a feature the product owner already
  knows about, entered by hand.
- **Existing catalogue gaps** (Stage 02, `map-gaps` mode) — features that
  already exist but aren't yet linked to any pain point.

### Process (4 stages)
1. **Stage 01: Knowledge Organic Input** — manual edit + `--validate`
2. **Stage 02: Knowledge AI Mining** — two passes (prepare a prompt, then
   `--ingest` the LLM's reply) around a human LLM step, in one of two modes
   (`extract`, `map-gaps`) — the only stage in either flow that is not fully
   mechanized
3. **Stage 02.5: Verification Export** — deterministic mail-merge: Active
   Queue filtered by reviewer → a ready-to-send email
4. **Stage 02.6: Verification Parse** — parses the reviewer's accept /
   correct / reject reply; the only place `Status` becomes `VERIFIED`

### Output
- Updated `_data/*.md` — accepted rows at `PROPOSED` (Stage 02) or
  `VERIFIED` (Stages 01, 02.6)
- `_state/verification_queue.md` — Active Queue (pending) / Resolved Queue
  (decided)
- `_state/pm_responses.md` — one logged entry per parsed reply

## Structure

```
data-ingestion/
├── CLAUDE.md                        <- L0: this file
├── CONTEXT.md                       <- L1: routing
├── run_flow.js                      <- orchestrator: spawns each stage as a
│                                        separate process
└── stages/
    ├── 01_knowledge_organic_input/
    ├── 02_knowledge_ai_mining/
    ├── 02.5_verification_export/
    └── 02.6_verification_parse/
```

Every stage depends on the shared library at `../_lib/` (`paths.js`,
`tables.js`, `config.js`, `state.js`, `owners.js`, `naming.js`, `feedback.js`,
`artifact.js`, `log.js`, plus `tools/`).

## Quick start

```bash
cd "{PROJECT_ROOT}/_flows/data-ingestion"

node run_flow.js --stage 01 --validate

node run_flow.js --stage 02 --file "_context_sources/some_doc.md" --product example_module --pm PM01
# [human: paste stages/02_knowledge_ai_mining/output/mining_prompt.md into an LLM,
#  save the reply to stages/02_knowledge_ai_mining/output/mining_response.md]
node run_flow.js --stage 02 --ingest

node run_flow.js --stage 02.5 --pm PM01
# [human: send the generated email, wait for the reply]
node run_flow.js --stage 02.6 --pm PM01 --email-file reply.txt

node run_flow.js --stage 02 --mode map-gaps --product example_module
node run_flow.js --stage 02 --ingest
```

## Key concepts

**No trust in model IDs or guessed reviewers.** Every ID an LLM proposes is
discarded and reassigned from the true current sequence at ingest time; every
`PM_Assigned` is recomputed from `_data/pm_owners.md` via `owners.js`.

**A rejected row has no exit.** Stage 02.6 rejecting an entry moves the queue
row to Resolved but leaves the underlying `_data/*.md` row untouched at
`Status = PROPOSED` forever — excluded from `client`-mode builds, still
visible pending in `internal`-mode builds. This is a known, documented
design choice (see Stage 02.6's `CONTEXT.md`), not a silent gap.

**Error handling is fail-loud.** A stage that cannot produce a correct result
refuses (non-zero exit) and still writes an artifact explaining why.

**Each stage is independent and replayable**, communicating only through
files in its own `output/` or the shared `_state/`/`_data/` tables — never
in-memory state — so you can stop after any stage, hand-edit its artifact,
and resume from the next one.

---

**Method:** filesystem-as-orchestration (a Model-Workspace-Protocol-style
approach) — plain files and folders as the coordination layer between
mechanical stages and human decisions.
