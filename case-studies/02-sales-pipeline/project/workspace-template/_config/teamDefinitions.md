# Team Definitions

**Purpose:** Define team membership for filtering and for "always show every team member, even
with zero deals" reporting.

**Usage:** Read by `stage_02_process.js` and `stage_03_report.js`.

**Source:** fill in from your own org chart or CRM team roster.

---

## Sales Team (fill in)

```
(empty in this template — one name per line or comma-separated)
```

**Reporting Rules:**
- Show ALL team members in reports, even with 0 deals.
- Count both "Owner" and "Supported By" roles.

---

## Delivery / Integration Team (fill in)

```
(empty in this template)
```

**Reporting Rules:**
- Show ALL team members in reports, even with 0 projects.
- Do not show deal-size or product-line columns for this team's pipeline — its schema is
  different (see `_config/stageDefinitions.md`).

---

## Leaders (excluded from team activity counts)

```
(empty in this template)
```

**Reporting Rules:**
- Leaders are not counted in team activity statistics.
- Leaders may still appear as Owner/Supported By on individual deals.

---

**Last Updated:** —
