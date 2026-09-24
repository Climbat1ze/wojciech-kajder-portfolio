# Stage 01 — Extract

**Layer 2 — stage contract.**

## Does

Converts the source binary to clean text. Decoding itself is not implemented
here — it delegates to the shared primitive `_scripts/extract_source.py`, so
that a fix to decoding happens once, not once per flow that needs it.

## Reads

`00_prepare`'s `output/metadata.json`

## Writes

`output/raw_text.json`: clean text, table rows rendered as `A | B | C`, plus
document metadata (subject/date/sender or title/author) and a table count.

## Gate

Zero characters of text after extraction → stop. There is no point calling a
model on empty input.

## Run

```
python _scripts/extract.py
```
