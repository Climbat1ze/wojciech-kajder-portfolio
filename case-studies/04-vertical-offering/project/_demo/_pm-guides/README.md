# PM Guides — Vertical Offering

**Purpose:** step-by-step guides for whoever runs this project day to day —
a lead reviewer and the individual product managers (PMs) who own products.

---

## Guide index

### 1. [PM_Guide_Integrated_Process.md](PM_Guide_Integrated_Process.md) — start here
The end-to-end picture: both flows, timelines, RACI, governance rules,
realistic scenarios, troubleshooting that spans both flows.

### 2. [PM_Guide_Managing_Features_and_Pains.md](PM_Guide_Managing_Features_and_Pains.md)
Flow A in detail — adding features yourself, verifying AI proposals, the
exact commands and reply formats.

### 3. [PM_Guide_Creating_Vertical_Offering.md](PM_Guide_Creating_Vertical_Offering.md)
Flow B in detail — building a deck, generating HTML, review, publishing.

---

## Reading paths by role

### Lead reviewer / build owner
```
1. Read: root CLAUDE.md (overall context)
2. Read: PM_Guide_Integrated_Process.md (entire system)
3. Reference: PM_Guide_Creating_Vertical_Offering.md (when building)
4. Reference: PM_Guide_Managing_Features_and_Pains.md (when reviewing submissions)
5. Reference: _data/README.md (data model questions)
```

### Product manager (owns a product)
```
1. Read: root CLAUDE.md (overall context)
2. Read: PM_Guide_Integrated_Process.md (your role in the process)
3. Read: PM_Guide_Managing_Features_and_Pains.md (how to update your product's features)
4. Reference: _data/README.md (data model for your edits)
```

### New team member
```
1. Read: root CLAUDE.md (full project context)
2. Read: PM_Guide_Integrated_Process.md (all processes at once)
3. Based on role: read the specific guide above
4. Keep _data/README.md as a reference
```

---

## Key concepts

### The pipeline, in short

```
FLOW A: DATA INGESTION                      FLOW B: REPORT GENERATION
────────────────────────                    ─────────────────────────
01 Organic Input (manual)                   03 Render Slide Deck
02 AI-Assisted Mining                       03.2 Curate Scope (optional)
02.5 Verification Export                    03.5 Generate HTML (optional)
02.6 Verification Parse                     04 Review & Verify Gate
                                             05 Publish & Share
```

### Status values

- **VERIFIED** — confirmed by a human.
- **PROPOSED** — AI-proposed, pending review.
- **TBC** — to be confirmed (hardware attributes only).

There is no `REJECTED` status written into `_data/*.md` — see
`_data/README.md` §4 for why.

### RACI (high level)

| Stage | Activity | Product PM | Lead reviewer | Coordinator | AI |
|-------|----------|:---:|:---:|:---:|:---:|
| 01 | Add a feature manually | R | I | — | — |
| 02 | Analyze a source document | — | I | R | E |
| 02.6 | Verify an AI proposal | R | I | — | — |
| 03 | Build the deck | — | I | R | E |
| 04 | Review the compiled doc | R | C | — | — |
| 05 | Publish | — | A | R | — |

R = Responsible, A = Accountable, C = Consulted, I = Informed, E = Executes.

---

## Quick links

- **Project root:** `../CLAUDE.md`
- **Data model:** `../_data/README.md`
- **Configuration:** `../vertical_offering.config.md`
- **State & history:** `../_state/vertical_offering_state.md`
- **Prompts:** `../_prompts/orchestrator.md`

---

## Questions? Start here

| Question | Document |
|----------|----------|
| How does the entire process work? | `PM_Guide_Integrated_Process.md` |
| How do I add a new feature? | `PM_Guide_Managing_Features_and_Pains.md` §3 |
| How do I verify AI proposals? | `PM_Guide_Managing_Features_and_Pains.md` §4-5 |
| How do I build a vertical deck? | `PM_Guide_Creating_Vertical_Offering.md` |
| What are the data table structures? | `../_data/README.md` |
