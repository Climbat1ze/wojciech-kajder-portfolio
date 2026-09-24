# Stage 02 — Read

**Layer 2 — stage contract.**

## Does

Splits the document into entries. Split by design between two actors:

- **The model** reads the line map printed by `_scripts/kb_run.py --scan` and
  decides: where each entry starts/ends, which section it's in, who the client
  is, what the opportunity/deal id is (if any). These are judgment calls.
- **The script** (`_scripts/assemble.py`) then cuts `activity` text directly out
  of the source lines named in the model's decisions — it never retypes or
  paraphrases. This makes fidelity checkable: every `activity` produced this way
  is guaranteed, mechanically, to appear verbatim in the source text.

## Reads

- `01_extract`'s `output/raw_text.json`
- `spec_<doc_key>.json`, written by the model next to this stage's script, shaped as:

```json
{
  "report_date": "YYYY-MM-DD",
  "finance": [[19], [22, 23]],
  "sections": {"business_unit": [30, 41], "product": [45, 58]},
  "event_cols": 4,
  "meta": {"31": ["Trailhead Logistics", "—"]}
}
```

Where `finance` lists `[label_line, value_line, ...]` groups, `sections` gives
inclusive `[start, end]` line ranges per section value (or a list of such ranges,
for a section split by an unrelated nested table), `event_cols` says whether the
`event` section has a leading Date column before PIC, and `meta` maps a table
line number to `[client, bo]` for that row.

## Writes

`output/entries.json`: one object per entry, `activity` guaranteed to be a
substring of the extracted text.

## Gate

Any entry whose `activity` does not appear in the source text → stop. This can
only happen if the spec points at the wrong line — re-check it, don't patch the
output.

## Run

```
python _scripts/assemble.py
```

The full prompt the model follows to produce the spec's *decisions* (as opposed
to this stage's mechanical cutting) is `_prompts/C_extraction.md` — read together
with this contract, since the model working from the printed line map is doing
the same job the prompt describes, just against line numbers instead of raw text.
