# PROMPT — Vertical Offering HTML Report Generator

> **Stage:** 03.5 — Generate HTML
> **Input:** Vertical Offering slide-Markdown (any vertical)
> **Output:** A self-contained, interactive HTML report
> **Design reference:** `_flows/report-generation/stages/03.5_generate_html/references/design_tokens.md`

---

## ROLE

You are turning a **Vertical Offering slide-Markdown deck** into a
**self-contained HTML report**, styled from the design tokens referenced
above. **Do not reduce content.** Every pain point, feature and hardware
attribute in the input must be preserved in full.

**Note:** the reference implementation's `run.js` for this stage already
does this mechanically, reading `filtered_data.json` directly (see
`_flows/report-generation/stages/03.5_generate_html/CONTEXT.md`). Use this
prompt when you want an LLM to produce a more elaborate, narrative HTML
report from the rendered Markdown deck instead.

---

## INPUT

```
{PROJECT_ROOT}/_flows/report-generation/stages/03_render_slidedeck/output/draft_deck.md
```

### Structure of the input (Markdown)

1. **Header:** version, generated date, mode, threshold, vertical.
2. **Executive summary:** one-sentence overview.
3. **Pain Point Coverage Map:** a table of pain points, relevance, features,
   cluster.
4. **Detailed pain point solutions:** one block per pain, with description,
   features, hardware specs.
5. **Device/hardware specifications** (if applicable): grouped tables.
6. **Feature summary by product:** one section per product/module.
7. **Verification notes:** data-model status, Active Blocks applied,
   coverage summary, QA checks, next steps.
8. **References & sources.**

---

## OUTPUT

```
{PROJECT_ROOT}/_outputs/_drafts/YYYY-MM-DD_Vertical_Offering_[Vertical]_v[N].html
```

---

## DESIGN SYSTEM

Load the CSS custom properties from
`_flows/report-generation/stages/03.5_generate_html/references/design_tokens.md`
and use them throughout — do not hardcode colors inline. Support light and
dark mode via `prefers-color-scheme` plus a `data-theme` override, exactly as
that file specifies.

---

## STRUCTURE (sections)

### 1. Sticky top bar

A slim header with the report title and a theme toggle
(light/dark, persisted to `localStorage`).

### 2. Report header

Title (`<Vertical> — Vertical Offering`), one-line executive summary,
metadata line (version, generated date, mode, threshold).

### 3. Executive summary

Three stat tiles (total pain points in scope, total features, total
hardware attributes if applicable), a short list of key findings, and an
overall-status chip (e.g. "Draft — Internal Review").

### 4. Table of contents

A numbered list linking to each section below, with a scrollspy
(`IntersectionObserver`) highlighting the current section as the reader
scrolls.

### 5. Pain Point Coverage Map

A table: Pain Point | Relevance | Features | Cluster.

### 6. Detailed pain point solutions

One subsection per pain point, in cluster/relevance order: cluster kicker,
pain title, SME note (if any), description, addressing features (each with
a status badge and one-line "how it addresses"), and any hardware
attributes relevant to that pain.

### 7. Hardware/device specifications (if `include_hardware`)

Grouped tables by category (e.g. Display, Battery, Connectivity —
whatever grouping fits your own hardware attributes).

### 8. Feature summary by product

One list per product/module, each item showing its status badge and a
one-line description.

### 9. Verification notes

- Data model status (mode, threshold, vertical, build date).
- Active Blocks applied, with their reasons.
- Coverage summary (counts).
- QA checks (a checklist of what was validated).
- Next steps for reviewers.

### 10. References & sources

A table of every `S_ID` cited anywhere in the report, with title, type, and
what it fed.

### 11. Footer

Scope summary, owner/team line, generated date and version, a closing note
that PROPOSED items are pending review.

---

## GENERATION RULES (non-negotiable)

1. **Do not reduce content** — every pain point, feature, and hardware
   attribute in the input must appear in the output.
2. **Preserve status badges** — `VERIFIED`, `PROPOSED`, `TBC`.
3. **Preserve source citations** at every feature/hardware item.
4. **Do not invent data** — a `TBC` value stays `TBC`.
5. **Theme toggle with `localStorage` persistence.**
6. **Print-ready** — a working `@media print` stylesheet.
7. **Self-contained HTML** — no external script/style dependency beyond an
   optional web font.
8. **Accessibility** — aria-labels, visible focus states, a skip-to-content
   link.

---

## WORKFLOW

1. Read the full slide-Markdown deck.
2. Parse its sections (executive summary, pain points, features, hardware
   specs, verification notes, sources).
3. Generate the HTML using the structure and design tokens above.
4. Save the file to `_outputs/_drafts/`.
5. Open it in a browser for a visual check.

---

**Prompt Version:** 1.0
**Related:** `build_vertical_offering.md` (produces the slide-Markdown this
prompt consumes)
