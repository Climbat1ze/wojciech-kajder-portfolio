# PM Guide: Managing Features & Pain Points

**Audience:** Product managers (whoever owns a product's entry in
`_data/pm_owners.md`), the lead reviewer.
**Purpose:** Step-by-step instructions for adding, updating, and verifying
features and pain points.

---

## 1. Why features & pain points matter

### The connection: pain -> feature -> sale

```
CUSTOMER PROBLEM              YOUR SOLUTION              SALE OUTCOME
─────────────────────────────────────────────────────────────────────

Device operating in     ->  A hardware attribute   ->  "Devices work in
extreme temperatures        confirmed for this          extreme conditions"
(environmental pain)        range                       = differentiator


Unauthorized access     ->  A specific feature     ->  "Restrict devices
on shared devices           that restricts access       to approved apps"
(security pain)                                        = security feature
```

### Why this matters for your job

- **As a product owner:** your features are the "proof" that your product
  solves a customer pain point.
- **As the lead reviewer:** you compile these features into vertical decks
  for sales/account teams.
- **For sales:** they present these pain-solution pairs to close deals.
- **For customers:** they understand why the product is valuable to them.

---

## 2. Data structure overview

### The tables you'll touch

```
┌─ PAIN POINTS ──────────────────────────────────────────────────┐
│ _data/pain_points.md                                            │
│                                                                  │
│ | P_ID | Pain Point | Cluster | Description | Source | Status │
│ | P01  | Device operation in extreme temps | Environmental | ...| S02 | PROPOSED │
│                                                                  │
│ Purpose: define all customer pain points                        │
│ Who edits: lead reviewer, based on customer feedback            │
│ Status: VERIFIED (confirmed) or PROPOSED (AI proposed)          │
└─────────────────────────────────────────────────────────────────┘

           v CONNECTS TO v

┌─ FEATURES ─────────────────────────────────────────────────────┐
│ _data/features/[product].md — one file per product              │
│ (e.g., _data/features/example_module.md)                        │
│                                                                  │
│ | F_ID | Feature | Product | Description | Source | Status |  │
│ | F01  | Example capability | Example Product | ... | S01 | PROPOSED │
│                                                                  │
│ Purpose: define all features per product                        │
│ Who edits: the product owner (YOU)                              │
│ Status: VERIFIED once you've confirmed it                       │
└─────────────────────────────────────────────────────────────────┘

           v CONNECTED BY v

┌─ MAPPINGS ─────────────────────────────────────────────────────┐
│ _data/map_feature_pain.md                                      │
│                                                                  │
│ | F_ID | P_ID | How it addresses | Status | Proposed_By | PM_Assigned │
│ | F01  | P01  | Explains the mechanism, traceable to the feature's own description | PROPOSED | LLM (batch ...) | PM01 │
│                                                                  │
│ Purpose: link features to pain points (F01 solves P01)          │
│ Who edits: a product owner (organic) or an AI proposal you verify (Stage 02) │
└─────────────────────────────────────────────────────────────────┘
```

**Why a mapping row stores `F01`/`P01` and not a copy of the feature's or
pain point's text:** this is a deliberate design choice, not a shortcut.

- **A code (`F_ID`/`P_ID`) is the only thing in this system guaranteed to
  stay stable.** Descriptions get refined constantly. If a mapping stored a
  copy of the text instead of the ID, every routine edit would either break
  the mapping or require updating every duplicated copy. The ID doesn't
  move when the description does.
- **Matching by content is ambiguous in a way matching by ID is not.** Two
  features can genuinely describe very similar capabilities while being two
  distinct, separately-sourced rows — deliberately left unmerged, because
  only a human can judge whether that's a real duplicate. A system that
  matched on text similarity instead of exact ID would silently merge (or
  silently mismatch) things instead of surfacing the question.
