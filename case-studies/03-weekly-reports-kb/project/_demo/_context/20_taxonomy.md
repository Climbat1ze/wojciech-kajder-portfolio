# Category taxonomy — controlled list (canon)

**Layer 3 — reference material. Stable between runs.**

**This is the demo's own filled-in taxonomy** — invented for the fictional
"Lighthouse Program" team, structured the way `workspace-template/_context/20_taxonomy.md`
describes. Copy the *shape*, not these values, into your own workspace.

---

## Consumers — every one of these reads this file; none holds its own copy

| Consumer | Uses it for |
|---|---|
| `_flows/index_kb/stages/01_enrich` | assigning `category` + `subcategory` to entities |
| `_flows/index_kb/stages/02_index` | hard validation — a value outside canon stops the run |
| `_flows/query_kb/stages/00_filter` | allowed filter values |
| `_prompts/D_enrichment.md` | the model's instructions |

## Rules of assignment

Same rules as the template — see `workspace-template/_context/20_taxonomy.md` for
the full explanation. Summary: one `category` per entity, `subcategory` optional
and must belong to its own `category`, `TBD` when undecided, assign once per
entity in `_kb/_registry/clients.md`.

## Taxonomy — 4 categories, 11 details

### 1. Logistics & Transportation
- Freight & Trucking
- Transit & Rail
- Warehousing & Fulfillment

### 2. Retail & Consumer
- Grocery & Supermarket
- Specialty Retail
- E-Commerce Fulfillment

### 3. Manufacturing
- Discrete Manufacturing
- Process Manufacturing

### 4. Public Sector
- Transit Authority
- Municipal Services
- Public Safety

## Special values

| Value | When | Where |
|---|---|---|
| `TBD` | cannot be resolved from the text or from outside knowledge | `category` |
| `—` | the entry has no external client (internal work, own tooling) | `client`, then `category` too |

In this demo, **Fenwick & Cole** (mentioned once, in `2025-W06-BU-02`) is `TBD`:
the text gives no industry signal and the name itself doesn't disambiguate one —
see `_kb/_registry/pending_review.md`.

---

**Consumed by:** `_flows/index_kb/`, `_flows/query_kb/`, `_prompts/D_enrichment.md`.
