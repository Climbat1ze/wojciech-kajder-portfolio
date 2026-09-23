# Team Definitions (demo data)

**Purpose:** Define team membership for filtering and for "always show every team member, even
with zero deals" reporting.

**Usage:** Read by `stage_02_process.js` and `stage_03_report.js`.

---

## Sales Team

```
Jordan Lee, Priya Sharma, Marcus Webb, Elena Novak, Sam Okafor, Diego Fuentes, Aiko Tanaka
```

**Reporting Rules:**
- Show ALL team members in reports, even with 0 deals.
- Count both "Owner" and "Supported By" roles.

---

## Delivery / Integration Team

```
Wei Chen, Fatima Al-Sayed, Lucas Bianchi, Nadia Kovacs
```

**Reporting Rules:**
- Show ALL team members in reports, even with 0 projects.
- Do not show deal-size or product-line columns for this team's pipeline.

---

## Leaders (excluded from team activity counts)

```
Grace Kim (Sales Lead), Robert Ainsley (Delivery Lead)
```

**Reporting Rules:**
- Leaders are not counted in team activity statistics.
- Leaders may still appear as Owner/Supported By on individual deals.

---

**Last Updated:** 2026-09-01 (demo data)
