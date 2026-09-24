# Vertical Offering Generator — Worked Example

This is the same engine as the sibling `workspace-template/` folder, seeded
with a small, **entirely fictional** dataset so you can see the whole
pipeline run end to end before touching your own data.

**The fictional setup:** a made-up rugged-tablet product line, "Aster Field
Tablet", sold by a made-up company, with two products (**Aster Device
Manager**, device management software, and **Aster Scan Suite**, barcode
scanning software), two fictional reviewers (Diego Alvarez, Mei-Lin Zhao),
and two fictional industry verticals (**Warehousing & Logistics**, **Field
Services**).

**Every command below has actually been run against this data.** Nothing
under `_flows/*/stages/*/output/`, `_state/*_build_feedback.md`,
`_state/pm_responses.md`, or `_outputs/_final/` is hand-typed — it is the
real output of running this engine's code, including one genuine reject
decision and one Active Block badge, so you can see both mechanisms working,
not just the happy path.

## What's already in `_data/`

A baseline you can think of as "organic input" (Stage 01 — a product owner
typed these in directly, so they start `VERIFIED`):

- 2 verticals: `V01` Warehousing & Logistics, `V02` Field Services
- 5 pain points: `P01`-`P05`
- 4 features across 2 catalogues: `aster_device_manager.md` (F01-F03),
  `aster_scan_suite.md` (F04)
- 4 sources, 4 hardware attributes, 7 pain-to-vertical mappings, 4
  feature-to-pain mappings
- 3 reviewers in `pm_owners.md`: `PM_Lead` (Priya Natarajan), `PM01` (Diego
  Alvarez, owns Aster Device Manager), `PM02` (Mei-Lin Zhao, owns Aster Scan
  Suite)

## The worked example: mining a new document

`_context_sources/aster_scan_analytics_notes.md` is a fictional field note
that was **not** part of the baseline. Here is exactly what was run against
it (data-ingestion flow, `extract` mode):

```bash
cd _flows/data-ingestion

# 1. Prepare: compose the prompt from the source document
node run_flow.js --stage 02 --file "_context_sources/aster_scan_analytics_notes.md" \
  --product aster_scan_suite --pm PM02
# -> stages/02_knowledge_ai_mining/output/mining_prompt.md

#    [this is the one manual step: that prompt was pasted into an LLM,
#     and the reply saved to output/mining_response.md — see that file,
#     it's kept as-is, so you can see exactly what a "model reply" looks
#     like in the format this pipeline expects]

# 2. Ingest: reassign real IDs, write to _data/*.md as PROPOSED, queue for review
node run_flow.js --stage 02 --ingest
# -> added F05 (Offline Scan Queueing), F06 (Scan Analytics Dashboard),
#    P06 (Network dead zones in large facilities), a new source S05,
#    and 5 items in _state/verification_queue.md's Active Queue

# 3. Export: generate PM02's review email (all 5 items, one email)
node run_flow.js --stage 02.5 --pm PM02 --format text --deadline 2026-09-26
# -> stages/02.5_verification_export/output/verification_email_PM02.txt

# 4. Parse: apply PM02's reply
node run_flow.js --stage 02.6 --pm PM02 \
  --email-file "stages/02.6_verification_parse/output/pm02_reply_2026-01-16.txt"
# -> accepted 1-4 (F05, F06, P06, F05->P06 mapping): Status flips to VERIFIED
#    -> rejected 5 (F06->P03 mapping): stays PROPOSED forever, reason logged
#       in _state/pm_responses.md (RESP-001)
```

Open `_state/pm_responses.md` to see the logged decision, including the
rejection reason in PM02's own words. Open `_data/features/aster_scan_suite.md`
to see that F06 itself is `VERIFIED` (the feature is real) while
`_data/map_feature_pain.md` still shows its mapping to P03 as `PROPOSED`
(the *link* to that specific pain was rejected) — a concrete example of why
this system tracks feature status and mapping status separately.

Regenerate the derived index after any ownership or catalogue change:

```bash
node ../_lib/tools/generate_feature_owner_map.js
```

## The worked example: building and publishing a deck

```bash
cd _flows/report-generation

node run_flow.js --stage 03 --vertical V01 --mode internal
# -> 5 pain points in scope, 5 features, 0 sent to annex (internal mode
#    shows everything, PROPOSED included, with badges)

node run_flow.js --stage 03.5
# -> stages/03.5_generate_html/output/report.html

node run_flow.js --stage 04 --build-id 2026-09-23_WarehousingLogistics --deadline 2026-09-26
# -> one review email each for PM01 and PM02 (only reviewers with content
#    in THIS build), plus _state/2026-09-23_WarehousingLogistics_build_feedback.md

# [human step: both reviewers "replied" — their Approved rows were written
#  into the feedback file by hand, exactly as a real reviewer's sign-off
#  would be]

node run_flow.js --stage 05 --build-id 2026-09-23_WarehousingLogistics
# -> _outputs/_final/2026-09-23_Vertical_Offering_Warehousing_Logistics_FINAL_v1.{md,html}
#    + a line appended to _state/vertical_offering_state.md
```

**Try the gate yourself:** delete or blank a `Status` cell in
`_state/2026-09-23_WarehousingLogistics_build_feedback.md` back to `Pending`
and re-run stage 05 — it refuses, and names exactly who it's waiting on.

**Try client mode:** `node run_flow.js --stage 03 --vertical V01 --mode
client` — scope shrinks to 4 pain points / 3 features, and 2 items (the
still-`PROPOSED` F06->P03 mapping, and the P06 pain itself, whose own
vertical mapping was never sent for review) move to the Verification Annex
instead of being silently dropped.

## The Active Block in this data

`_state/vertical_offering_state.md` has one `ACTIVE` block:
`BLOCK-001` badges any feature whose name contains "Analytics" — that's why
the published deck shows **Scan Analytics Dashboard** with a
"Pilot feature — limited field data so far" tag alongside its `VERIFIED`
status. This demonstrates the `badge:` action; nothing in this dataset
exercises the `exclude` action, but the mechanism is identical (see
`_flows/_lib/state.js`).

## Where the finished output is

`_outputs/_final/2026-09-23_Vertical_Offering_Warehousing_Logistics_FINAL_v1.md`
(and the matching `.html`) is the actual, generated end-to-end output of
this pipeline — open it to see what a finished Vertical Offering document
looks like: a Scope Board, one deep-dive section per pain point (grouped by
cluster), a hardware-platform table, and a build summary line.

## Guides

Same as `workspace-template/` — see `_pm-guides/README.md`. Everything
there refers to this demo's actual PM_IDs (`PM01`, `PM02`) and product names
where an example is useful.
