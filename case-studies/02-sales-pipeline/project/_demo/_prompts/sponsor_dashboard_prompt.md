# Sales Pipeline — Sponsor Dashboard Prompt

## Purpose

A variant of the pipeline report aimed at sponsors/executives rather than the sales team itself.
The key difference from the operational report (`pipeline_report_prompt.md`) is the unit of
analysis: business unit and industry, not individual owner.

| Aspect | Operational Report | Sponsor Dashboard |
|---|---|---|
| Perspective | Per-owner (who is working what) | Per-business-unit / per-industry |
| Audience | Sales team, team lead | Sponsor / executive |
| Detail level | Full rankings, every owner shown even at zero | Aggregated tiles + drill-down sections |
| Focus | Operational activity | Strategic pipeline health and concentration |

**Do not show individual owner names or per-person activity counts in this variant.** Owner-level
normalization still happens (so opportunities aggregate correctly), but owner identity should
never surface in the sponsor-facing output.

---

## Aggregations to compute (from `processed_data.json`, not by asking the model to guess)

1. **KPI summary**: total opportunities, total units, won count, won rate (won / non-hold
   opportunities), on-hold count, average units per opportunity.
2. **Pipeline by industry**: for each normalized industry — opportunity count, unit total, won
   count, won rate, average units per opportunity, top 3 business units, top 3 product lines.
3. **Pipeline by business unit**: for each business unit — opportunity count, unit total, won
   count, won rate, top 3 industries.
4. **Top opportunities by scale**: the largest N opportunities by unit count, with business unit,
   industry, stage and product line(s) — no owner name.
5. **Industry × business unit concentration**: a simple matrix of opportunity counts, to surface
   where the pipeline is concentrated and where there are gaps (an industry and a business unit
   that both otherwise have meaningful volume, but zero overlap between them).
6. **Pipeline maturity index** (optional, illustrative formula — replace the weights with ones
   that reflect your own stage definitions):

   ```
   Maturity = (2 x Won + 1.5 x Decision + 1 x Pilot + 0.5 x Engagement + 0.2 x Awareness) / Total Opportunities
   ```

   State the formula and its weights next to any table that uses it — a score without visible
   weights can't be checked or trusted by the reader.

## Structure

1. KPI tiles (always visible, no drill-down needed)
2. Pipeline-by-industry table, expandable for detail
3. Pipeline-by-business-unit table, expandable for detail
4. Concentration matrix + flagged gaps
5. Top opportunities by scale
6. Maturity index, with its formula stated directly beneath the table

## Design notes carried over from the operational report

- Self-contained HTML: no external CDN dependencies, everything inline, so the file can be
  emailed or dropped anywhere and still render correctly.
- Week-over-week delta on every KPI tile, using the same embedded-JSON approach as the
  operational report (`<script id="report-data">` or an equivalent tag of your choosing).
- State the direction that counts as "good" for every metric where it isn't obvious — an
  increase in "On Hold," for instance, is a decline, not an improvement, and the report should
  color it accordingly.
