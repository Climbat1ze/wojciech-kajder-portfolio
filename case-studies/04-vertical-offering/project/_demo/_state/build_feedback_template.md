# Vertical Offering — Build Feedback (template)

This is what `_lib/feedback.js` generates automatically as
`_state/[Build_ID]_build_feedback.md` when Stage 04 (Review & Verify Gate)
first runs for a build. You do not create this file by hand — this copy is
here purely as documentation of its shape.

---

## Build Information

| Field | Value |
|-------|-------|
| **Build ID** | `<date>_<vertical>` |
| **Build Date** | `<ISO date>` |
| **Vertical** | `<V_ID> <name>` |
| **Mode** | `internal` or `client` |
| **Draft Location (MD)** | path to `draft_deck.md` |
| **Draft Location (HTML)** | path to `report.html`, or a note that Stage 03.5 hasn't run |
| **Review Deadline** | `<ISO date>` |

## Reviewer Feedback

| PM_ID | PM_Name | Section(s) | Status | Comment | Timestamp |
|-------|---------|------------|--------|---------|-----------|

**Status values:** `Pending` / `Approved` / `Changes Needed` / `Blocked`.

## Change Requests

| CR_ID | PM_ID | Section | Change_Description | Priority | Status | Resolved_By | Resolved_At |
|-------|-------|---------|-------------------|----------|--------|-------------|-------------|

## Build Status

| Stage | Status | Date |
|-------|--------|------|
