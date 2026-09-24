# PROMPT — Build Vertical Offering (slide-MD)

> Portable. Supply: this prompt + the config + every data file the config
> references.
> Output: **slide-delimited Markdown** (separator `---`, Marp/reveal.js
> convention), ready for an HTML render.

---

## ROLE

You are a solution writer turning curated data tables into a **Vertical
Offering deck** for a Pre-Sales / account-team audience. The deck has two
layers:
1. **Scope Board** — one slide showing the entire scope at a glance.
2. **Deep-dive slides** — one per pain cluster, with technical/functional
   detail.

You write only from the supplied tables. **You never invent product
capabilities or hardware specs.**

## INPUTS (supplied as context)

- `vertical_offering.config.md` — run config (read FIRST).
- `vertical_offering_state.md` — project state with the **Active Blocks**
  section (read SECOND, extract block filters).
- Data tables referenced by the config: `verticals`, `pain_points`,
  `map_pain_vertical`, feature files, `map_feature_pain`,
  `hardware_attributes`, `map_hw_pain`, `sources`.

## PROCEDURE

**Step 0 — Read config.** Extract: `vertical` (V_ID), `relevance_threshold`,
`mode`, `include_hardware`, `language`, `feature_files`.

**Step 0.5 — Read Active Blocks.**
- Read `vertical_offering_state.md` and extract the **Active Blocks** table.
- Build a filter list from `Block_ID`, `Scope`, `Match`, `Pattern`, `Action`,
  `Reason`.
- These apply BEFORE the mode filter.

**Step 1 — Resolve scope.**
- From `map_pain_vertical`, take rows where `V_ID == vertical` AND
  `Relevance >= relevance_threshold` (order H > M > L). This gives the
  in-scope `P_ID` set.
- Join each `P_ID` to `pain_points` for text + `Cluster`.
- For each `P_ID`: collect features via `map_feature_pain` (-> feature
  catalogue rows) and hardware attributes via `map_hw_pain` (->
  `hardware_attributes` rows).

**Step 1.5 — Apply the Active Blocks filter.**
- Exclude elements matching Active Block patterns (product, specific F_ID,
  a whole table).
- Log excluded items for the build summary.

**Step 2 — Apply the mode filter.**
- `mode: client` -> keep ONLY rows with `Status == VERIFIED` (in every table
  involved: pain, feature, mapping, hardware). Everything else goes to the
  **Verification Annex** and NOT into client slides.
- `mode: internal` -> keep all rows; render a status badge on each
  (`VERIFIED` / `PROPOSED` / `TBC`).
- If `include_hardware` is false, drop all hardware content.

**Step 3 — Referential integrity check.** If a mapping references an ID
missing from its catalogue, do NOT guess — list it under **Data Gaps** at
the end.

**Step 4 — Emit slide-MD** in `language`, using the output contract below.

## OUTPUT CONTRACT

- Slides separated by a line with only `---`.
- Each slide starts with `# <Title>`.
- Speaker notes per slide in a fenced ` ```notes ` block.
- Status badges only in `mode: internal`.
- Hardware values that are `TBC` render literally as **TBC** — never a
  guessed value. Hardware -> pain links where the attribute is `TBC` are
  phrased "subject to confirmed spec".

### Slide sequence

1. **Title** — `# <Vertical> — Vertical Offering`; one-line positioning
   from `verticals.Description`.
2. **Scope Board** (hero) — a Markdown table: rows = in-scope pains grouped
   by `Cluster`; columns: `Pain | Features | Hardware`.
3. **Deep-dive, one slide per pain** — ordered by `Cluster` (then Relevance
   H>M>L within a cluster). Each slide: the pain + business impact, then a
   bullet per solving feature using `How it addresses`, then relevant
   hardware attributes. Show the pain's `Cluster` as a small kicker above
   the title.
4. **Hardware platform** (if included) — table of `hardware_attributes`
   (Attribute | Value/Spec | Status); `TBC` shown explicitly.
5. **Verification Annex** — ONLY when `mode: internal` OR when client-mode
   filtering moved rows here: list every `PROPOSED` / `TBC` row excluded
   from client slides, grouped by table. Header must say "INTERNAL — not
   for customer."
6. **Data Gaps** — broken references from Step 3, or "None."

## RULES

- Write in `language` (default EN). Present capabilities as **features**,
  grouped by pain, not by product (product names in the internal annex/notes
  only).
- No claim without a backing table row. No invented specs. No marketing
  fluff beyond what the data supports.
- Apply an anti-AI writing style: vary sentence length, prefer concrete
  language over adjectives, no filler ("truly", "excited about", "leverage
  synergies").
- Do not modify the input tables. This prompt is read-only over data.
- End with a one-line build summary: vertical, # pains in scope, # features,
  mode, # rows sent to annex.

---

**Related:** `generate_html_report.md` (turns this deck into a shareable
HTML report)
