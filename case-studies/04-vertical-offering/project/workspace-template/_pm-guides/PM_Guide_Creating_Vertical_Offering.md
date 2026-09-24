# PM Guide: Building a Vertical Offering Deck

**Audience:** The lead reviewer, or anyone building a vertical offering
deck.
**Purpose:** Step-by-step walkthrough of Flow B (Report Generation) — from
reference data to a shareable deck.

---

## 1. Quick start summary

### The real command sequence

```bash
cd "{PROJECT_ROOT}/_flows/report-generation"

node run_flow.js --stage 03 --vertical Healthcare --mode internal
#   -> filtered_data.json + draft_deck.md

node run_flow.js --stage 03.2 --target 8      # OPTIONAL -- only if you want
                                                #   a trimmed, shorter version
#   -> output/curation.md, an editable table

node run_flow.js --stage 03.5
#   -> report.html

node run_flow.js --stage 04 --build-id 2026-01-15_Healthcare
#   -> per-reviewer review emails + _state/[Build_ID]_build_feedback.md

#   [human step: send emails, collect sign-off in the feedback file]

node run_flow.js --stage 05 --build-id 2026-01-15_Healthcare
#   -> refuses to publish unless every listed reviewer shows Approved;
#      on success, copies the deck to _outputs/_final/
```

A shorthand exists for running a contiguous range:

```bash
node run_flow.js --stage 03-05 --vertical Healthcare --build-id 2026-01-15_Healthcare
```

Every stage writes real files under its own `stages/<name>/output/` before
the next one runs — `run_flow.js` runs each stage as a **separate process**,
so you can stop after any stage, open and hand-edit its artifact, and resume
from the next one without losing anything.

### Simplified process

```
STEP 1: BUILD THE DECK (Stage 03)
   node run_flow.js --stage 03 --vertical <name> --mode internal

STEP 2: (optional) CURATE SCOPE for a shorter version (Stage 03.2)
   node run_flow.js --stage 03.2, then edit output/curation.md

STEP 3: RENDER HTML (Stage 03.5)
   node run_flow.js --stage 03.5

STEP 4: REVIEW (Stage 04)
   node run_flow.js --stage 04 --build-id <id>
   send generated emails, wait for sign-off (no fixed SLA enforced by the system)

STEP 5: PUBLISH (Stage 05)
   node run_flow.js --stage 05 --build-id <id>
   refuses to run without complete approval
```

---

## 2. Prerequisites & checklist

### Data readiness checklist

```
PAIN POINTS:
  [ ] Pain points defined in _data/pain_points.md
  [ ] At least 2-3 pain points mapped to your vertical
       (_data/map_pain_vertical.md)
  [ ] For a client-mode build: mapping Status = VERIFIED, not PROPOSED

FEATURES:
  [ ] Features added to _data/features/*.md
  [ ] Mapped to those pain points in map_feature_pain.md
  [ ] For client-mode: Status = VERIFIED

ACTIVE BLOCKS:
  [ ] Check _state/vertical_offering_state.md for any block affecting your
       vertical's products
```

**Why "client-mode requires VERIFIED" matters concretely:** if the pain
points and features in scope for a vertical have zero `VERIFIED` rows,
Stage 03 in client mode does not silently produce an empty deck — it
**fails with an explicit error** telling you what's missing. An empty deck
that looks like a real, thin offering is worse than a build that refuses to
run.

### What if pain points or mappings are missing?

This is the same gap Stage 02 (`map-gaps` mode) exists to help close — see
`PM_Guide_Managing_Features_and_Pains.md` §4. If a vertical you want to
build has few or no mapped features, that's a data-completeness problem to
raise with the relevant product owner(s), not something to route around in
the build itself.

### What if Active Blocks are filtering out content?

```
1. Check: _state/vertical_offering_state.md's Active Blocks table -- this
   is the ONLY place blocks are defined.
2. internal mode shows blocked items with a note, for visibility.
3. A trimmed/customer-facing render simply omits them.
4. Coordinate with the lead reviewer if you think a block should be lifted.
```

