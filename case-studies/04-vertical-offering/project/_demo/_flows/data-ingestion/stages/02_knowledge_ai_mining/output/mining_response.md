## Proposed Features (features/aster_scan_suite.md)

| F_ID | Feature | Product | Description | Source | Status |
|------|---------|---------|-------------|--------|--------|
| F90 | Offline Scan Queueing | Aster Scan Suite | Queues scan events locally when connectivity drops and syncs them automatically once the connection returns | S90 | PROPOSED |
| F91 | Scan Analytics Dashboard | Aster Scan Suite | Shows scan volume and error rates broken down by device and by shift | S90 | PROPOSED |

## Proposed Pain Points (pain_points.md)

| P_ID | Pain Point | Cluster | Description | Source | Status |
|------|------------|---------|-------------|--------|--------|
| P90 | Network dead zones in large facilities | Network | Large warehouses have Wi-Fi dead zones, often near metal racking, that interrupt scanning workflows | S90 | PROPOSED |

## Proposed Mappings (map_feature_pain.md)

| F_ID | P_ID | How it addresses | Status | Proposed_By | PM_Assigned |
|------|------|-------------------|--------|--------------|--------------|
| F90 | P90 | Local queueing means a dead zone does not stop the scanning workflow; every event syncs once back in range | PROPOSED | LLM (batch 2026-01-10) | PM02 |
| F91 | P03 | Per-shift, per-device error-rate visibility lets a supervisor spot and correct mis-scan patterns instead of discovering them later | PROPOSED | LLM (batch 2026-01-10) | PM02 |

## Proposed Mappings (map_pain_vertical.md)

| V_ID | P_ID | Relevance | SME Note | Status |
|------|------|-----------|----------|--------|
| V01 | P90 | M | Large distribution centers report dead zones near racking and in cold-storage corners | PROPOSED |

## Proposed Sources (sources.md)

| S_ID | Type | Title | URL/Path | Feeds | Status |
|------|------|-------|----------|-------|--------|
| S90 | Internal Note | Aster Scan Suite — Field Notes on Connectivity and Analytics | _context_sources/aster_scan_analytics_notes.md | Offline queueing, scan analytics, network pain point | PROPOSED |
