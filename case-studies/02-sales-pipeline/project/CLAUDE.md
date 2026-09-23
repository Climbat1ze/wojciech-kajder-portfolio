# Sales Pipeline Reference — Workspace Identity

**Layer 0 — answers: where am I?**

---

## What this is

A reference implementation of a method for turning a raw sales-opportunity spreadsheet into
staged pipeline reports and a sponsor-facing dashboard, using a **filesystem-as-orchestration**
approach: numbered stages, each with a written contract, reading and writing plain files, with
all the business-specific normalization rules kept in editable config tables instead of code.

This is **not** tied to any one company's data. It is the method plus a worked example, meant to
be copied into a new environment, pointed at a real spreadsheet, and adapted.

**There is no real company data anywhere in this folder.** Every name, code, number and business
unit you see here is invented for demonstration.

## Structure

```
Sales Pipeline Reference/
├── CLAUDE.md                  ← this file
├── CONTEXT.md                 ← task routing
├── README.md                  ← plain-language overview and quick start
├── workspace-template/        ← the engine: scripts, config (empty), prompts, stage contracts
└── _demo/                     ← the same engine plus a fictional worked example, run end to end
```

## The two copies

| Folder | Contains | Use it to... |
|---|---|---|
| `workspace-template/` | Scripts and stage contracts, with config tables present but **empty** | Start a new, real deployment: copy this folder, fill in your own config and drop in your own spreadsheet |
| `_demo/` | The identical engine, plus a small invented company's data run all the way through | See the whole thing work end to end before touching your own data |

## Method, in one paragraph

A raw spreadsheet of sales opportunities goes through three numbered stages: **convert** (turn
the spreadsheet into structured JSON and a human-readable Markdown table), **process** (apply
config-driven lookup tables to normalize inconsistent spellings of owner names, industries,
business units and product names, and flag anything that doesn't match a known reference list),
and **report** (turn the normalized data into an HTML report and a sponsor dashboard). Every
stage reads a file, writes a file, and has a one-page contract describing exactly what it expects
and what it produces, so a person — or a different AI session — can pick up at any stage without
re-reading the whole history.

## Rules for anyone extending this

- Nothing company-specific belongs in `workspace-template/`. If you find yourself typing a real
  client name, a real employee name, or a real business unit code into a script, comment, or
  config file under `workspace-template/`, stop — that value belongs in the config file of your
  own deployment copy, never in the shared template.
- Config tables (`_config/*.md`) are Markdown tables on purpose: a non-programmer can add a row
  without touching code.
- Every stage is independently re-runnable. If you fix a config table, re-run only the stage that
  reads it — you do not need to redo the whole pipeline.

---

**Method:** filesystem-as-orchestration for staged data pipelines (numbered stages, each with a
written contract; config-driven normalization tables; human review points between stages).