- **An ID reference is mechanically checkable; a text reference isn't.**
  `node _flows/_lib/tools/check_integrity.js` can tell you with certainty
  whether every `P_ID` in `map_feature_pain.md` actually exists in
  `pain_points.md` — a clean yes/no. There's no equivalent check possible
  for "does this pasted sentence still match the pain point it was copied
  from."

This is the same pattern a relational database uses for a foreign key: the
mapping table stores the reference, never a denormalized copy of what it
points to.

**A note on `Status`:** across every table, the real values are `VERIFIED`,
`PROPOSED`, and (for `hardware_attributes.md` only) `TBC`. **There is no
`REJECTED` status written into any of these files.** When a product owner
rejects an AI proposal, the row is left at `PROPOSED` permanently — the
rejection and its reason are recorded separately, in
`_state/pm_responses.md`. This matters practically: a row you see sitting at
`PROPOSED` for a long time might be something nobody has reviewed yet, or
something a reviewer already rejected — check `_state/pm_responses.md` if
you need to know which.

### File locations

```
{PROJECT_ROOT}/
├── _data/
│   ├── pain_points.md                        <- customer pains (editable)
│   ├── features/
│   │   └── [product].md                      <- one file per product; owner per pm_owners.md
│   ├── map_feature_pain.md            <- link features to pains
│   ├── map_pain_vertical.md           <- link pains to verticals
│   ├── pm_owners.md                   <- THE authoritative product<->reviewer table
│   └── README.md                      <- full data model spec (all schemas, in detail)
└── _state/
    ├── vertical_offering_state.md     <- change log (you log your changes here)
    ├── verification_queue.md          <- AI proposals waiting for your review (Active) + resolved history
    └── pm_responses.md                <- log of every accept/reject decision, including reasons for rejections
```

**`pm_owners.md` is the single source of truth for who owns what.** Always
check `_data/pm_owners.md`'s "Product Coverage Map" table if you're unsure
who owns a product, rather than trusting a guide that may be a version
behind.

---

## 3. Stage 01: Organic input — adding features yourself

### What is "organic input"?

You, as a product owner, have direct knowledge of your product. You can add
features directly to the table **without waiting for AI or anyone else's
permission**.

**Trigger:** you learn a new feature from a customer conversation, your
product's own documentation, an internal roadmap, or performance data.

### How to add a feature (step by step)

#### Step 1: Identify the feature

You learn something new about your product. Ask yourself:
- Is this a new feature? (Or an update to an existing one?)
- Does it solve a customer problem?
- Where did I learn this?
- Which product owns this?

#### Step 2: Check if the feature already exists

```
Search in your product file: _data/features/[your_product].md
Look for the feature by name or description.
If found: -> update the existing row (don't duplicate).
If not found: -> add a new row.
```

There is no mechanical duplicate check for this step — it relies on you
actually searching. (Stage 02's `extract` mode embeds a full inventory of
existing features in its prompt for the same reason — even AI-proposed
entries rely on a search step, just done by the model instead of you.)

#### Step 3: Identify the source

Where did you learn this? Find or add a source in `_data/sources.md`:

```markdown
| S_ID | Type | Title | URL/Path | Feeds | Status |
|------|------|-------|----------|-------|--------|
| S05  | Product Doc | Example Technical Guide | _context_sources/example_guide.md | Feature accuracy | VERIFIED |
```

#### Step 4: Edit your feature file

**File location:** `_data/features/[your_product].md`

**Add a new row at the bottom:**

```markdown
| F_ID | Feature | Product | Description | Source | Status |
|------|---------|---------|-------------|--------|--------|
| ... existing features ... |
| F14  | Example capability name | Example Product | What it does, concretely | S05 | VERIFIED |
```

**Important rules:**
- `Status = VERIFIED` — you verified it, so it's confirmed.
- Include at least one real source (`S_ID`) — never make one up.
- Description should be 1-2 sentences, concrete (not "amazing" or
  "powerful").
