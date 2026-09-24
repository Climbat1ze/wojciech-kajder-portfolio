# `_kb/` — the knowledge base

**The product of this workspace. Layer 4, but a persistent one: it grows between
runs instead of being rebuilt from scratch.**

---

## Two representations of the same content

| Path | What it is | For whom |
|---|---|---|
| `md/` | Markdown per document — the full report, readable start to end | a person, or a model that needs the context around a quote |
| `activities.jsonl` | Flat index: **one row = one activity**, 15 fields per `_context/10_row_schema.md` | the filter — narrowing thousands of rows to a few dozen |

One source, two shapes. A question runs in two moves: a script filters
`activities.jsonl` by field, then a model reads only the hits for meaning, and
follows `raw_ref` into `md/` when it needs full surrounding context.

This is retrieval with context, **without a vector database**: retrieval is
structural — by category, date, client, person — so it is cheap, explainable,
and portable. The base stays a folder of text files, with no server.

## Registries

| File | Role |
|---|---|
| `_registry/clients.md` | Entity dictionary: client → category. One decision per client, not per row. |
| `_registry/pending_review.md` | Queue of entities needing a human decision. A queue, not a gate. |

## Rules that hold this base together

1. **`activity` is permanent.** Copied 1:1 from the source, never overwritten
   during enrichment. `activity_sha256` makes this checkable, not just claimed.
2. **Writing is an upsert by `entry_id`**, not an append. Reprocessing a document
   overwrites its own rows instead of duplicating them — which is what makes
   resuming an interrupted run safe.
3. **Enrichment adds exactly three fields** (`category`, `subcategory`,
   `category_conf`) and touches nothing else.
4. **Values outside the controlled lists are an error, not a variant.** Indexing
   validates that `category` is one of the allowed values and that `subcategory`
   belongs to the same category's own details.
5. **State is files on disk.** A document's Markdown existing means it's done.
   There is no separate progress registry that could drift from reality.

## Federation

If another team builds their own `activities.jsonl` on the same schema and the
same taxonomy shape, one question can run against the sum of both files. The
only hard requirement is a shared schema and a shared vocabulary discipline —
not shared code, not a shared server. That is why `_context/10_row_schema.md`
and `_context/20_taxonomy.md` are canons, not suggestions.

---

**Status:** empty until the first `build_kb` run (stage 4) and the first
`index_kb` run (stage 2) populate it.
