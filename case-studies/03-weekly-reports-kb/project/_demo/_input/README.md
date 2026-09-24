# `_demo/_input/` — fictional source notes

**Everything under here is invented.** No real company, client, or person appears
anywhere in this folder or in anything built from it.

## Why these are `.md` files, not `.msg`/`.docx`

The real pipeline (`_flows/build_kb`) reads `.msg` and `.docx` files through
`_scripts/extract_source.py`. Generating a realistic binary Outlook message file
or a Word document isn't practical for a text-based reference package, so the
four fictional source notes in
`Reports 2025/Reports 2025 originals/` are given as plain Markdown — the same
content a `.msg`/`.docx` would carry, without the binary wrapper.

**Consequence:** `python _scripts/kb_run.py --scan 2025-W05` will not work against
these files as-is — `00_prepare` looks for `.msg`/`.docx` extensions, and even if
you renamed them, `extract_source.py` would try to open a `.msg`-shaped file with
`extract_msg` and fail on plain text. Only `build_kb` (stages 00–04, the stages
that touch the binary source directly) is affected. Its two products —
`_kb/md/*.md` and the archived `_kb/_runs/*/validated.json` — were therefore
**hand-built to the exact schema** `build_kb` would have produced, following
`_context/10_row_schema.md` field by field, with real SHA-256 hashes computed
over each `activity` string.

Everything downstream of that point **did run for real** against those hand-built
`validated.json` files: `index_kb` (entity collection, category enrichment,
the final `activities.jsonl` upsert and both registries), `query_kb`, `value_ranking`,
and every report under `_outputs/`. See `../CLAUDE.md` → "What was hand-built vs.
what a script produced" for the exact boundary.

**`audit_fidelity.py` will correctly fail here** — run it and it reports 4
documents "SKIPPED — no source file found" and exits with an error, because it
tries to re-derive `activity` text from a real `.msg`/`.docx` file and none
exist. That is the script's gate discipline working as designed (see its own
docstring: "a skipped document is missing evidence, not proof of correctness"),
not a bug in this demo. Against your own real `.msg`/`.docx` files in
`workspace-template/`, it will actually check something.

If you want to see `build_kb` itself run, adopt `workspace-template/` instead,
point it at your own real `.msg`/`.docx` files, and follow its runbook.

## The four documents

| File | Stands in for | Document key |
|---|---|---|
| `W05_Lighthouse_Program_Weekly_Note.md` | a `.msg` weekly note | `2025-W05` |
| `W06_Lighthouse_Program_Weekly_Note.md` | a `.msg` weekly note | `2025-W06` |
| `W07_Lighthouse_Program_Weekly_Note.md` | a `.msg` weekly note | `2025-W07` |
| `2025-02-20_Bracken_Manufacturing_Case_Study.md` | a `.docx` case study | `2025-02-20-bracken-manufacturing-case-study` |

The fictional team is "Lighthouse Program", a client-support group at a fictional
device vendor, "Meridian Systems". Its people, clients, product names, and
figures are all invented for this package.