---

## 3. Step-by-step walkthrough

### Step 1: Stage 03 — render the slide deck

```bash
cd "{PROJECT_ROOT}/_flows/report-generation"
node run_flow.js --stage 03 --vertical Healthcare --mode internal
```

**What it does:**
1. Reads `vertical_offering.config.md` and the `_data/*.md` reference tables.
2. Resolves the vertical's scope: which pain points apply, which features
   map to them, which get excluded by Active Blocks.
3. Writes two artifacts you can inspect before going further:
   - `output/filtered_data.json` — the resolved scope, with a `dataGaps`
     list of anything excluded and why.
   - `output/draft_deck.md` — the deck itself, in slide-Markdown form.

Open `filtered_data.json` first if a build looks thinner than expected — it
tells you exactly what was excluded and why, before you even look at the
deck.

### Step 2 (optional): Stage 03.2 — curate scope

This stage only matters if the full scope is too long for the audience you
have in mind (a common problem once a vertical has many mapped pain
points).

```bash
node run_flow.js --stage 03.2 --target 8
```

This produces `output/curation.md`, an editable table — one row per pain
point in scope, with a machine-suggested `Suggested = Y/N` column (ranked by
relevance and confirmed-feature coverage, spread across clusters so one
topic doesn't dominate) and an `Include` column **you edit by hand**.

```
1. Open output/curation.md
2. Set Include = Y or N per row (leave blank = treated as N, conservative default)
3. Re-run Stage 03.5 -- it picks up your choices automatically
4. Not satisfied with the result? Edit curation.md again and re-run 03.5 --
   your Include choices are never overwritten by a re-run, only new rows
   get a fresh Suggested value
```

If you skip this stage entirely, `curation.md` doesn't exist and Stage 03.5
falls back to the full scope — this step is strictly opt-in.

### Step 3: Stage 03.5 — generate HTML

```bash
node run_flow.js --stage 03.5
```

Produces `output/report.html`, a self-contained report from the same
resolved scope (curated, if Step 2 ran).

### Step 4: Stage 04 — review & verify gate

```bash
node run_flow.js --stage 04 --build-id 2026-01-15_Healthcare
```

Reads `filtered_data.json` to find which reviewers actually have content in
this build (not a fixed roster — only reviewers whose features made it into
scope get contacted), and produces:
- `output/emails/<PM_ID>.html` — one ready-to-send email per relevant
  reviewer.
- `_state/[Build_ID]_build_feedback.md` — the file where you track
  approvals; this is edited by hand as replies come in, not regenerated.

**The stage does not send anything.** Sending the generated emails is a
human action.

### Step 5: Stage 05 — publish

```bash
node run_flow.js --stage 05 --build-id 2026-01-15_Healthcare
```

Checks `_state/[Build_ID]_build_feedback.md`: if every listed reviewer shows
`Approved`, it copies the build's outputs into `_outputs/_final/`, appends a
publication entry to `_state/vertical_offering_state.md`, and writes
`output/publication_report.json`. **If approval is incomplete, it exits with
a non-zero code and prints exactly who is still missing** — this is a real
gate, not a formality.

---

## 4. What the HTML report shows

This reference implementation renders one HTML profile per build, from the
scope already filtered by `mode` in Stage 03:

| `mode` | What the report shows |
|---|---|
| `internal` | Everything — including `PROPOSED` items with badges, plus a Verification Annex and "Removed by Active Blocks" section |
| `client` | Only `VERIFIED` content, already filtered upstream in Stage 03 |

See `_flows/report-generation/stages/03.5_generate_html/CONTEXT.md` for a
note on extending this into genuinely separate documents per audience (a
common next step for a real deployment of this method).

---

## 5. Real example: building Healthcare

### Day 1: build (30-60 minutes of active work)

```
14:00 -- Check prerequisites: data mapped? blocks reviewed?
14:05 -- node run_flow.js --stage 03 --vertical Healthcare --mode internal
14:10 -- Open filtered_data.json: confirm scope looks right
14:15 -- (optional) node run_flow.js --stage 03.2 --target 8, edit curation.md
14:30 -- node run_flow.js --stage 03.5
14:40 -- Open report.html: quick visual QA
14:50 -- node run_flow.js --stage 04 --build-id 2026-01-15_Healthcare
15:00 -- Send generated emails to the relevant reviewers
```

### Day 2-3: review (no fixed SLA)

```
- Reviewers reply to their review emails
- You update _state/2026-01-15_Healthcare_build_feedback.md by hand as
  responses come in: mark each reviewer row Approved or note what needs fixing
- If a fix is needed: edit the relevant _data/*.md row directly, then
  re-run from Stage 03 onward -- this produces a new build, the old one is
  not overwritten
```

### Day N: publish

```
node run_flow.js --stage 05 --build-id 2026-01-15_Healthcare

If it succeeds: files land in _outputs/_final/, a log entry is added.
If it refuses: the output tells you exactly which reviewer(s) haven't
  approved yet -- go back to them, don't try to work around the gate.
```

---

## 6. Review cycle (Stage 04)

### What reviewers check

| Section | Reviewer checks |
|---------|-----------|
| Their product's features | Is the description accurate? Right version? |
| Pain point mappings | Does the feature genuinely solve this pain, or is the mapping a stretch? |
| Sources (internal view only) | Are citations valid and current? |

### Feedback quality

**Useful:**
```
"F09's description says 'available in all versions.' Should say
'v3+ only' -- this affects what we can promise customers."
```

**Not actionable enough:**
```
"This doesn't look right."
```

---

## 7. Publishing (Stage 05)

### The gate, precisely

Stage 05 reads `_state/[Build_ID]_build_feedback.md` and compares its list
of reviewers against those listed as having contributed content in
`filtered_data.json`. It succeeds only if every one of those reviewers
shows `Approved`. There is no override flag in the tool itself.

### Delivery checklist

```
[ ] Build published to _outputs/_final/ (Stage 05 succeeded)
[ ] All reviewers shown in build_feedback.md signed off
[ ] Publication logged in _state/vertical_offering_state.md
[ ] Shared with the relevant sales/account teams
```

---

## 8. FAQ & troubleshooting

**Q1: How long from build to publish?**

A: Stages 03 through 03.5 are mechanical — minutes. Stage 04's generation
is mechanical too, but the actual review has no enforced deadline.

---

**Q2: What if reviewer feedback conflicts?**

A: The system doesn't resolve this — it's a human conversation. The lead
reviewer is the natural tie-breaker.

---

**Q3: What if I need to update a published deck later?**

A: Build again with a new `--build-id`. Nothing is overwritten — the old
build's files stay in `_outputs/_final/` under their own name.

---

### Troubleshooting

**Issue: Stage 03 fails with "no VERIFIED rows in scope"**

This is the client-mode gate working as intended, not a bug. Check:
```
1. grep for the vertical's V_ID in _data/map_pain_vertical.md -- any
   Status = VERIFIED rows?
2. Are the mapped features' own Status = VERIFIED in features/*.md?
3. If everything is still PROPOSED: this vertical needs review
   (Stage 02.5/02.6) before a client-mode build is possible -- build in
   --mode internal in the meantime, which shows everything.
```

**Issue: Fewer features in the build than expected**

```
1. Check output/filtered_data.json's dataGaps and removedByBlocks --
   named exactly what was excluded and which rule excluded it.
2. If a mapping is simply missing: that's Stage 02 map-gaps territory.
3. If an Active Block is excluding it: confirm with the lead reviewer
   whether the block should still apply.
```

**Issue: Stage 05 refuses to publish**

```
This means _state/[Build_ID]_build_feedback.md doesn't show every relevant
reviewer as Approved. The refusal message names who's missing.
```

---

## Key contacts

- **Lead reviewer (final review, gate decisions):** whoever your project names for this role.
- **Product/content questions:** the relevant product owner — check `_data/pm_owners.md`.
- **Mechanism/technical questions:** whoever maintains `_flows/` for the project.
