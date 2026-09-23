# Product / Solution Line Map

**Purpose:** Map product abbreviations and variations to canonical full names.

**Usage:** Read by `stage_02_process.js` during data normalization.

---

## Mapping Table

| Abbreviation / Variation | Canonical Name |
|--------------------------|-----------------|
|                          |                 |

*(Empty in this template — add one row per product code your spreadsheet uses, e.g.
"PLT" → "Platform License Tier".)*

---

## Rules

1. Always expand abbreviations to full names in reports.
2. If a product is not in this map, keep the original name.
3. Multiple products in one spreadsheet cell should be split by comma or semicolon before
   normalizing each one individually.

---

**Last Updated:** —
