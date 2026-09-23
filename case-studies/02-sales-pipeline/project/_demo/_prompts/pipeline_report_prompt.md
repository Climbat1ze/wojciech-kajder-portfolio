# Sales Pipeline — Narrative Report Prompt

## Purpose

The pipeline's code (Stages 0–3) produces exact numbers deterministically: counts, sums, stage
distributions, week-over-week deltas. What code does not do well is turn those numbers into a
narrative an executive can read in thirty seconds. This prompt is for that step: hand an LLM the
Stage 2 output (`processed_data.json`) and this prompt, and have it draft the narrative sections
around the numbers the code already computed — never have it invent or recompute the numbers
themselves.

---

## Inputs to provide to the model

| Input | Location |
|---|---|
| Normalized data | `stages/02_process/output/processed_data.json` |
| Validation report | `stages/02_process/output/validation_report.md` |
| Previous report's embedded data (if available) | `<script id="report-data">` block in the most recent file under `_output/_final/` |

## Instructions for the model

1. **Do not recompute totals.** Every number in your narrative must come from
   `processed_data.json` or from the previous report's embedded JSON. If a number you want to
   cite isn't in either of those, say so and ask for it rather than estimating it.
2. **Lead with the conclusion, not the data.** For each section, state the takeaway first, then
   the supporting numbers — a reader who only reads the first sentence of each section should
   still understand the state of the pipeline.
3. **Call out what changed, not just what is.** If a previous report's data is available, every
   KPI should be discussed in terms of its move (up, down, flat) since last time, not just its
   current value.
4. **Flag anything the validation report raised.** If `validation_report.md` lists unresolved
   owner-name or industry issues, mention them plainly — don't bury data-quality problems in a
   footnote.
5. **No invented specifics.** Do not invent a customer quote, a reason for a stage change, or a
   date that isn't in the source data. If the "why" behind a number isn't in the data, say the
   data doesn't explain it — do not guess a plausible-sounding reason.
6. **Write for the audience named in the request.** A report for the sales team can name
   individual owners and their opportunity counts. A report meant for sponsors/executives should
   report on business units, industries, and pipeline health only — see
   `sponsor_dashboard_prompt.md` for that variant's specific framing.

## Suggested structure

1. One-paragraph executive summary (total opportunities, total units, week-over-week direction)
2. Pipeline health by stage (where deals are concentrated, and whether that's shifting)
3. Business unit / industry breakdown (where the pipeline is strong, where it's thin)
4. Data-quality notes (anything from `validation_report.md` worth a human's attention)
5. What to watch next week (stages with things stuck longer than the SLA threshold in
   `_config/stageDefinitions.md`)

---

**Do not use this prompt to replace Stages 0–2.** Those stages must run first and their output
must be treated as ground truth; this prompt only turns already-correct numbers into prose.