- **`F_ID` is global across all product files, not per-product.** Before
  picking a number, scan every file under `_data/features/` and use
  `max(F_ID) + 1`. This is exactly why a single product's `F_ID`s are
  rarely a clean run once a project has been active for a while.
- Never set `Status` to `PROPOSED` yourself — that value is only ever
  written by the AI-assisted path (Stage 02).

#### Step 5: Map the feature to pain points

**File:** `_data/map_feature_pain.md`

```markdown
| F_ID | P_ID | How it addresses | Status | Proposed_By | PM_Assigned |
|------|------|-------------------|--------|--------------|--------------|
| F14  | P03  | Explains the specific mechanism, grounded in the feature's Description | VERIFIED | PM | PM01 |
```

For a row you add yourself and verify on the spot, `Status = VERIFIED` and
`Proposed_By = PM` directly — you don't need to route this through Stage
02.5/02.6, because you're both the proposer and the verifier.

#### Step 6: Validate, then log your change

```bash
cd "_flows/data-ingestion"
node run_flow.js --stage 01 --validate
```

This checks every row you touched for: a unique global `F_ID`, a filled
`Source` that actually exists in `sources.md`, and a valid `Status`. It
writes `_flows/data-ingestion/stages/01_knowledge_organic_input/output/validation_report.json`
— open it if the check reports a problem.

Then log the change:

**File:** `_state/vertical_offering_state.md`

```markdown
| Date | Action | Description | Path |
|------|--------|-------------|------|
| 2026-01-15 | add-feature | F14: Example capability name | _data/features/example_module.md |
| 2026-01-15 | add-mapping | F14 -> P03 | _data/map_feature_pain.md |
```

**That's it.** The feature is now in the system and available for vertical
builds.

---

## 4. Stage 02: AI-assisted input — verifying proposals

### What happens in Stage 02?

Stage 02 has **two modes** implemented in this reference project (a third,
`enrich`, is documented in `_prompts/enrich_features.md` as an extension
point), both sharing the same two-pass mechanism (prepare -> a human runs an
LLM -> ingest), and both producing the same kind of output: rows with
`Status = PROPOSED` that sit in your Active Queue until you decide.

| Mode | What it does | When it's used |
|------|---------------|-----------------|
| `extract` | Reads a new document, proposes brand-new features/pains/mappings | New product documentation, whitepapers, case studies |
| `map-gaps` | Links features that already exist in the catalogue to existing pain points — no new document, no new IDs | A product's features exist but aren't mapped to any pain yet |

**You do not run Stage 02 yourself.** A coordinator or whoever is building
the vertical offering runs it; your job starts at Stage 02.5, when you
receive the verification email.

### Real command sequence (for reference — the coordinator runs these)

```bash
cd "_flows/data-ingestion"

# extract: propose new entries from a document
node run_flow.js --stage 02 --file "path/to/document.md" --product example_module --pm PM01

# map-gaps: link existing features to existing pains for one product
node run_flow.js --stage 02 --mode map-gaps --product example_module

#   [human step: the prepared prompt is run through an LLM,
#    the reply is saved to output/mining_response.md]

# ingest pass — same command regardless of mode
node run_flow.js --stage 02 --ingest
```

Every proposal, regardless of mode, is written to `_data` as
`Status = PROPOSED` and simultaneously queued in
`_state/verification_queue.md`'s Active Queue, addressed to whoever owns
that product (looked up from `pm_owners.md` — never trusted from whatever
the AI guessed).

---

### Receiving the verification email (Stage 02.5)

You receive an email listing **every pending item across every product you
own**, not just one document's worth — the system deliberately batches your
whole product portfolio into one email rather than sending you small pieces
over time. If you own two products, expect one email covering both.

**Example item, as it appears in the email:**

```
ITEM #5: F09 -> P03

Feature:      Example capability name (Example Product)
Pain Point:   P03 -- Example pain point name
How it addresses: Explains the specific mechanism
Status:       PROPOSED (pending your decision)
```

