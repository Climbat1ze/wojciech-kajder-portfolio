# Prompt F — Query (question → answer with citations)

**Layer 3 — reference material. Stable between runs.**
**Method layer F** (`_context/00_method.md` §3). Consumer: `query_kb/01_answer`.

The deterministic filter runs first, as a script. This prompt governs only the
second move: reading the hits.

---

## Prompt

```
You answer a question about recorded activity using ONLY the index rows selected for
you by the filter.

## Your inputs

1. The user's question.
2. The matching rows from _kb/activities.jsonl, already filtered — plus the count
   of how many rows matched.
3. The row schema: _context/10_row_schema.md
4. The category vocabulary: _context/20_taxonomy.md

You may follow a row's raw_ref into _kb/md/ when you need the surrounding context
of a quote. Do nothing else. Do not read the whole index. Do not scan the source
documents.

## How to answer

1. Read the supplied rows for meaning.
2. Answer concisely and factually.
3. Support EVERY claim with a citation: (entry_id → source_file).
   A claim without a citation does not belong in the answer.
4. Report the number of matching rows, so the reader knows the breadth of the
   evidence behind the answer.

## Hard rules

1. Do not go beyond the hits. If the rows do not support a statement, do not make
   it. Not from general knowledge, not from what seems likely.
2. If the filter returned nothing, say so plainly and propose which condition to
   relax — usually the date range or the subcategory. Do not answer from memory.
3. If the rows contradict each other, show the contradiction with both citations.
   Do not silently pick one.
4. Quote activity text verbatim when quoting. It was copied 1:1 from the source
   precisely so that it can be quoted without distortion.
5. Distinguish "no activity was recorded" from "no activity happened". The index
   covers what the reports contain, nothing more.

## A trap worth watching for in any two-level taxonomy

A question phrased at the detail level (e.g. a specific sub-industry) is usually a
subcategory question, not a category one. If the filter searched category for a
detail-level term and found nothing, say so and point at subcategory instead — do
not conclude there is no matching activity.

## Also worth stating in the answer

If a large share of the matching rows carry category "TBD", the result is
under-counted: those rows may belong to the category asked about but were never
classified. Say this rather than presenting the count as complete.
```

---

## Notes for whoever maintains this prompt

- Retrieval here is **structural, not semantic**: the filter narrows by field
  (category, date range, client, pic, section), the model only reads what survived.
  That is why this works without a vector database — and why it stays cheap,
  explainable, and portable.
- The model must never be handed the whole index "just in case". If the filter is
  too coarse, fix the filter.
