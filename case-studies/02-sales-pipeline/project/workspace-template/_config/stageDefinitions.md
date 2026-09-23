# Stage Definitions

**Purpose:** Define the stages for each pipeline sheet in your spreadsheet, and the SLA
thresholds used to flag a deal as at risk of stalling.

**Usage:** Reference for stage validation and reporting.

---

## Sales Pipeline Stages (example shape — replace with your own)

| Stage | Objective |
|-------|-----------|
| Awareness | Help the prospect understand the need and the value |
| Engagement | Enable the prospect to understand technical/commercial details |
| Pilot | Test the solution in a limited environment |
| Decision | Guide toward a final decision |
| Won | Deal closed and being deployed/operationalized |
| On Hold | Temporarily paused |
| Lost | Closed — no conversion |

---

## Delivery / Integration Pipeline Stages (example shape — different schema on purpose)

A delivery or integration pipeline typically has a different stage vocabulary and no unit/deal-
size field. Keep it as a separate sheet with its own schema rather than forcing it into the sales
pipeline's shape.

| Stage | Objective |
|-------|-----------|
| Discovery | Understand environment and requirements |
| Analysis | Deep-dive gap assessment |
| Concept | Design solution approach |
| Build | Build, configure, customize |
| Test | Validate in a staging environment |
| Live | Production deployment complete |
| Maintenance | Ongoing support and updates |
| On Hold | Paused, with a documented reason |

---

## Stage Duration Thresholds

| Duration | Status |
|----------|--------|
| ≤30 days | 🟢 Green (on track) |
| 31–60 days | 🟡 Amber (watch) |
| >60 days | 🔴 Red (at risk) |

Replace the stage names and thresholds above with whatever your own sales process actually uses —
these are illustrative, not prescriptive.

---

**Last Updated:** —