---

### Your decision — accept, correct, or reject

You are the expert. For each item, decide based on questions like:

| Question | If YES -> |
|----------|----------|
| Is this feature real and correctly described? | Lean accept |
| Can you point to the mechanism in the feature's own description that supports the mapping? | Lean accept |
| Is the feature vaporware, or a different feature than described? | Lean reject |
| Is this a duplicate of something already verified? | Lean reject |
| Is the pain-point mapping a stretch — plausible-sounding but not actually supported by the feature's text? | Lean reject |

### Send your response

Reply to the verification email — the parser understands both single-line
and multi-line replies:

```
accept 1, 2, 5
correct 3 (title should read "Bulk device enrollment")
reject 4 (feature withdrawn)
reject 7 (feature description is inaccurate)
```

**What happens to items you don't mention at all:** they simply stay
pending — there is no automatic "treated as rejected if you don't respond"
rule.

### How the system processes your reply

```bash
cd "_flows/data-ingestion"
node run_flow.js --stage 02.6 --pm PM01 --email-file your_reply.txt
```

This:
1. Parses your accept/correct/reject decisions against the exact item
   numbers from your email.
2. For each **accepted** item: moves it from the Active Queue to the
   Resolved Queue, and flips its `Status` in `_data/*.md` from `PROPOSED`
   to `VERIFIED` — this is the only place in the system where that
   transition happens.
3. For each **rejected** item: moves it to the Resolved Queue with your
   reason, but **leaves `_data/*.md`'s `Status` unchanged** — still
   `PROPOSED`, permanently.
4. For each **correction**: leaves the item in the Active Queue for a
   follow-up round after you fix the wording.
5. Logs every decision, with your reasoning, to `_state/pm_responses.md`.

---

## 5. Stage 02.5 – 02.6: email verification workflow

### Response format examples

**Accept everything:**
```
accept 1, 2, 3
```

**Mixed, with reasons:**
```
accept 1, 2
reject 3 (not part of this product's current version)
```

**Multi-line, more discursive:**
```
I reviewed the proposals. Here are my decisions:

accept 1
accept 2
accept 3 (minor: description could be clearer, but correct)
reject 4 (feature not in our product yet)
reject 5 (duplicate of F01)
```

The parser looks for the accept/correct/reject keyword and the item
number(s) on each line or clause — extra prose around them doesn't confuse
it, but the number must match an item number from the email you're replying
to.

### Timeline

| Step | Who | Typical time |
|------|-----|---------------|
| Stage 02 prepare | Coordinator | Minutes (mechanical) |
| LLM step | Coordinator + LLM | Minutes to ~1h |
| Stage 02 ingest | Coordinator | Minutes (mechanical) |
| Stage 02.5 (email generated) | Coordinator | Minutes (mechanical) |
| **Your review & reply** | **You** | No fixed SLA — set your own expectation |
| Stage 02.6 (reply parsed) | Coordinator | Minutes (mechanical) |

---

## 6. Maintenance & updates

### When to update an existing feature

| Scenario | Action |
|----------|--------|
| Feature description needs clarification | Edit the existing row directly, update `Description` |
| New pain point discovered for the feature | Add a new row in `map_feature_pain.md` |
| Feature source changed | Update `Source` in the row |

### Deprecating a feature

**There is no mechanized deprecation status in this reference
implementation.** If a feature genuinely stops being valid:

```
1. Do not delete the row (loses the audit trail).
2. Coordinate with the lead reviewer on how to flag it -- today this means
   an explicit note in the row's Description and a state-log entry
   explaining why, not a Status change.
3. Manually exclude it from builds if needed (the Active Blocks mechanism,
   in _state/vertical_offering_state.md).
```

This is a known gap, not a design choice you need to work around
creatively.

---

## 7. Data quality checks

### Before you submit a feature (checklist)

