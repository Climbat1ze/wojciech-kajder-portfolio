# Name-variant registry

**Layer 3 — reference material.**

**This file does NOT contain your team roster.** Your roster is defined exactly once,
wherever your organization already keeps it (an HR system export, an org-chart
document, a simple Markdown list you maintain yourself) — call that your **controlling
file** and point `_prompts/C_extraction.md` and `_flows/build_kb/stages/03_validate`
at it. Copying the roster into a second file looks convenient and quietly breaks the
system: from the moment the copy exists, a change to the controlling file is silently
ignored, because extraction and validation keep reading the copy instead.

This registry holds only **what the controlling file does not, and should not,
contain**:

1. **distorted spellings** — forms that show up in real documents but that your
   directory doesn't recognise (typos, maiden names still in circulation, a
   shortened form only one author ever used);
2. **non-person values** — role labels or headings that a careless parser could
   mistake for a name in the `pic` field.

## Consistency rule

Every **canonical name** used in this registry must exist in the controlling file.
If it doesn't, that is a bug in this registry (or a real gap in the controlling file
to raise with whoever owns it) — never patch it by inventing a person here.

## Distorted spelling → canonical name

*(empty — add a row only once extraction actually encounters a variant your roster
doesn't recognise)*

| Variant seen in a document | Canonical name (must exist in the controlling file) | Where seen |
|---|---|---|
| | | |

## Values that are not people

*(empty — add a row only once one actually appears in a `pic` field)*

| Value | What it actually is |
|---|---|
| | |

---

**Rule of thumb:** if you're tempted to paste your whole roster in here "to be safe",
don't — that is exactly the shortcut this file exists to prevent. Point extraction at
your controlling file instead.
