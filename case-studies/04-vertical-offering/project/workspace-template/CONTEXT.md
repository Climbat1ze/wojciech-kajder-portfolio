# Vertical Offering Generator — Routing

**Layer 1 — where do I go?**

---

## Reading order for a new project

1. `CLAUDE.md` — what this is
2. `_data/README.md` — the data model (tables, columns, ID conventions)
3. `_pm-guides/PM_Guide_Integrated_Process.md` — the end-to-end picture
4. `vertical_offering.config.md` — the one control surface for a build

## Task routing

| Task | Go to |
|---|---|
| Set up my own product/pain/vertical data for the first time | `_prompts/bootstrap_structure.md`, then `_prompts/create_reference_tables.md` |
| Add a feature I already know about | `_flows/data-ingestion/stages/01_knowledge_organic_input/CONTEXT.md` |
| Mine a new source document for features/pain points | `_flows/data-ingestion/stages/02_knowledge_ai_mining/CONTEXT.md`, prompt: `_prompts/analyze_source.md` |
| Link existing features to existing pain points | same stage, `--mode map-gaps`, prompt: `_prompts/map_gaps.md` |
| Send a reviewer their pending items | `_flows/data-ingestion/stages/02.5_verification_export/CONTEXT.md` |
| Apply a reviewer's accept/correct/reject reply | `_flows/data-ingestion/stages/02.6_verification_parse/CONTEXT.md` |
| Build a deck for one vertical | `_flows/report-generation/CONTEXT.md`, prompt: `_prompts/build_vertical_offering.md` |
| Trim a deck for a shorter, customer-facing version | `_flows/report-generation/stages/03.2_curate_scope/CONTEXT.md` |
| Generate a shareable HTML report | `_flows/report-generation/stages/03.5_generate_html/CONTEXT.md`, prompt: `_prompts/generate_html_report.md` |
| Route a build to reviewers, track sign-off | `_flows/report-generation/stages/04_review_verify_gate/CONTEXT.md` |
| Publish an approved build | `_flows/report-generation/stages/05_publish_share/CONTEXT.md` |
| Check the data is internally consistent | `node _flows/_lib/tools/check_integrity.js` |
| Regenerate the feature -> reviewer index | `node _flows/_lib/tools/generate_feature_owner_map.js` |
| Change who owns which product | `_data/pm_owners.md` |
| Change a filter applied to every build | `_state/vertical_offering_state.md` (Active Blocks) |
| Understand the full methodology | `_pm-guides/PM_Guide_Integrated_Process.md` |

## Output locations

| Output | Path |
|---|---|
| Stage-by-stage intermediate artifact | `_flows/<flow>/stages/<stage>/output/` |
| Draft deck (Markdown) | `_flows/report-generation/stages/03_render_slidedeck/output/draft_deck.md` |
| Draft report (HTML) | `_flows/report-generation/stages/03.5_generate_html/output/report.html` |
| Per-build reviewer feedback | `_state/[Build_ID]_build_feedback.md` |
| Published deck | `_outputs/_final/` |
| Work in progress | `_outputs/_drafts/` |

---

**Method:** filesystem-as-orchestration.
