# Data Ingestion Flow — CONTEXT.md

**Layer 1 — Routing.**

---

## Routing table

| Stage | Name | When to use | Contract |
|---|---|---|---|
| **01** | Knowledge Organic Input | You already know a feature; `--validate` checks the catalogue afterward | `stages/01_knowledge_organic_input/CONTEXT.md` |
| **02** | Knowledge AI Mining | Propose new features/pains from a document (`extract`), or link existing features to existing pains (`map-gaps`) | `stages/02_knowledge_ai_mining/CONTEXT.md` |
| **02.5** | Verification Export | Generate the review email for one reviewer's queued items | `stages/02.5_verification_export/CONTEXT.md` |
| **02.6** | Verification Parse | Apply a reviewer's accept/correct/reject reply | `stages/02.6_verification_parse/CONTEXT.md` |

## Quick navigation

```bash
cd "{PROJECT_ROOT}/_flows/data-ingestion"

node run_flow.js                                        # every stage (02's prepare pass only)
node run_flow.js --stage 01 --validate
node run_flow.js --stage 02 --file doc.md --product example_module --pm PM01
node run_flow.js --stage 02 --mode map-gaps --product example_module
node run_flow.js --stage 02 --ingest
node run_flow.js --stage 02.5 --pm PM01
node run_flow.js --stage 02.6 --pm PM01 --email-file reply.txt
node run_flow.js --stage 02-02.6                          # a range
node run_flow.js --help
```

## Stage dependencies

```
Stage 01 (manual edit + --validate)
    | (independent — no artifact feeds Stage 02)
Stage 02 prepare  -> output/mining_prompt.md, mining_request.json
    | [human: LLM] -> output/mining_response.md
Stage 02 ingest   -> _data/*.md (PROPOSED rows), _state/verification_queue.md (Active)
    v
Stage 02.5 -> output/verification_email_<PM_ID>.*, output/export_report.json
    | [human: send, wait for reply]
    v
Stage 02.6 (requires export_report.json for the SAME --pm)
    -> _state/verification_queue.md (Resolved), _state/pm_responses.md,
       _data/*.md (Status: PROPOSED -> VERIFIED, accepted rows only)
```

Every arrow is a real file, not an in-memory handoff — `run_flow.js` runs
each stage as a separate process, so stopping after any stage, hand-editing
its artifact, and resuming from the next one is always safe.

## Related files

- **Flow identity:** `CLAUDE.md` (L0)
- **Shared library:** `../_lib/`
- **Parent project:** `../../CLAUDE.md`
- **Reference tables:** `../../_data/`
- **State:** `../../_state/verification_queue.md`, `../../_state/pm_responses.md`, `../../_state/vertical_offering_state.md`
- **Report Generation Flow:** `../report-generation/CONTEXT.md` — reads the `_data/*.md` this flow produces and verifies
