# Weekly Reports Knowledge Base — Reference Implementation

**Layer 0 — workspace identity. Answers: where am I?**

---

## What this is

A reference implementation of a method for turning a team's recurring status-report
emails and documents (weekly reports, case studies, update notes) into:

1. a **searchable, citation-backed knowledge base** — one flat, versionable index where
   every row is a single verbatim activity, tagged with who did it, for which client,
   in which category, and when; and
2. **generated reports** on top of that base — a report for one team member, a report
   for one topic/category, or a running index of what each processing run produced.

The method is filesystem-as-orchestration: there is no framework and no server.
Folder numbering encodes execution order, folder nesting encodes the scope of context,
and every step's output is a file a human can open and correct before the next step
runs. This is the **Model Workspace Protocol (MWP)** pattern — a small set of layers
(identity, routing, stage contracts, reference material, per-run output) applied
consistently so that a person or a model always knows where they are and what a given
file is allowed to assume.

**What is shared here is the method, not any organization's data.** Every name, code,
client, category value, and number in this workspace is either a structural
placeholder (`workspace-template/`) or an invented example (`_demo/`). No real
company, team, client, subsidiary, KPI figure, or person appears anywhere in this
package.

## Why a knowledge base instead of a vector database

Retrieval here is **structural**, not semantic: a question is turned into filter
conditions on the index's own fields (category, date range, client, person,
section), a script narrows thousands of rows to the few dozen that match, and only
then does a model read those rows and write an answer with citations. This is cheap,
explainable without a black box, and portable — the whole base is a folder of text
files, so it travels by copying a directory and answers cross-base questions by
concatenating index files. See `workspace-template/_context/00_method.md` for the
full write-up.

## Structure

```
Weekly Reports Knowledge Base Reference/
├── CLAUDE.md              ← this file
├── CONTEXT.md             ← routing: where to go for what
├── README.md              ← quickstart for a new team adopting this
├── workspace-template/    ← THE PRODUCT — engine only, zero real data, ready to copy
│   └── CLAUDE.md          ← identity of the product itself; read this next
└── _demo/                 ← the same engine + a small fictional example, run end to end
    └── CLAUDE.md
```

## How to use this package

- **Adopting the method for your own team:** copy `workspace-template/` to wherever
  your team keeps its work, then follow `workspace-template/CONTEXT.md`.
- **Understanding how it behaves before committing to it:** read `_demo/`. It is the
  same engine as `workspace-template/`, seeded with a fictional team ("Lighthouse
  Program") and a handful of invented reports, already run through every stage —
  so you can see real generated knowledge-base rows, a real generated per-document
  Markdown file, a real filtered query answer, and real generated reports, without
  touching your own data.
- **Adapting the method, not just the data:** the two folders are meant to be
  compared. Everything that changes between them (team roster, category taxonomy,
  client registry, section vocabulary if you need one) is meant to change; the stage
  contracts, the row schema, and the script logic are meant to stay identical.

---

**Method:** Model Workspace Protocol (MWP) — filesystem as orchestration layer.
**Status:** reference / template. Not connected to any production data source.
