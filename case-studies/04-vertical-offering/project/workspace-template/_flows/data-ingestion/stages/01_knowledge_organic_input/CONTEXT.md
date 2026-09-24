# Stage 01 — Knowledge Organic Input

**Layer 2 — Stage contract.**

---

## What this stage is

The direct path: the person who owns a product already knows a feature exists
and wants it in the catalogue immediately, without waiting on an LLM pass or
anyone else's approval. There is no `run.js` action for the *adding* part —
that is a manual edit to `_data/features/<product>.md` (and, if the feature
answers a pain point, to `_data/map_feature_pain.md`). `run.js --validate` is
the one thing this stage automates: a check that what you just typed is
internally consistent.

## Inputs

- Whatever you already know about your product (a customer conversation, the
  product's own documentation, a roadmap note).
- The existing tables in `_data/`, read only to avoid duplicate `F_ID`s and to
  confirm a cited `Source` actually exists.

## Process (manual)

1. Confirm the feature is not already in `_data/features/*.md` under a
   different wording — there is no mechanical duplicate check for this step,
   it relies on you actually searching.
2. If the source you learned this from is not yet in `_data/sources.md`, add
   it there first.
3. Add a row to your product's file in `_data/features/`, with:
   - `F_ID` — scan **every** file under `_data/features/` for the current
     maximum and use `max + 1`. `F_ID` is one global sequence, not
     per-product (see `_data/README.md`).
   - `Status = VERIFIED` — you are both the source and the verifier, so this
     is the one stage allowed to write `VERIFIED` directly.
4. If the feature answers a pain point, add a row to
   `_data/map_feature_pain.md` with `Status = VERIFIED` and
   `Proposed_By = PM`.
5. Run `node run.js --validate` (see below).
6. Log the change in `_state/vertical_offering_state.md`.

## Process (mechanical: `--validate`)

```bash
node run.js --validate
```

Checks every feature row for:
- a unique `F_ID` (no duplicate across catalogues);
- a non-empty `Source` that resolves to a real row in `_data/sources.md`;
- `Status` is one of `VERIFIED`, `PROPOSED`, `TBC` (nothing else).

Writes `output/validation_report.json` — a stage envelope naming exactly
which row and which rule failed, if any.

## Outputs

| Output | Path |
|---|---|
| Validation report | `output/validation_report.json` |

## Rule

`Status = PROPOSED` is never written by a human directly — that value exists
only via Stage 02 (AI-assisted mining). If you're adding a feature yourself,
you already know it's real, so it goes straight to `VERIFIED`.
