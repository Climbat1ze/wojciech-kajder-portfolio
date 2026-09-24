# `_input/` — source documents

**Kept out of version control.** Source documents often contain client names,
personal names, and figures nobody intended to commit to a shared repository —
add `_input/` to `.gitignore` in your own copy of this workspace.

## Expected layout

```
_input/
└── <period label> <YYYY>/
    └── <period label> <YYYY> originals/
        ├── W01_<anything>.msg
        ├── W02_<anything>.docx
        └── ...
```

`_flows/build_kb/stages/00_prepare` derives a document's **year** from the
containing directory name (never the filename — filenames repeat across years)
and its **week number** from the filename. Match this convention, or adjust
`prepare.py`'s two regular expressions to your own.

## What belongs here

- `.msg` — individual email exports
- `.docx` — Word documents (case studies, longer notes)

Anything else is skipped by `00_prepare`, with a reason printed alongside the
list of what it did pick up (`python _scripts/kb_run.py --list`).

## Naming collisions

If two files in this directory resolve to the same document key (same year, same
week number), `00_prepare` stops rather than guessing which one is canonical. See
`_context/10_row_schema.md` → "`entry_id` — construction" for how to resolve one.
