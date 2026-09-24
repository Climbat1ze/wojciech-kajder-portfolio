# Stage 00 — Prepare

**Layer 2 — stage contract.**

## Does

Picks one source document, computes a stable `doc_key` for it, and records its
hash, type, and path. Does not interpret content.

## Reads

`_input/<period>/<period> originals/*.{msg,docx}`

## Writes

`output/metadata.json`:

```json
{
  "stage": "00_prepare",
  "doc_key": "2025-W05",
  "year": 2025,
  "week": 5,
  "source_file": "...",
  "source_path": "...",
  "source_type": "msg",
  "file_size": 0,
  "file_sha256": "..."
}
```

## Gates

- **Two files, one `doc_key` → stop.** Never auto-pick the newer one by modification
  date; that is exactly how silent overwrites happen. A human names the canonical
  file; the other moves out of the input directory.
- **No explicit `--key` or `--file` → stop, don't guess "the latest one".** Guessing
  the most recent file is a silent-substitution risk, not a convenience.

## Run

```
python _scripts/prepare.py --list             # see available keys
python _scripts/prepare.py --key 2025-W05
```

Full contract and rationale: `_context/10_row_schema.md` → "`entry_id` — construction".
