# PM Guide: Integrated Process Overview

**Audience:** Everyone touching this project — product managers, the lead
reviewer, whoever runs the flows.
**Purpose:** The big picture — how Flow A (data) and Flow B (deck) fit
together, who does what, and when.

---

## How to use the three PM guides

| Guide | What it's for |
|-------|----------------|
| **This document** | The end-to-end picture: stage map, timelines, RACI, governance rules, realistic scenarios, troubleshooting that spans both flows |
| [`PM_Guide_Managing_Features_and_Pains.md`](PM_Guide_Managing_Features_and_Pains.md) | Flow A in detail — adding features yourself, verifying AI proposals, the exact commands and reply formats |
| [`PM_Guide_Creating_Vertical_Offering.md`](PM_Guide_Creating_Vertical_Offering.md) | Flow B in detail — building a deck, generating HTML, review, publishing |

---

## 1. Process overview & flow map

Two independent flows, run from `_flows/data-ingestion/` and
`_flows/report-generation/` respectively — real `node run_flow.js`
commands, no other interface exists. Every stage is a separate process that
reads and writes real files; nothing is held in memory between stages, so
you can stop after any one of them, hand-edit its output, and resume.

```
FLOW A — DATA INGESTION                    FLOW B — REPORT GENERATION
(builds the knowledge base)                 (builds a deck from it)
════════════════════════════               ═══════════════════════════

Stage 01                                    Stage 03
Organic Input (manual)                      Render Slide Deck
  PM edits _data/ directly,                   Resolves vertical scope from
  --validate checks the result                _data/*.md -> filtered_data.json
        |                                     + draft_deck.md
        | (independent -- no artifact              |
        |  feeds Stage 02)                          |
        v                                            v (optional)
Stage 02                                    Stage 03.2
AI-Assisted Input                           Curate Scope
  extract / map-gaps modes                    Only for a trimmed, shorter
  prepare -> [human: LLM] -> --ingest          output -- editable curation.md
        |                                     picks which pain points appear
        v                                            |
Stage 02.5                                            v
Verification Export                          Stage 03.5
  One email per reviewer, covering           Generate HTML
  their WHOLE product portfolio                 -> report.html
        |                                                 |
        | [human: send, wait for reply]                   |
        v                                                 v
Stage 02.6                                  Stage 04
Verification Parse                          Review & Verify Gate
  Accepted -> Status = VERIFIED               Per-reviewer review emails +
  Rejected -> stays PROPOSED,                  _state/[Build_ID]_build_
  reason logged in pm_responses.md              feedback.md (edited by hand)
                                                       |
                                                       | [human: send, collect
                                                       |  sign-off]
                                                       v
                                               Stage 05
                                               Publish & Share
                                                 Refuses to run unless every
                                                 relevant reviewer shows Approved
```

**The two flows are not sequential in the way the numbering might suggest.**
Flow B reads whatever is currently `VERIFIED` (or, in `internal` mode,
everything regardless of status) in `_data/*.md` — it doesn't care when or
how that data got there. You can build a deck today from data verified last
month, and run Flow A again next week without touching any deck. They share
data, not a schedule.

---

## 2. Stage-by-stage summary

| Stage | Flow | Type | One-line purpose |
|-------|------|------|-------------------|
| 01 | A | Manual | Add a feature/pain/mapping you already know, `--validate` checks it |
| 02 | A | Two-pass (human LLM step in the middle) | Propose new entries (`extract`) or link existing ones (`map-gaps`) |
| 02.5 | A | Mechanical | Generate one reviewer's complete review email |
| 02.6 | A | Mechanical | Parse that reviewer's reply, write `VERIFIED` back to `_data/*.md` |
| 03 | B | Mechanical | Resolve a vertical's scope, render the base deck |
| 03.2 | B | Mechanical, optional | Curate which pain points appear in a trimmed output |
| 03.5 | B | Mechanical | Render an HTML report |
| 04 | B | Mechanical + human | Generate review emails, track sign-off by hand |
| 05 | B | Mechanical gate | Publish — refuses without complete approval |

"Mechanical" means: no LLM judgment involved, deterministic given the same
input files. Stage 02 is the only place either flow crosses an LLM boundary
that can't be fully automated — everything else is a script.

