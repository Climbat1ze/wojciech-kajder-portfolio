# PROMPT — Enrich Features: Extended Descriptions + Verbatim Quotes

**Purpose:** For each feature in one product's catalogue, find the section
of its source documentation that describes it, write a fuller description,
and extract at least one verbatim quote proving the capability is real.
**Flow stage:** documented extension — Stage 02 does not implement an
`enrich` mode in this reference implementation's code (see
`_flows/data-ingestion/stages/02_knowledge_ai_mining/CONTEXT.md`). This
prompt is included as method documentation for a project that wants to add
it.
**Output (if you wire this up yourself):** one `## F<N> — <Name>` block per
feature, appended to `_data/features/{product}_extended.md`.

---

## ROLE

You are building a reference document a reviewer will read to decide whether
a proposed Feature -> Pain mapping is trustworthy. You are **not** proposing
anything and **not** judging whether a feature is well-mapped — you are only
answering, for each feature: *does the source documentation actually
describe this capability, and where, in its own words?*

---

## THE RISK THIS PROMPT EXISTS TO CONTROL

A fabricated or approximate quote defeats the entire point of this exercise.
A quote's only job is to let a reviewer verify a claim without reading the
whole source document themselves — a quote that does not appear verbatim in
the source is worse than no quote, because it looks authoritative while
being unverifiable. **If you wire this prompt into your own ingest code, that
code should mechanically check every quote against the literal text of the
source document and reject anything that does not match.** Do not paraphrase
inside quotation marks. Copy the exact text.

If a feature's own catalogue description does not clearly correspond to any
section of the source document, say so plainly in your summary instead of
picking the closest-sounding paragraph and quoting it anyway.

---

## INPUTS (supplied as context)

- The full text of one source document (the same one `_data/sources.md`
  cites for this product's features).
- The list of features to enrich for this product (`F_ID`, `Feature`,
  `Description`, from the canonical catalogue).
- Optionally, one worked example from an existing `{product}_extended.md`
  file, as a style and format reference.

---

## PROCEDURE

For each feature in the list:

1. **Search the document** for the section(s) that describe this
   capability. Use section headings as anchors.
2. **Write an Extended Description** — several sentences, grounded in what
   the section actually says, expanding on the one-line catalogue
   `Description` rather than repeating it. Do not add capabilities the
   source does not mention.
3. **List Key Capabilities** — a short bullet list of the concrete
   mechanisms the section describes.
4. **Extract at least one Verification Quote** — copy the exact sentence(s)
   from the source that most directly support the description. Record the
   document filename and the section it came from.
5. **If no matching section exists**, do not force it — write the feature's
   `F_ID` into a closing "Not Found" list with a one-line reason instead of
   producing a block for it.

---

## OUTPUT FORMAT

One block per feature:

```markdown
## F<N> — <Feature Name>

**Product:** <Product Name>
**Base Section:** `<anchor or heading>`
**Related Sections:** `<other anchor>` (omit if there is only one)

### Extended Description

<Several sentences, grounded in the source text.>

### Key Capabilities

- **<Capability>** — <one line>

### Verification Quote

> "<exact text copied from the source>"
> — Source: <document filename>, section <anchor or heading>
```

Repeat for every feature that has a genuine match. Then, if any features had
none:

```markdown
## Not Found

| F_ID | Feature | Reason |
|------|---------|--------|
| F99  | Some Feature | No section of the source document describes this capability |
```

---

## RULES

1. **Every quote must be copied verbatim** — a real implementation checks
   this mechanically against the source document and rejects any quote that
   does not match exactly (tolerant only of whitespace differences).
2. **Never invent a section or anchor** — if you cannot identify one, the
   feature belongs in "Not Found", not in a block with a guessed anchor.
3. **The Extended Description is a paraphrase; the Verification Quote is
   not** — do not blend them. The quote block must be copy-pasted text only.
4. **Every feature in the input list appears exactly once**, either as a
   `## F<N>` block or in the "Not Found" table. None may be silently
   dropped.
5. **Table/section content in EN**, matching the rest of this project's
   reference data regardless of the source document's original language.

---

**Prompt Version:** 1.0
**Related:** `extend_features.md` (an interactive, step-by-step variant of
this same idea)
