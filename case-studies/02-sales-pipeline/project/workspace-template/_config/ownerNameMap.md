# Owner Name Unification Map

**Purpose:** Unify sales-owner / account-owner name variations to canonical forms for consistent
reporting.

**Usage:** Read by `stage_02_process.js` during data normalization.

---

## Mapping Table

| Input Variation | Canonical Name |
|------------------|-----------------|
|                  |                 |

*(Empty in this template — add one row per misspelling or variant you encounter, e.g.
"Jon Smith" → "John Smith".)*

---

## Rules

1. Always apply name normalization before counting team activity.
2. If a name is not in this map, keep the original (it may be an external person).
3. Names that don't match your team roster (see `teamDefinitions.md`) should be flagged for
   review, not silently dropped.

---

**Last Updated:** —
