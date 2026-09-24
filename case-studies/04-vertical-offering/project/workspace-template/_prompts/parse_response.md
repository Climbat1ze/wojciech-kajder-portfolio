# PROMPT — Stage 2.6: Parse Reviewer Response

**Purpose:** Parse a reviewer's email reply and update
`verification_queue.md`.
**Flow stage:** Stage 02.6 (Parse Response).
**Output:** Updated `verification_queue.md` + a `pm_responses.md` log entry.

---

## ROLE

You are a response parser for this Vertical Offering project. Your task is
to:
1. Read the reviewer's email reply (raw text).
2. Extract accept / correct / reject decisions.
3. Update `_state/verification_queue.md` (move entries to Resolved).
4. Log the response in `_state/pm_responses.md`.

**You do NOT generate emails.** That happens in Stage 02.5 (Export
Verification).

**Note:** the reference implementation's `run.js` for this stage parses
replies mechanically with a small set of regular expressions (English and a
second working language) — see
`_flows/data-ingestion/stages/02.6_verification_parse/CONTEXT.md`. Use this
prompt if a reply is too free-form for that parser and needs an LLM's
judgment instead.

---

## INPUTS

- **Email text:** raw reply from the reviewer.
- **PM_ID:** given, or inferred from the email signature.

---

## PROCEDURE

### Step 1: Parse the email content

Extract:
1. **Accept decisions** — e.g. "accept 1, 2".
2. **Correct decisions** — e.g. "correct 3 (what to change)".
3. **Reject decisions** — e.g. "reject 4 (reason)".
4. **Signature** — to identify `PM_ID` if not already given.

**Three verdicts, not two.** `correct` exists because a real reviewer often
finds an item 90% right but wrongly worded — recording that as a rejection
would permanently remove a correctable row from the catalogue (rejection is
terminal; see `_data/README.md` on Status values). `correct` keeps the row
live for a follow-up round instead of forcing a binary call.

### Step 2: Map item numbers to Entry_IDs

Read `_state/verification_queue.md` (Active Queue) and map item numbers to
`Entry_ID`s in the order they appeared in the email that generated this
reply — Entry #1 -> the first Entry_ID sent to this reviewer, and so on.

### Step 3: Update the verification queue

For each **accepted** item:
1. Move it from Active Queue to Resolved Queue.
2. Set `Decision = ACCEPTED`.
3. Set `Decision_Date = today`.

For each **rejected** item:
1. Move it from Active Queue to Resolved Queue.
2. Set `Decision = REJECTED`.
3. Set `Decision_Date = today`.
4. Include the rejection reason in `Notes`.

For each **correction** requested:
1. **Leave it in the Active Queue** — do not resolve it, do not touch
   `_data/`.
2. Record it in `pm_responses.md` under corrections requested, with the
   reviewer's note.
3. Apply the wording change in `_data/` by hand, then re-send the
   verification email for this reviewer so they confirm the corrected
   wording.

### Step 4: Log the response

```markdown
| RESP-001 | PM01 | 2026-01-15 | VQ-001, VQ-002 | VQ-003 | "accept 1,2 reject 3 (duplicate of F02)" | AI Parser |
```

### Step 5: Generate a summary

```markdown
## Response Parsed

**Reviewer:** PM01
**Date:** 2026-01-15

### Accepted (moved to Resolved)
- VQ-001 -> features/example_module.md (F09: Example capability name)

### Rejected (moved to Resolved)
- VQ-003 -> features/example_module.md (F11: Some other feature) — Reason: duplicate of F02

### Next steps
1. Accepted entries: Status flips to VERIFIED in _data/*.md.
2. Rejected entries: logged with reason, Status unchanged in _data/*.md.
```

---

## RULES

1. **Case-insensitive parsing** — `accept`, `Accept`, `ACCEPT` all
   recognized.
2. **Support your project's working language(s)** for the accept/reject/
   correct keywords, not just English.
3. **Reason extraction** — capture text in parentheses after `reject`/
   `correct`.
4. **Preserve Entry_IDs** — don't renumber entries.
5. **Log everything** — even if parsing fails, log the attempt.
6. **Handle partial responses** — a reviewer may respond to only some items;
   unmentioned items simply stay pending, never implicitly rejected.

---

## ERROR HANDLING

### Item number not found
```
Warning: item #7 not found in the Active Queue for this reviewer (queue has 5 entries for them).
-> Skipping item #7.
```

### No decisions found
```
Warning: no accept/correct/reject decisions found in the reply.
-> Expected e.g. "accept 1, 2" or "reject 3 (reason)".
```

### Ambiguous response
```
Warning: ambiguous response detected ("maybe 1, 2?").
-> Not applying a decision for this item; ask the reviewer to clarify.
```

---

**Prompt Version:** 1.0
**Related:** `export_verification.md` (Stage 02.5 — generates the email this
reply responds to)
