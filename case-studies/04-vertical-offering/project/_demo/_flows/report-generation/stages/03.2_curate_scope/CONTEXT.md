# Stage 03.2 — Curate Scope (optional)

**Layer 2 — Stage contract.**

---

## What this stage is

An optional trim step for when a vertical's full in-scope pain-point list is
too long for a client-facing document. It proposes a ranked shortlist —
spread across clusters so one topic doesn't dominate, ranked by relevance
and by how much of the cluster is already `VERIFIED` — and leaves the actual
decision to a human in an editable file.

```bash
node run.js --target 8
```

## Inputs

| Input | Purpose |
|---|---|
| `../03_render_slidedeck/output/filtered_data.json` | the full in-scope pain list from Stage 03 |
| `--target <N>` (default 8) | how many pain points to suggest including |
| `output/curation.md`, if it already exists | merged into, never overwritten |

## Outputs

| Output | Path |
|---|---|
| Editable shortlist | `output/curation.md` |
| Stage envelope | `output/curation_report.json` |

## Rule

**`Include` is never overwritten by a re-run.** Only `Suggested` is
recomputed each time this stage runs. A brand-new pain point (one that
wasn't in scope on a previous run) gets a fresh `Suggested` value with
`Include` left blank — blank is treated as `N` (not included) by whatever
reads this file downstream, which is the conservative default.

## Skipping this stage entirely

If `output/curation.md` does not exist, Stage 03.5 falls back to the full
scope for every output variant. This stage is strictly opt-in.