```
[ ] Feature real & in the current product version?
[ ] Can you cite real documentation (an existing or new S_ID)?
[ ] Description 1-2 sentences, concrete (not marketing language)?
[ ] Pain point mapping makes sense -- traceable to the feature's own Description?
[ ] Source (S_ID) exists in _data/sources.md?
[ ] F_ID unique across ALL product files, not just yours?
[ ] Status = VERIFIED (never PROPOSED -- that's AI-only)?
[ ] Logged the change in _state/vertical_offering_state.md?
```

### Common mistakes

| Wrong | Right | Why |
|-------|-------|-----|
| `Status = PROPOSED` (set by you) | `Status = VERIFIED` | Only AI proposals get PROPOSED |
| "Amazing, powerful, robust feature" | "Encrypts data at rest with AES-256" | Concrete beats adjectives |
| Source = "internal knowledge" | Source = a real, citable row in `sources.md` | Must be traceable |
| Picking the next `F_ID` from only your own product file | Scanning all files for `max(F_ID) + 1` | `F_ID` is global, not per-product |
| Assuming a rejected AI proposal is gone | Checking `_state/pm_responses.md` — it's still `PROPOSED` in `_data/` | No `REJECTED` status exists |
| Deleting an old feature | Editing in place + logging the change | Audit trail matters |

---

## 8. FAQ & troubleshooting

**Q1: What if I miss a review deadline someone set for me?**

A: Nothing happens automatically. There's no default-rejection behavior —
items just stay pending until you reply, whenever that is.

---

**Q2: Can I change my mind after accepting something?**

A: Not through the normal path — Stage 02.6 is a one-way accept/reject
action per item. If you need to reverse a `VERIFIED` row, edit it directly
and log why in the state file.

---

**Q3: Can multiple product owners edit the same product file?**

A: Not recommended. Each product in `pm_owners.md`'s Product Coverage Map
should have exactly one assigned owner — the routing logic (`owners.js`)
assumes this. If a product genuinely needs co-ownership, that's a
governance conversation, not something to solve by both editing files
independently.

---

**Q4: What if I find an error in an AI proposal?**

A: Reject it with a specific reason in your reply — your explanation helps
whoever prepares the next batch avoid the same mistake.

---

### Troubleshooting

**Issue: "Feature F_ID not found" somewhere downstream**

```
1. Check whether F_ID exists in any features/*.md:
   grep -r "F14" _data/features/
2. If missing entirely: it may have never been added, or was proposed but
   never ingested (check _flows/data-ingestion/stages/02_knowledge_ai_mining/output/)
3. If it exists but a mapping references a different F_ID: fix the mapping
   row, not the feature.
```

**Issue: A pain point ID in a mapping doesn't resolve**

```
1. Check it exists: grep "P09" _data/pain_points.md
2. If not found: it may be an AI-proposed pain point not yet ingested, or a typo.
3. Never invent a P_ID to fill a gap -- Stage 02's map-gaps mode is
   explicitly instructed not to invent pain points either.
```

---

## Summary

### Your role: product owner

**Organic input (Stage 01) — you actively ADD features:**
- Edit your product's file directly.
- `Status = VERIFIED` immediately, since you're the source.
- Run `--validate` before logging the change.

**AI-assisted input (Stage 02) — you actively VERIFY proposals:**
- Receive one email covering your entire product portfolio.
- Review each item, decide accept/correct/reject with a reason.
- Your reply is what actually changes `Status` to `VERIFIED` — nothing
  before that step is final.

## Next steps

1. [ ] Read the project's `CLAUDE.md` and `_data/README.md` (full schema reference).
2. [ ] Find your product file(s) via `_data/pm_owners.md`.
3. [ ] Review existing features in your product.
4. [ ] Try adding one feature you know well (Stage 01, including `--validate`).
5. [ ] Wait for your next AI-proposal email (Stage 02.5) and practice replying.