---

## 3. Timeline & responsibilities

There is **no system-enforced deadline anywhere in either flow.** Every "3
days" or "by Friday" you might see in an email is a human commitment set by
whoever generated it, not a rule the software checks or acts on. Missing a
self-set deadline doesn't trigger a default accept, reject, or any other
automatic behavior — items and builds simply wait until a human acts.

| Phase | Typical duration | Driven by |
|-------|--------------------|-----------|
| Stage 02 prepare -> ingest | Minutes (mechanical steps) + however long the LLM step takes | Coordinator |
| Reviewer review of an AI proposal email | Unbounded — set your own expectation | The reviewer |
| Stage 03 -> 03.5 (deck rendering) | Minutes | Coordinator |
| Stage 04 review cycle | Unbounded — depends entirely on reviewer response times | Lead reviewer + relevant reviewers |
| Stage 05 publish | Instant once approvals are complete | Coordinator |

If your project needs a real SLA, that has to be a team agreement tracked
outside the tool (calendar reminders, a shared tracker) — the system does
not chase anyone.

---

## 4. RACI matrix

| Activity | Responsible | Accountable | Consulted | Informed |
|----------|-------------|--------------|-----------|----------|
| Adding a feature organically (Stage 01) | Product owner | Product owner | — | Lead reviewer (via state log) |
| Running Stage 02 (either mode) | Coordinator | Coordinator | Product owner (for context) | — |
| Accepting/rejecting a proposal (Stage 02.6) | Product owner | Product owner | — | Lead reviewer (via pm_responses.md) |
| Building a deck (Stage 03-03.5) | Coordinator / lead reviewer | Lead reviewer | — | Product owners (via Stage 04 email) |
| Reviewing a build (Stage 04) | Each relevant product owner | Lead reviewer (final call) | — | — |
| Approving publication | Each relevant product owner | Lead reviewer | — | Sales / account teams (once published) |
| Publishing (Stage 05) | Coordinator | Lead reviewer | — | Stakeholders |
| Product <-> reviewer assignment changes | Whoever governs PM assignments | Same | Lead reviewer | All reviewers |

"Coordinator" is whoever is operating the CLI — in practice this may be the
lead reviewer themselves, or a technical person supporting them; the role
isn't tied to a specific person, unlike the reviewer/product assignments in
`_data/pm_owners.md`.

---

## 5. Three realistic scenarios

### Scenario A: New product documentation arrives

New documentation is released for one of your products.

```
1. Coordinator runs Stage 02 in extract mode against the new document,
   addressed to whoever owns that product per _data/pm_owners.md.
2. The prepared prompt embeds the full inventory of existing features for
   that product, so the LLM step is instructed to skip anything that
   already exists rather than propose a duplicate -- but this is a prompt
   instruction, not a mechanical check, so a manual skim of the ingest
   result for semantic (not just ID-level) duplicates is still worthwhile
   before anything reaches the reviewer's inbox.
3. Stage 02 ingest writes genuinely new rows as Status = PROPOSED and
   queues them.
4. Stage 02.5 generates the reviewer's email -- covering these new items
   PLUS anything else already pending for that product or any other
   product they own, in one email, per the "whole reviewer at once"
   principle.
5. The reviewer replies with accept/reject decisions; Stage 02.6 writes
   VERIFIED for accepted items.
6. The next deck build for any vertical touching that product automatically
   picks up the newly-verified features -- no separate step needed.
```

### Scenario B: A product's features exist but aren't mapped to any pain

A product's features have zero rows in `map_feature_pain.md` — meaning none
of them can appear in any deck, regardless of how good the feature
descriptions are.

```
1. Coordinator runs Stage 02 in map-gaps mode for that product -- no new
   document involved, just linking existing features to the existing
   pain-point catalogue.
2. The LLM step is explicitly told that silence is an acceptable outcome --
   not every feature has to map to something. In a typical real run,
   roughly half the features get genuine mappings; the rest are correctly
   left unmapped because no existing pain point genuinely covers what they
   do -- each comes with a suggested catalogue gap for a human to consider,
   not a forced row.
3. Stage 02.5/02.6 proceed exactly as in Scenario A.
```

