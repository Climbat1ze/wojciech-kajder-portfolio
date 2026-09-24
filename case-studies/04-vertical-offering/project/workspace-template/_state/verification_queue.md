# Verification Queue

**Layer 4 — working artifact.** Stage 02 (data-ingestion) appends to the
Active Queue; Stage 02.6 moves entries to the Resolved Queue. Do not hand-edit
`Status`, `PM_Assigned` or `Entry_ID` here — they exist to be recomputed by
the stages that own this file. See
`_flows/data-ingestion/stages/02_knowledge_ai_mining/CONTEXT.md`.

## Active Queue

| Entry_ID | Table | Content_Summary | Proposed_By | PM_Assigned | Date_Added | Status | Deadline |
|----------|-------|-----------------|-------------|-------------|------------|--------|----------|

## Resolved Queue

| Entry_ID | Table | Content_Summary | Decision | Decision_By | Decision_Date | Notes |
|----------|-------|-----------------|----------|-------------|---------------|-------|
