# Category taxonomy — controlled list (canon)

**Layer 3 — reference material. Stable between runs.**

---

## Status: replace this before your first real run

This file ships **empty of real values on purpose**. The taxonomy is the one part of
this method that has to be yours: it should match how your own organization already
segments clients or work (industry, product line, region, whatever dimension you
actually filter reports by), not a list inherited from somewhere else. A borrowed
taxonomy that doesn't match how your team already talks about its work will collect
`TBD` forever.

**Consumers — every one of these reads this file; none holds its own copy:**

| Consumer | Uses it for |
|---|---|
| `_flows/index_kb/stages/01_enrich` | assigning `category` + `subcategory` to entities |
| `_flows/index_kb/stages/02_index` | **hard validation** — a value outside canon stops the run |
| `_flows/query_kb/stages/00_filter` | allowed filter values |
| `_prompts/D_enrichment.md` | the model's instructions |

Adding a consumer means adding it to this table. A consumer that keeps its own copy
of the list is a bug waiting to happen — two lists drift, and a filter starts
silently missing rows.

## Rules of assignment

1. **`category` (level 1) is required and singular.** One entity, one primary
   category — not a list.
2. **`subcategory` (level 2) is optional and singular**, and must belong to the
   details listed under the `category` you chose — never a different category's
   detail. This is validated in hard at indexing time.
3. **The dimension is the entity's own industry/domain, not how they used what you
   sold them.** A chemicals manufacturer rolling out warehouse handhelds is
   Manufacturing, not Logistics & Transportation.
4. **When uncertain — `TBD`.** Forcing a guess corrupts the filter permanently; `TBD`
   is visible and correctable. Do not invent a new category name to avoid writing
   `TBD`.
5. **Assign once per entity** (client or product) in the entity dictionary
   (`_kb/_registry/clients.md`), never separately per row.

## Suggested shape (replace the example below with your own list)

A two-level shape — a small number of top-level categories, each with a handful of
named details — tends to hold up well: broad enough to filter by, granular enough
that "show me everything in category X" still means something. A flat, one-level
list is a perfectly reasonable simplification if your reports don't need the second
level; if you use one, remove `subcategory` from the row schema rather than leaving
a field nobody fills.

```
### 1. <Category name>
- <Detail>
- <Detail>

### 2. <Category name>
- <Detail>
- <Detail>
```

Two special values, regardless of what the rest of your list contains:

| Value | When | Where |
|---|---|---|
| `TBD` | cannot be resolved from the text or from outside knowledge | `category` |
| `—` | the entry has no external client (internal work, own tooling) | `client`, and then `category` is also `—` |

See `_demo/_context/20_taxonomy.md` for a filled-in, fully worked (and entirely
fictional) example of this shape — four categories, three or four details each,
built for the demo's invented clients.

---

**Consumed by:** `_flows/index_kb/`, `_flows/query_kb/`, `_prompts/D_enrichment.md`.
Changing this list is a decision, not an edit made in passing — record it somewhere
your team will find later (a changelog section at the bottom of this file is enough).
