# Vertical Offering — Data Model

**Layer 3 — stable reference material.** Every table below lives as a
markdown file under `_data/`, keyed by an ID in its first column. This file
ships empty (header-only); fill it in with your own product's data.

---

## 1. Table overview

### Core entity tables

| Table | File | ID pattern | Status values | Who edits |
|---|---|---|---|---|
| Verticals | `verticals.md` | `V01`, `V02`, ... | `VERIFIED`, `PROPOSED` | Whoever owns the vertical list |
| Pain points | `pain_points.md` | `P01`, `P02`, ... | `VERIFIED`, `PROPOSED` | Same, with product-team input |
| Sources | `sources.md` | `S01`, `S02`, ... | `VERIFIED`, `PROPOSED` | Whoever cites them |
| Hardware attributes | `hardware_attributes.md` | `HW01`, `HW02`, ... | `VERIFIED`, `TBC` | Whoever owns the hardware platform, if any |
| Features | `features/*.md` | `F01`, `F02`, ... (global) | `VERIFIED`, `PROPOSED`, `TBC` | The product owner (PM) |
| PM owners | `pm_owners.md` | `PM01`, `PM02`, ... | `ACTIVE`, `INACTIVE` | Whoever governs PM assignments |

### Mapping tables

| Table | File | Key | Purpose |
|---|---|---|---|
| Pain -> Vertical | `map_pain_vertical.md` | `(V_ID, P_ID)` | Which pains matter for which vertical, and how much |
| Feature -> Pain | `map_feature_pain.md` | `(F_ID, P_ID)` | Which features answer which pains |
| Hardware -> Pain | `map_hw_pain.md` | `(HW_ID, P_ID)` | Which hardware attributes answer which pains |
| Feature -> PM | `feature_owner_map.md` | `(F_ID, PM_ID)` | **Generated** — regenerate with `node _flows/_lib/tools/generate_feature_owner_map.js`; never hand-edit |

### State tables (Layer 4 — working)

| Table | File | Purpose |
|---|---|---|
| Change log + Active Blocks | `_state/vertical_offering_state.md` | Every change to tables/config gets a line; Active Blocks is the one authoritative filter list |
| Verification queue | `_state/verification_queue.md` | AI-proposed entries pending review (Active) / decided (Resolved) |
| PM responses | `_state/pm_responses.md` | Every accept/correct/reject decision, with reasons |
| Build feedback | `_state/[Build_ID]_build_feedback.md` | Per-build reviewer sign-off, gates publishing |

---

## 2. Table schemas

### 2.1 `verticals.md`

```markdown
| V_ID | Vertical | Description | Status | Notes |
|------|----------|-------------|--------|-------|
| V01  | Warehousing & Logistics | Warehouse, fleet and last-mile operations | VERIFIED | |
```

### 2.2 `pain_points.md`

```markdown
| P_ID | Pain Point | Cluster | Description | Source | Status |
|------|------------|---------|-------------|--------|--------|
| P01  | Device operation in extreme temperatures | Environmental | Devices must work reliably from -20C to 50C | S01 | VERIFIED |
```

`Cluster` is a free-text category you define (e.g. `Environmental`,
`Security`, `Operations`, `Battery`, `Network`, `Usability`) — pain points are
grouped by cluster in the rendered deck.

### 2.3 `sources.md`

```markdown
| S_ID | Type | Title | URL/Path | Feeds | Status |
|------|------|-------|----------|-------|--------|
| S01  | Product Doc | Example Device Datasheet | _context_sources/example_datasheet.md | Hardware specs | VERIFIED |
```

### 2.4 `hardware_attributes.md`

```markdown
| HW_ID | Attribute | Value/Spec | Status | Source |
|-------|-----------|------------|--------|--------|
| HW01  | Display | 6.0" display, 800 nits | TBC | S01 |
```

Hardware attributes default to `TBC` (to be confirmed) until an authoritative
spec sheet confirms them. This table is optional — a pure-software offering
can leave it empty and set `include_hardware: false` in the config.

### 2.5 `features/*.md` (one file per product/module)

One catalogue file per product or module you sell. `F_ID` is a **single
global sequence shared across every catalogue file**, not a per-file
counter — before assigning a new one, scan every file under `_data/features/`
for the current maximum and use `max + 1`. This is why a single product's
`F_ID`s are often non-contiguous once a project has been running a while.

```markdown
| F_ID | Feature | Product | Description | Source | Status |
|------|---------|---------|-------------|--------|--------|
| F01  | Example Feature | Example Product | What it does, concretely | S01 | VERIFIED |
```

See `_data/features/README.md` for the convention in more detail, and
`_data/features/_example_module.md` for a header-only starting file.

### 2.6 `pm_owners.md`

```markdown
| PM_ID | PM_Name | Part | Products_Owned | Contact | Status | Last_Updated |
|-------|---------|------|-----------------|---------|--------|--------------|
| PM01  | [Full Name] | [Team/Part] | Example Product | [EMAIL_REQUIRED] | ACTIVE | 2026-01-01 |
```

A second table below the roster, **Product Coverage Map**, is what the code
(`owners.js`) actually reads to resolve a product to a reviewer:

```markdown
## Product Coverage Map

| Product | PM_ID | PM_Name | Status |
|---------|-------|---------|--------|
| Example Product | PM01 | [Full Name] | Assigned |
```

