# Industry / Vertical Unification Map (demo data)

**Purpose:** Unify customer industry/vertical labels to canonical categories for consistent
reporting.

**Usage:** Read by `stage_02_process.js` during data normalization.

---

## Mapping Table

| Input | Output (Canonical) |
|-------|---------------------|
| Gov | Government |
| Public Sector | Government |
| Government | Government |
| Health | Healthcare |
| Healthcare | Healthcare |
| Medical | Healthcare |
| Logistics | Logistics |
| Transport | Logistics |
| Shipping | Logistics |
| Retail | Retail |
| Consumer Goods | Retail |
| Finance | Finance |
| Banking | Finance |
| Manufacturing | Manufacturing |
| Industrial | Manufacturing |
| Education | Education |

---

## Default Rule

If an industry/vertical is not in this map, keep the original name unchanged.

---

**Last Updated:** 2026-09-01 (demo data)
