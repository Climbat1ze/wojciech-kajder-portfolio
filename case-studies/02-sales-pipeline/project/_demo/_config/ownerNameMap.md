# Owner Name Unification Map (demo data)

**Purpose:** Unify sales-owner / account-owner name variations to canonical forms for consistent
reporting.

**Usage:** Read by `stage_02_process.js` during data normalization.

---

## Mapping Table

| Input Variation | Canonical Name |
|------------------|-----------------|
| Jordn Lee | Jordan Lee |
| Sam Okaffor | Sam Okafor |
| Elena Novaak | Elena Novak |

---

## Rules

1. Always apply name normalization before counting team activity.
2. If a name is not in this map, keep the original (it may be an external person).
3. Names that don't match the team roster (see `teamDefinitions.md`) are flagged for review, not
   silently dropped — see `Casey Whitfield` (an external partner referral) and `OPS` (a queue
   label, not a person) in the demo data's validation report.

---

**Last Updated:** 2026-09-01 (demo data)