The two tables are meant to stay in sync but are not the same table — the
routing code reads the Product Coverage Map, never the roster.

### 2.7 `feature_owner_map.md`

**Generated, not hand-maintained.** Regenerate with
`node _flows/_lib/tools/generate_feature_owner_map.js`, which derives every
row from `pm_owners.md`'s Product Coverage Map plus each catalogue's
`Product` column.

```markdown
| F_ID | Feature | Product | PM_ID | Verification_Status | Source_File |
|------|---------|---------|-------|---------------------|-------------|
| F01  | Example Feature | Example Product | PM01 | PENDING | example_module.md |
```

`PM_ID` is `PENDING` when the product has no assigned owner yet, or
`UNRESOLVED` when the product is entirely absent from `pm_owners.md`.

### 2.8 `map_pain_vertical.md`

```markdown
| V_ID | P_ID | Relevance | SME Note | Status |
|------|------|-----------|----------|--------|
| V01  | P01  | H | Cold storage and outdoor loading docks | VERIFIED |
```

`Relevance` is `H` (High), `M` (Medium) or `L` (Low) — this is what
`relevance_threshold` in the config filters on.

### 2.9 `map_feature_pain.md`

```markdown
| F_ID | P_ID | How it addresses | Status | Proposed_By | PM_Assigned |
|------|------|-------------------|--------|--------------|--------------|
| F01  | P01  | Explains the concrete mechanism, traceable to the feature's own Description | VERIFIED | PM | PM01 |
```

`Proposed_By` is `PM` for an organic (Stage 01) row, or `LLM (batch
YYYY-MM-DD)` for an AI-proposed one. `PM_Assigned` is the reviewer who must
verify the row before it can become `VERIFIED`.

**Why this stores `F01`/`P01` and not a copy of the feature's or pain
point's text:** an ID is the only thing in this system guaranteed to stay
stable while descriptions get refined; matching by ID is mechanically
checkable (`check_integrity.js`), matching by text similarity is not.

### 2.10 `map_hw_pain.md`

```markdown
| HW_ID | P_ID | How it addresses | Status |
|-------|------|-------------------|--------|
| HW01  | P01  | Explains the mechanism | TBC |
```

---

## 3. ID naming convention

| Entity | Pattern | Example |
|---|---|---|
| Vertical | `V` + 2 digits | `V01` |
| Pain point | `P` + 2 digits | `P01` |
| Source | `S` + 2 digits | `S01` |
| Hardware attribute | `HW` + 2 digits | `HW01` |
| Feature | `F` + 2 digits (global) | `F01` |
| PM owner | `PM` + 2 digits | `PM01` |
| Verification queue entry | `VQ-` + 3 digits | `VQ-001` |
| PM response log entry | `RESP-` + 3 digits | `RESP-001` |
| Active Block | `BLOCK-` + 3 digits | `BLOCK-001` |
| Build ID | `YYYY-MM-DD_Vertical` | `2026-01-15_Healthcare` |

---

## 4. Status values

### Entry status (`pain_points.md`, `features/*.md`, `map_feature_pain.md`, `map_pain_vertical.md`)

| Value | Meaning | Who can set it |
|---|---|---|
| `VERIFIED` | Human-confirmed | A human, via Stage 01 or Stage 02.6 (accepting a proposal) |
| `PROPOSED` | AI-proposed, pending review | Stage 02 only |

**There is no `REJECTED` value written into these files.** A row a reviewer
rejects (Stage 02.6) is left at `PROPOSED` forever — the rejection and its
reason are recorded only in `_state/pm_responses.md`. Treat a long-pending
`PROPOSED` row you can't explain as "check `pm_responses.md`", not as
"probably rejected."

### Hardware attribute status (`hardware_attributes.md`)

| Value | Meaning |
|---|---|
| `VERIFIED` | Spec confirmed from an authoritative source |
| `TBC` | Not yet confirmed |

### PM status (`pm_owners.md`)

| Value | Meaning |
|---|---|
| `ACTIVE` | Currently owns the listed product(s) |
| `INACTIVE` | No longer does |

---

## 5. Referential integrity rules

1. Every mapping table's foreign keys must exist in their parent table:
   `map_pain_vertical.V_ID` -> `verticals.V_ID`, `map_pain_vertical.P_ID` ->
   `pain_points.P_ID`, `map_feature_pain.F_ID` -> `features/*.md`,
   `map_feature_pain.P_ID` -> `pain_points.P_ID`, `map_hw_pain.HW_ID` ->
   `hardware_attributes.HW_ID`, `map_hw_pain.P_ID` -> `pain_points.P_ID`.
2. `F_ID` is global across all `features/*.md` files — before assigning a new
   one, scan every file and use `max + 1`.
3. Every `pain_points.md` and `features/*.md` row must cite at least one
   `Source`.
4. Only a human can move `Status` to `VERIFIED`. An AI-assisted pass can only
   write `PROPOSED` (or `TBC` for hardware).

Run `node _flows/_lib/tools/check_integrity.js` at any time to check all of
the above mechanically.

---

## 6. Versioning

Core tables and mapping tables are append-only: never delete a row, add a
note and a state-log entry instead if something stops being valid. There is
no built-in deprecation status in this reference implementation — see
`_pm-guides/PM_Guide_Managing_Features_and_Pains.md` §6 for how to handle it
today.

---

**Maintainer:** whoever owns this project's data model.
