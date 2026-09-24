# PROMPT — Map Gaps: Feature -> Pain Point

**Purpose:** Propose `map_feature_pain.md` links for features that already
exist in the catalogue but answer no pain point yet.
**Flow stage:** Stage 02, `map-gaps` mode (Data Ingestion Flow).
**Output:** Proposed mapping rows + a list of features that genuinely don't
fit anything.

---

## ROLE

You link existing features to existing pain points. You are **not**
extracting anything from a source document — there is no document here. Your
only job is to decide, for each feature listed below, which of the existing
pain points (if any) it genuinely addresses, and to write a concrete
one-sentence justification grounded in the feature's own description.

**You do not invent new pain points.** If a feature answers a real customer
problem that is not in the pain point catalogue below, that is a gap in the
catalogue, not something you can fix here — name it in the Unmappable
section as a note for a human, and do not create a `P_ID` for it.

---

## THE RISK THIS PROMPT EXISTS TO CONTROL

At any real scale (dozens or hundreds of features, dozens of pain points),
asking "which pain does this feature solve" for every unmapped feature
creates a real temptation to force a match for everything, because that is
what was asked. A forced match is worse than no match: it produces a row
that reads as legitimate, gets shown to a reviewer, and either wastes their
time rejecting it or — worse — gets accepted because it looks plausible
enough on a quick read. **Silence is an acceptable, expected outcome for
many rows here.**

---

## INPUTS (supplied as context)

- The unmapped features for one product (`F_ID`, `Feature`, `Description`).
- The full pain point catalogue (`P_ID`, `Pain Point`, `Cluster`,
  `Description`).
- A sample of existing `map_feature_pain.md` rows, as a style and
  duplication reference.

---

## PROCEDURE

For each unmapped feature:

1. **Read its `Description`.** This is the only evidence you have that the
   feature does what it claims.
2. **Scan the pain point catalogue** for a pain whose `Description` the
   feature's own description directly speaks to. Not "could plausibly relate
   to" — directly addresses.
3. **If you find one or more genuine matches:** write a mapping row per
   match, with `How it addresses` restating, in your own words, the specific
   mechanism from the feature's `Description` that answers the specific
   problem in the pain's `Description`. If you cannot point to that
   mechanism in the feature's own text, you do not have a real match — do
   not write the row.
4. **If you find no genuine match:** the feature goes to the Unmappable
   section, with a one-line reason. This is not a failure of the exercise —
   it is the expected outcome for features whose fit to the current pain
   catalogue is genuinely weak, and it is more useful to a human than a row
   they have to reject.
5. **Density check, before you finalise:** if you are about to propose more
   than 3 pain points for a single feature, stop and reconsider — that is a
   sign of pattern-matching on the feature name rather than the description.
   A feature that is genuinely broad enough to warrant 4+ mappings is rare;
   name each one anyway if you are confident, but flag the row count
   explicitly in your summary so a human double-checks it.

---

## OUTPUT FORMAT

### 1. Proposed mappings (ready to paste)

```markdown
## Proposed Mappings (map_feature_pain.md)

| F_ID | P_ID | How it addresses | Status | Proposed_By | PM_Assigned |
|------|------|-------------------|--------|--------------|--------------|
| F12  | P05  | Explains the specific mechanism, grounded in the feature's Description | PROPOSED | LLM (batch YYYY-MM-DD) | PM01 |
```

`PM_Assigned` is a best-effort guess (use the product's owner from
`_data/pm_owners.md` if you can infer it from context) — the ingest step
re-derives it from that table regardless, so getting it wrong here does not
break anything.

### 2. Unmappable features

```markdown
## Unmappable

| F_ID | Feature | Reason | Note for catalogue gap (optional) |
|------|---------|--------|-------------------------------------|
| F13  | Some Feature | No pain point in the catalogue addresses this capability | Possible new pain: "..." — needs a human to add it, not proposed here |
```

Every unmapped feature you were given must appear in **either** section 1
(one row per genuine match) **or** section 2 (exactly one row). None may be
silently dropped from both.

---

## RULES

1. **Never write `Status = VERIFIED`** — only `PROPOSED`.
2. **Never write a `P_ID` that is not already in the supplied catalogue.**
3. **`How it addresses` must be traceable to the feature's own
   `Description`** — not a generic restatement of the pain point, not
   marketing language.
4. **More than 3 mappings for one feature is a signal to double-check, not a
   hard limit.**
5. **A feature with no genuine match belongs in Unmappable, not forced into
   section 1.**
6. **Table content in EN.**

---

**Prompt Version:** 1.0
**Related:** `analyze_source.md` (the extraction-mode sibling of this
prompt)
