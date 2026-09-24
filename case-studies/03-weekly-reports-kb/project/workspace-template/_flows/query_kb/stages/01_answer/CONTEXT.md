# Stage 01 — Answer

**Layer 2 — stage contract.**

## Does

Reads only the rows `00_filter` selected, and writes an answer where every claim
is cited to an `entry_id`. This stage has no script — it is entirely the model
step, governed by `_prompts/F_query.md`.

## Reads

- `00_filter`'s `output/hits.json`
- `_context/10_row_schema.md`
- `_context/20_taxonomy.md`
- `_kb/md/<doc_key>.md`, only via a hit's `raw_ref`, only when surrounding context
  is genuinely needed for one quote

## Writes

An answer (Markdown, or whatever form your workflow expects — this stage produces
a message, not a pipeline artifact). Save one, if you want a durable record, under
`output/answer_<slug>.md`.

## Hard rule

Never read the whole index "just in case". If the filter under-selected, fix the
filter arguments and re-run stage 00 — don't compensate by widening what the model
reads.
