# PROMPT — Create Reference Tables (first population)

> Use this after bootstrapping, when the tables are empty and you want to
> seed them from source material — the "first population" pass. For
> incrementally growing already-populated tables, use `update_tables.md`
> instead.
>
> Supply: this prompt + the empty (header-only) tables + `sources.md` + the
> actual source materials (product docs, case studies, datasheets) + the name
> of the target vertical.

---

## ROLE

You perform the **first population** of the reference tables from supplied
source materials, for a single target vertical. You are an extractor and
proposer; a human verifies and merges. Because the tables start empty, you
seed all of them in one coordinated pass and assign IDs from `01`.

## INPUTS (supplied as context)

- The empty (header-only) tables.
- `sources.md` (registry) + the actual source materials.
- Target vertical name (e.g. "Warehousing & Logistics").

## PROCEDURE

**Step 1 — Vertical.** Add one `verticals` row for the target (`V01` if
first), `Status = PROPOSED`.

**Step 2 — Sources.** For each source material used, ensure a `sources` row
exists (`S01`, `S02`, ...) with `Type`, `Title`, `URL/Path`, `Feeds`,
`Status`.

**Step 3 — Pains.** Extract distinct pains from the sources. Assign `P01…`,
set a `Cluster` per pain (group by theme), cite a `Source` (`S_ID`),
`Status = PROPOSED`.

**Step 4 — Pain <-> Vertical.** For each pain, add a `map_pain_vertical` row
linking it to the vertical, with a `Relevance` (H/M/L) you judge from the
sources and a one-line `SME Note` placeholder for the human to refine.

**Step 5 — Features.** Extract product capabilities as features. Put each
into the catalogue file matching its product/module (create a new file under
`_data/features/` named after the product if none exists yet — copy
`_data/features/_example_module.md`'s header). Use a SINGLE global `F_ID`
sequence across all catalogue files. Each row: `Product`, `Description`,
`Source`, `Status = PROPOSED`.

**Step 6 — Feature <-> Pain.** Link features to the pains they address in
`map_feature_pain`, one-sentence `How it addresses`, `Status = PROPOSED`.

**Step 7 — Hardware (if applicable).** Populate `hardware_attributes` with
attributes relevant to the vertical's pains. Unless the source is a
confirmed spec sheet, set `Value/Spec = TBC` and `Status = TBC`. Link to
pains in `map_hw_pain` ("subject to confirmed spec"). Skip this step
entirely for a pure-software offering.

## OUTPUT CONTRACT

For each table, a fenced block titled `### -> <filename>` with ONLY the data
rows (no header — it already exists), in exact column order. Then:
- **Coverage note** — which pains have no feature and no hardware answer
  (gaps to fill).
- **Sources used** — list of `S_ID`s and what each fed.

## RULES

- Everything you create is `PROPOSED` (hardware values `TBC`). You NEVER set
  `VERIFIED`.
- Every pain/feature/hardware row cites a source. No source, no row.
- Keep IDs sequential and unique. Features share one global sequence.
- Table content in EN. No invented specs. No marketing fluff.
- Do not produce slides here — this prompt only seeds the tables. End with a
  state log line to paste into `vertical_offering_state.md`.
