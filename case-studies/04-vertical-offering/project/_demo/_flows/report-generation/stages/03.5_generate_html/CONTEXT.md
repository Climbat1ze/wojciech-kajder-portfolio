# Stage 03.5 — Generate HTML (optional)

**Layer 2 — Stage contract.**

---

## What this stage is

Renders Stage 03's resolved scope into one self-contained HTML report — no
external stylesheet or script dependency, styled from
`references/design_tokens.md`. If Stage 03.2 produced `output/curation.md`,
its `Include` column trims which pain points are rendered; otherwise the
full scope from Stage 03 is used.

```bash
node run.js
```

## Inputs

| Input | Purpose |
|---|---|
| `../03_render_slidedeck/output/filtered_data.json` | resolved scope |
| `../03_render_slidedeck/output/render_report.json` | must be status `ok` |
| `../03.2_curate_scope/output/curation.md`, if present | which pain points to include |
| `references/design_tokens.md` | the inlined stylesheet |

## Outputs

| Output | Path |
|---|---|
| Self-contained HTML report | `output/report.html` |
| Stage envelope | `output/html_report.json` |

## Scope of this reference implementation

The methodology this project models can support **multiple rendered
profiles** from the same resolved scope — for example, a full internal
review copy (all statuses, all sources visible) alongside a shorter,
customer-facing copy (verified content only, no internal identifiers). This
reference implementation renders **one** profile, controlled by the same
`mode` used in Stage 03 (`internal` shows badges and sources; `client` was
already filtered to `VERIFIED`-only content upstream, in Stage 03). Splitting
that into genuinely separate documents with different structure and chrome
is a real, valuable extension — see the root `README.md`'s "Extending this
reference" section — but it is not implemented here.
