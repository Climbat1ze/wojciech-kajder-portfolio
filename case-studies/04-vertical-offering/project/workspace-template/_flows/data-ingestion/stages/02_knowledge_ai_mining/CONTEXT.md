# Stage 02 — Knowledge AI Mining

**Layer 2 — Stage contract.**

---

## What this stage is

The AI-assisted path into the same tables Stage 01 edits by hand. It runs in
**two passes**, with a human LLM step in between — this is the only place in
either flow where an LLM's output can affect shared data, and it is treated
accordingly: nothing an LLM writes is trusted at face value, every proposed
ID is discarded and reassigned, and every row lands at `Status = PROPOSED`,
never `VERIFIED`.

Two modes:

| Mode | What it does | Requires |
|---|---|---|
| `extract` (default) | Reads a new source document, proposes new features, pain points, mappings and sources | `--file`, `--product` |
| `map-gaps` | Links features that already exist to pain points that already exist — no new document | `--product` |

## Process

```
prepare (default)              [human: LLM]              --ingest
─────────────────              ───────────                ─────────
Compose a prompt from    ->    Paste output/mining_prompt.md
_prompts/analyze_source.md      into an LLM, save its reply
or _prompts/map_gaps.md,        to output/mining_response.md
embedding the current
inventory (so the LLM
doesn't propose a
duplicate)
                                                       ->  Parse the reply,
                                                           reassign every ID,
                                                           write Status=PROPOSED
                                                           rows to _data/*.md,
                                                           queue them in
                                                           _state/verification_queue.md
```

```bash
node run.js --file path/to/document.md --product example_module --pm PM01   # prepare, extract mode
node run.js --mode map-gaps --product example_module                        # prepare, map-gaps mode
node run.js --ingest                                                        # ingest pass, either mode
```

## Inputs

| Input | Used by |
|---|---|
| `--file <path>` | extract mode: the source document to mine |
| `--product <name>` | both modes: which `_data/features/<name>.md` catalogue this batch targets |
| `--pm <PM_ID>` | optional: reviewer to route content to when its product has no assigned owner yet |
| `_prompts/analyze_source.md` / `_prompts/map_gaps.md` | the instructions embedded in the prompt |
| `_data/*.md` (current inventory) | embedded in the prompt, so proposals avoid duplicates |
| `output/mining_request.json` (ingest pass) | which mode/product/pm this batch is for |
| `output/mining_response.md` (ingest pass) | the human-saved LLM reply |

## Outputs

| Output | When |
|---|---|
| `output/mining_prompt.md` | prepare pass |
| `output/mining_request.json` | prepare pass |
| `output/rejected.json` | ingest pass, if any proposed row failed validation |
| `output/unmappable.json` | ingest pass, map-gaps mode, if any feature had no genuine match |
| `_data/features/<product>.md`, `_data/pain_points.md`, `_data/sources.md`, `_data/map_feature_pain.md`, `_data/map_pain_vertical.md` | ingest pass — new rows only, `Status = PROPOSED` |
| `_state/verification_queue.md` (Active Queue) | ingest pass — one entry per new row, addressed to the resolved reviewer |
| `output/mining_report.json` | both passes — stage envelope |

## Rules this stage enforces

1. **No LLM-written ID survives ingest.** A model's guessed `F_ID`/`P_ID`/`S_ID`
   is discarded; the real ID is `max(existing) + 1`, computed fresh at ingest
   time by scanning every catalogue file (features share one global sequence
   — see `_data/README.md`).
2. **No LLM-written `PM_Assigned` survives ingest.** The reviewer is always
   recomputed from `_data/pm_owners.md` via `owners.js`. A product not in the
   coverage map, or listed with no owner, routes to `PENDING`, never to a
   guessed person.
3. **Nothing here writes `Status = VERIFIED`.** Every row this stage creates
   is `PROPOSED`; only Stage 02.6 (a human's accept decision) can move it to
   `VERIFIED`.
4. **`map-gaps` mode never invents a pain point.** A feature that answers no
   existing pain point goes to the Unmappable list, not into a forced mapping
   — see `_prompts/map_gaps.md` for why silence is an acceptable outcome here.
5. **Every claim needs a citation.** A proposed feature or pain point with no
   `Source` is rejected at ingest, not written with a blank citation.

## A note on scope

This reference implementation covers `extract` and `map-gaps`. The prompt
library also documents a third mode, `enrich` (`_prompts/enrich_features.md`),
for building a fuller, quote-verified description registry per feature. It is
included as method documentation — a pattern worth knowing — but this
`run.js` does not implement it; there is no `--mode enrich` here. Treat it as
an extension point if your project needs it.
