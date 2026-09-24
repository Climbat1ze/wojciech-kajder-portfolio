# Vertical Offering — Project State

**DEMO DATA.** Layer 4 — working artifact; the single authoritative copy of
the Active Blocks table and the running change log for this fictional
project.

## Active Blocks

Each `ACTIVE` row compiles into a filter applied by Stage 03, before the
`mode` filter. `Scope` is `<entity>.<column>` (`*` for any column) where
`<entity>` is one of `features`, `pain_points`, `map_feature_pain`,
`hardware_attributes`. `Match` is one of `contains`, `equals`, `id`,
`regex`, `all`. `Action` is `exclude`, `badge:<label>`, or `none`.

| Block_ID | Status | Scope | Match | Pattern | Action | Reason |
|----------|--------|-------|-------|---------|--------|--------|
| BLOCK-001 | ACTIVE | features.Feature | contains | Analytics | badge:Pilot feature — limited field data so far | The scan analytics dashboard is still in a small pilot; flag it for the reader instead of hiding it |

## Log zmian (change log)

| Date | Action | Description | Path |
|------|--------|-------------|------|
| 2026-09-23 | seed | Baseline demo data added: 2 verticals, 5 pain points, 2 feature catalogues (4 features), 4 sources, 4 hardware attributes, 7 pain-vertical mappings, 4 feature-pain mappings | _data/ |
| 2026-09-23 | analyze_source (demo) | Aster Scan Suite — Field Notes on Connectivity and Analytics -> 2 features, 1 pain, 2 feature-pain mappings, 1 pain-vertical mapping, 1 source | _data/features/aster_scan_suite.md, _data/pain_points.md, _data/map_feature_pain.md, _data/map_pain_vertical.md, _data/sources.md |
| 2026-09-23 | verification (demo) | PM02 (Mei-Lin Zhao) accepted F05, F06, P06, F05->P06; rejected F06->P03 (see _state/pm_responses.md RESP-001) | _data/features/aster_scan_suite.md, _data/pain_points.md, _data/map_feature_pain.md |
| 2026-09-23 | publish | 2026-09-23_WarehousingLogistics: published V01 Warehousing & Logistics, v1 | _outputs/_final/2026-09-23_Vertical_Offering_Warehousing_Logistics_FINAL_v1.md, _outputs/_final/2026-09-23_Vertical_Offering_Warehousing_Logistics_FINAL_v1.html |
