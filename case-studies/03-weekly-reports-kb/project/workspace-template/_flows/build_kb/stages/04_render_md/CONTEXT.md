# Stage 04 — Render Markdown

**Layer 2 — stage contract.**

## Does

Produces the second representation of the same content: a readable Markdown
page, one per document, with one anchor per entry. `activity` goes in whole,
unedited — this stage is a wrapper, not an editorial pass. The anchors are what
`raw_ref` (written in stage 03) points at; without them the index would point
into empty space.

## Reads

`03_validate`'s `output/validated.json`

## Writes

`_kb/md/<doc_key>.md`

## Gates

- Anchor count must equal entry count.
- Every `activity` must appear verbatim in the rendered file, and its hash must
  still match `activity_sha256`.

## Run

```
python _scripts/render_md.py
```
