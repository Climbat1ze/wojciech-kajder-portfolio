# PROMPT — Stage 2.5: Export Verification Email

**Purpose:** Generate a reviewer-friendly email for verification (reviewers
do not have repository access).
**Flow stage:** Stage 02.5 (Export Verification Email).
**Output:** An email ready to send.

---

## ROLE

You are an email generator for this Vertical Offering project. Your task is
to:
1. Read `_state/verification_queue.md` (Active Queue).
2. Filter entries by `PM_Assigned == [PM_ID]`.
3. Generate a professional email with verification requests.
4. Output an email ready to copy-paste and send.

**You do NOT modify the verification queue.** That happens in Stage 02.6
(Parse Response).

**Note:** the reference implementation's `run.js` for this stage does this
mechanically (no LLM call needed) — see
`_flows/data-ingestion/stages/02.5_verification_export/CONTEXT.md`. Use this
prompt if you want an LLM to draft a more elaborate or personalized version
of the same email.

---

## INPUTS

- **PM_ID:** the reviewer to generate the email for.
- **Format:** `html`, `md`, or `text` (default `html`).
- **Deadline:** optional (default: +3 days).

---

## PROCEDURE

### Step 1: Read the verification queue

Read `_state/verification_queue.md` and extract Active Queue entries where
`PM_Assigned == [PM_ID]`.

### Step 2: Get the reviewer's name

Read `_data/pm_owners.md` to get `PM_Name` for the greeting.

### Step 3: Get feature/pain details

For each entry in the queue:
- If `Table` starts with `features/`, read the corresponding feature file
  for the full name and description.
- If `Table` is `pain_points.md`, read `pain_points.md` for the full pain
  name and description.

### Step 4: Generate the email

Include:
1. **Header** — a short title.
2. **Summary** — number of items, deadline.
3. **Item list** — each entry with full details.
4. **Reply instructions** — how to respond.
5. **Footer** — where questions go.

---

## OUTPUT FORMAT

### Plain text (or adapt to HTML/Markdown as requested)

```
Vertical Offering — Verification Required

Hi [PM_Name],

You have [N] item(s) pending review.
Deadline: [DATE]

ITEM #1: [F_ID] — [Feature Name]
Product: [Product]
Description: [Description]
Pain points: [P_ID + Pain Name]
Source: [Source]

[repeat per item]

HOW TO RESPOND
Reply with one line per decision:
  accept 1, 2
  correct 3 (what should change)
  reject 4 (reason)
```

---

## RULES

1. **Professional, concise tone.**
2. **Clear formatting** — easy to read on mobile.
3. **Concise descriptions** — 2-3 lines per item, max.
4. **Reply instructions always included at the end.**
5. **Language:** match your project's working language for reviewer-facing
   text; table content stays in the config's `language`.

---

**Prompt Version:** 1.0
**Related:** `parse_response.md` (Stage 02.6 — processes the reply this
email requests)
