# Method: company documents → searchable knowledge base with context

**Layer 3 — reference material. Stable between runs. Portable: copy this file as
context, or hand it to another team as-is.**

---

## 1. The idea, in one paragraph

A large number of company documents (status-report emails, case studies, update
notes — `.msg` / `.docx` / `.pptx`) is turned into one collection that can be
searched with an understanding of context. Every document produces **two
representations of the same content**: a readable per-document Markdown page (for a
person, or a model that needs surrounding context) and a flat index where **one row
= one single activity**. A question against the base runs in two steps: a
deterministic filter narrows thousands of rows to the few dozen that match, and only
then does a model read those hits for meaning and write an answer with citations.
This is retrieval with context, without a vector database: retrieval is
**structural** — by fields such as category, date, client — so it is cheap,
explainable, and portable.

## 2. The rules that hold the method together

1. **The boundary: determinism vs. understanding.** Extracting text from binary
   files, and building the index, is a **script's** job — deterministic. Understanding
   fields and content (who the client is, who is responsible, what counts as one
   activity) is the **model's** job. The two roles are never mixed.
2. **Anti-regex.** Document content is never sliced by regular expression or bespoke
   parsing code. Structure varies (tables of different lengths, multi-line cells);
   pattern matching breaks on this. The binary→text conversion is a ready-made
   script; the meaning of the content is read by a model, the way a person would.
3. **Two representations.** Markdown to read, a flat index to search. One source, two
   shapes.
4. **Index format: JSONL.** Text-based, versionable, readable directly. The base
   stays a collection of files, with no server.
5. **Enrichment per entity, not per row.** Attributes that are not stated directly in
   the text (a client's category, for instance) are decided once per unique entity
   (client, product) in a dictionary, and rows inherit them by name lookup.
   Consistent and cheap.
6. **A shared schema is a federation.** If several teams keep the same row schema and
   the same controlled vocabulary, one question can run against the sum of their
   bases. Schema discipline is the asset here, not code.

## 3. The pipeline — six layers

| Layer | Does | Who |
|---|---|---|
| A. Input | source files (`.msg` / `.docx` / `.pptx`) | — |
| B. Convert | binary → clean text, no regex | script |
| C. Extract | text → per-document entries, fixed contract | model |
| D. Enrich | entity dictionary: entity → attributes (category, etc.) | model + script |
| E. Index | all entries + dictionary → one `activities.jsonl` (row = entry) | script |
| F. Query | question → filter the index → model reads the hits → answer with citations | model + script |

Running layer C at scale: process the first "golden" document with a stronger model
(it catches edge cases), the rest can run on a cheaper one. State is files on disk
(a document's Markdown exists = done), which gives resumability for free. Every step
ends at a gate: on error, the run stops rather than improvising.

## 4. Row schema (contract) — summary

One row = one activity. Every source type is reduced to the same shape by different
extraction contracts. Full field list with types and rules:
`_context/10_row_schema.md`.

| Field | Holds | From |
|---|---|---|
| `entry_id` | stable identifier (document key + section code + number) | script |
| `source_file` | source document | script |
| `source_type` | `msg` / `docx` / `pptx` | script |
| `report_date` | document date | model |
| `section` | kind of entry (e.g. `finance` / `business_unit` / `product` / `event` / `case_study`) | model |
| `object_name` | subject of the entry: unit code / product name / event name | model |
| `pic` | responsible people (list) | model |
| `client` | client, if any | model |
| `category` | controlled-vocabulary category | enrichment |
| `category_conf` | source + confidence of the assignment | enrichment |
| `activity` | full description, copied 1:1 | model |
| `raw_ref` | pointer into the Markdown (full context) | script |

## 5. Controlled vocabulary — general rule

A dimension that is not stated directly in the text must be assigned from a **fixed,
closed list**, or a filter like "show everything in category X" silently drifts (the
same entity classified as "Automotive" once and "Transportation" another time). Your
own list belongs in `_context/20_taxonomy.md` — this method file deliberately does
not ship one, because the taxonomy is the one part of this method that is entirely
yours.

Rules that hold regardless of what your list contains: one primary category per
entity; the dimension is *the entity's own industry/domain*, not how the entity used
whatever you sold it; when uncertain, the closed list must contain an explicit
"undecided" value — never a name invented on the spot.

## 6. Prompts

The four prompts below are the actual, runnable instructions used by each model
step. They live as their own files so that changing model behaviour is a Markdown
edit, never a script edit:

- `_prompts/C_extraction.md` — layer C, one document → entries
- `_prompts/D_enrichment.md` — layer D, unique entities → category
- `_prompts/F_query.md` — layer F, question → answer with citations
- `_prompts/G_value.md` — an extension of F for "which of these was biggest",
  used by the `value_ranking` flow

## 7. Federation (multiple bases)

Each team builds its own base with this same method: the same row schema (§4) and
the same controlled vocabulary shape (§5, values of your own choosing). A
cross-base question is the §4 filter run against the sum of several `activities.jsonl`
files. The only hard requirement is a shared schema and a shared vocabulary
discipline — not shared code, not a shared server. That is why the schema and the
vocabulary are canons to be guarded from day one, not conveniences to reconcile
after the fact.
