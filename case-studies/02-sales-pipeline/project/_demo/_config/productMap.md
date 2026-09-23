# Product / Solution Line Map (demo data)

**Purpose:** Map product abbreviations and variations to canonical full names.

**Usage:** Read by `stage_02_process.js` during data normalization.

---

## Mapping Table

| Abbreviation / Variation | Canonical Name |
|--------------------------|-----------------|
| PLT | Platform License Tier |
| AN | Analytics Add-on |
| SUP | Premium Support Package |
| MOB | Mobile Companion App |
| INT | Integration Toolkit |
| IOT | IoT Device Manager |

---

## Rules

1. Always expand abbreviations to full names in reports.
2. If a product is not in this map, keep the original name.
3. Multiple products in one spreadsheet cell are split by comma before normalizing each one.

---

**Last Updated:** 2026-09-01 (demo data)