### Scenario C: Building a customer-facing deck that's too long

A vertical build produces dozens of deep-dive blocks — too long for a
customer document.

```
1. Run Stage 03.2 with --target 8. It proposes 8 pain points, spread across
   as many of the vertical's clusters as possible (not just the single
   highest-scoring cluster), ranked by relevance and by how much of the
   cluster is already VERIFIED.
2. Open output/curation.md, adjust the Include column by hand -- the
   suggestion is a starting point, not a decision.
3. Re-run Stage 03.5. The rendered report now reflects only the curated
   subset.
4. Not satisfied yet? Edit curation.md again, re-run 03.5 again -- your
   Include choices persist across re-runs; only newly-appearing rows get a
   fresh Suggested value.
```

---

## 6. Readiness checklist

Before starting a build (Flow B) or a data-mining batch (Flow A):

```
DATA:
[ ] Relevant pain points exist and are mapped to the vertical/product
[ ] Relevant features exist and are mapped to those pain points
[ ] For a client-mode build specifically: check that at least some of that
     scope is Status = VERIFIED, not just PROPOSED -- otherwise Stage 03
     will refuse to build in client mode, by design

PEOPLE:
[ ] Confirmed via _data/pm_owners.md who owns the relevant product(s)
     (this can change over time -- don't rely on memory or an old guide)
[ ] Lead reviewer available to break ties if feedback conflicts

STATE:
[ ] Checked _state/vertical_offering_state.md for Active Blocks that might
     affect this vertical/product
```

---

## 7. Governance rules

1. **Product <-> reviewer assignment is owned by whoever governs your PM
   roster**, recorded canonically wherever your organization tracks it and
   mirrored into `_data/pm_owners.md`. Don't route around a missing
   assignment by guessing — a product with no assigned reviewer has nobody
   who can move its proposals to `VERIFIED`.
2. **`Status = VERIFIED` can only be set by a human**, either directly
   (Stage 01, organic entry) or via Stage 02.6 (accepting an AI proposal).
   No code path sets `VERIFIED` on its own.
3. **A rejected AI proposal is never deleted or marked `REJECTED`** in
   `_data/*.md` — it stays `PROPOSED` forever, with the rejection and its
   reason recorded in `_state/pm_responses.md`. If your project needs
   rejected proposals actively removed from view, that's a gap to raise,
   not something to solve by hand-editing `Status` (which would erase the
   audit trail Stage 02.6 exists to preserve).
4. **Active Blocks live in exactly one place** —
   `_state/vertical_offering_state.md`. Any other document describing a
   block is, by definition, a stale copy; treat it as such.
5. **A build is not published without every relevant reviewer's approval.**
   Stage 05 enforces this mechanically; there is no override flag.

---

## 8. Troubleshooting & FAQ

**Q: I don't know which reviewer owns a product — where do I check?**

`_data/pm_owners.md`, "Product Coverage Map" table. This is the only
authoritative source — not this guide, not a colleague's memory, not an old
email.

---

**Q: A `PROPOSED` row has been sitting there for weeks — is it rejected?**

Not necessarily. Check `_state/pm_responses.md` — if there's no decision
logged for it, it's simply still pending, not implicitly rejected. There is
no automatic timeout.

---

**Q: Where do I see what happened to the project historically?**

`_state/vertical_offering_state.md`'s change log — every stage that writes
to shared data logs there.

---

**Q: I found a discrepancy between this guide and what the software
actually does — what do I do?**

Trust the software (and the two detailed guides, which are kept close to
the real CLI and schemas) over this overview document if they ever
disagree, and flag the discrepancy so it can be fixed.

---

## 9. Key contacts

- **Lead reviewer (final approvals, tie-breaking):** whoever your project
  names for this role.
- **Product-specific questions:** the owning reviewer — check
  `_data/pm_owners.md`.
- **Product <-> reviewer assignment changes:** contact per
  `_data/pm_owners.md`'s "Update Process" note (add one if it doesn't have
  one yet).
- **Mechanism/CLI questions:** whoever maintains `_flows/` for the project.
