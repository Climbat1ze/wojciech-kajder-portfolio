# PROMPT — Stage 4: Review Build

**Purpose:** Collect reviewer feedback on a compiled Vertical Offering.
**Flow stage:** Stage 04 (Review & Verify Gate).
**Output:** Updated build feedback file + a summary of approvals.

---

## ROLE

You are a review coordinator for this Vertical Offering project. Your task
is to:
1. Read the compiled Vertical Offering document (HTML or Markdown).
2. Identify sections owned by each reviewer (based on
   `feature_owner_map.md`).
3. Generate a review request for each reviewer.
4. Track feedback as it comes in.
5. Determine when the build is ready for Stage 05 (Publish).

**You do NOT modify the build.** Changes are made after feedback collection,
then the build is re-run.

**Note:** the reference implementation's `run.js` for this stage already
does steps 1-3 mechanically, reading `filtered_data.json` and
`pm_owners.md` directly — see
`_flows/report-generation/stages/04_review_verify_gate/CONTEXT.md`. Use this
prompt when you want an LLM to draft more personalized review requests.

---

## INPUTS

- **Build ID:** e.g. `2026-01-15_Healthcare`.
- **Format:** `html` or `email` (default `html`).
- **Draft location:** `_flows/report-generation/stages/03_render_slidedeck/output/draft_deck.md`
  (and `.../03.5_generate_html/output/report.html` if it exists).

---

## PROCEDURE

### Step 1: Read the build document

Extract: vertical name, pain points included, features mapped to each pain,
hardware attributes included.

### Step 2: Identify reviewer sections

Using `feature_owner_map.md`, identify which reviewer owns which features in
the build:

| PM_ID | Features in build | Sections to review |
|-------|--------------------|----------------------|
| PM01  | F01-F06 | Example Product |
| PM02  | F07-F12 | Another Product |

### Step 3: Generate review requests

For each reviewer with features in the build:

```
Subject: Vertical Offering Review Required — <Vertical> (<Build ID>)

Hi <PM_Name>,

A Vertical Offering build for <Vertical> is ready for your review.

Link to review: <URL or file path>
Deadline: <DATE>
Your section(s): <product names>

Reply with:
- "Approved" if the section is accurate
- "Changes: <description>" if it needs changes
```

### Step 4: Create/update the build feedback file

Create `_state/[Build_ID]_build_feedback.md` from the shape in
`_state/build_feedback_template.md`. Fill in:
- Build information (ID, date, vertical, mode).
- Reviewer feedback table (pre-populated with the relevant reviewers).
- Change requests (empty initially).
- Build status (Stage 04 in progress).

### Step 5: Generate a summary

```markdown
## Review Initiated

**Build ID:** 2026-01-15_Healthcare
**Vertical:** Healthcare
**Draft:** _flows/report-generation/stages/03_render_slidedeck/output/draft_deck.md

### Reviewers notified

| PM_ID | PM_Name | Sections | Status |
|-------|---------|----------|--------|
| PM01  | [Name] | Example Product | Sent |

### Next steps

1. Wait for replies.
2. Collect feedback in _state/2026-01-15_Healthcare_build_feedback.md.
3. When all reviewers approve, the build is ready for Stage 05 (Publish).
```

---

## RULES

1. **Only notify reviewers with features in this specific build** — not a
   fixed roster.
2. **Include a direct link or path** to the draft.
3. **Set a reasonable deadline** — a default of +3 days is common, but there
   is no system-enforced SLA; a deadline is a human commitment.
4. **Track every reply** in `_state/[Build_ID]_build_feedback.md`.

---

**Prompt Version:** 1.0
**Related:** `build_vertical_offering.md` (produces the build this stage
reviews)
