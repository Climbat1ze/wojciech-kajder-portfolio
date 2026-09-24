# PROMPT — Stage 0: Bootstrap Structure

**Purpose:** Initialize an empty Vertical Offering project with folder
structure and header-only table templates.
**Output:** Empty folder structure + header-only Markdown tables.

---

## ROLE

You are a project initializer. Your task is to:
1. Confirm the folder structure exists (it already does in this reference
   implementation — see the root `CLAUDE.md`'s diagram).
2. Seed the reference tables with **header-only** templates (no data rows)
   if they aren't already present.
3. Confirm `vertical_offering.config.md` and `_state/vertical_offering_state.md`
   exist with a first log entry.

**You do NOT populate tables with real data.** That is `create_reference_tables.md`.

## PROCEDURE

### Step 1: Confirm structure

```
{PROJECT_ROOT}/
├── CLAUDE.md, CONTEXT.md, README.md, vertical_offering.config.md
├── _context_sources/           <- drop source documents here
├── _data/                       <- reference tables (see _data/README.md)
│   └── features/
├── _state/                      <- change log, Active Blocks, queues
├── _prompts/                    <- this prompt library
├── _pm-guides/
├── _flows/
│   ├── _lib/
│   ├── data-ingestion/
│   └── report-generation/
└── _outputs/
    ├── _drafts/
    └── _final/
```

### Step 2: Initialize reference tables (header-only)

For each table under `_data/`, confirm it has the exact header row from
`_data/README.md` and zero data rows:

- `verticals.md` — `V_ID | Vertical | Description | Status | Notes`
- `pain_points.md` — `P_ID | Pain Point | Cluster | Description | Source | Status`
- `sources.md` — `S_ID | Type | Title | URL/Path | Feeds | Status`
- `hardware_attributes.md` — `HW_ID | Attribute | Value/Spec | Status | Source`
- `map_pain_vertical.md` — `V_ID | P_ID | Relevance | SME Note | Status`
- `map_feature_pain.md` — `F_ID | P_ID | How it addresses | Status | Proposed_By | PM_Assigned`
- `map_hw_pain.md` — `HW_ID | P_ID | How it addresses | Status`
- `pm_owners.md` — roster table + Product Coverage Map (see `_data/README.md` §2.6)
- `features/_example_module.md` — `F_ID | Feature | Product | Description | Source | Status`

### Step 3: Confirm config and state files

- `vertical_offering.config.md` exists with all required keys (see the file
  itself for the exact list) — `vertical` may point at a placeholder until
  Step 4 of `create_reference_tables.md` adds a real one.
- `_state/vertical_offering_state.md` exists with the Active Blocks and
  change-log tables (empty is fine).
- `_state/verification_queue.md` and `_state/pm_responses.md` exist,
  header-only.

### Step 4: Confirm output folders

`_outputs/_drafts/` and `_outputs/_final/` exist (empty is fine — they fill
in as builds run).

## OUTPUT FORMAT

```markdown
## Bootstrap check complete

### Present
- _data/ (9 tables + example feature file)
- _state/ (3 files)
- _prompts/ (13 prompts)
- _flows/ (_lib/, data-ingestion/, report-generation/)
- _outputs/ (_drafts/, _final/)

### Missing / needs attention
- <list anything not found, or "None">

### Next step
Populate tables with real data — see create_reference_tables.md.
```

## RULES

1. **All entries this prompt creates are header-only.** No data rows.
2. **No data modification of a table that already has content.** If a table
   under `_data/` already has rows, leave it alone — bootstrap only fills
   gaps, it never resets existing data.
3. **Language:** table headers in EN; comments/notes may be in your own
   working language.

---

**Prompt Version:** 1.0
**Related:** `create_reference_tables.md` (the next step after this one)
