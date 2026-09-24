# Extend Features — Interactive Prompt

**Purpose:** Generate extended descriptions for features based on source
documentation, with verification quotes and related sections — the same
goal as `enrich_features.md`, structured as an interactive, step-by-step
walkthrough instead of a single-shot batch prompt.

**Output:**
- `[product]_extended.md` — extended descriptions registry.
- Updated `[product].md` — original features file with an
  `Extended_Description_Ref` column.

---

## STEP 0 — Choose a product (interactive)

Show the user the available feature catalogues:

```markdown
## Choose a product/module to process

Available files under `_data/features/`:

| # | Product | Features file | Feature count | Documentation source |
|---|---------|---------------|----------------|------------------------|
| 1 | Example Product | `example_module.md` | (count) | (path to source doc) |

**Enter a number or a product name:**
```

After the reply:
- Map the choice to a filename.
- If no documentation exists for a chosen product, tell the user and only
  continue if they confirm.
- Move to Step 1.

---

## STEP 1 — Load data

### 1.1 Load the features file

Read `_data/features/[chosen_product].md`. Parse the table; extract
`F_ID`, `Feature`, `Product`, `Description`, `Source`, `Status`.

### 1.2 Load the source documentation

Read the document `_data/sources.md` cites for this product's features.
Verify: the file exists, has real content (not near-empty), and contains
identifiable sections (headings).

---

## STEP 2 — Map features to documentation sections

For each feature:

### 2.1 Identify the base section

Use keywords from the `Feature` name to search the documentation's
headings. Record the best match.

```json
{
  "F_ID": "F01",
  "Feature": "Example capability name",
  "base_section": "Heading or anchor that best matches",
  "related_sections": ["Other relevant heading"]
}
```

### 2.2 Identify related sections

Note any other sections that add context to the same feature.

---

## STEP 3 — Extract content

### 3.1 Extract the base section's content

Find the section, extract its full text up to the next heading, preserving
original Markdown formatting.

### 3.2 Extract related sections' content

Same as above, for each related section; combine into a coherent whole.

### 3.3 Example extracted content

```markdown
### Extended Description

<Several sentences describing what the capability does, drawn from the
actual documentation text — not invented, not a restatement of the one-line
catalogue Description.>

### Key Capabilities

- **<Capability>** — <one line>
- **<Capability>** — <one line>
```

---

## STEP 4 — Verify (critical)

Find a **direct quote** from the documentation that confirms the feature.

### 4.1 Search strategy

1. Use the feature name as a search query.
2. Search the whole document text.
3. Find the sentence/paragraph that directly describes the feature.

### 4.2 Verification quote format

```markdown
### Verification Quote

> "Exact sentence copied from the documentation, word for word."
> — Source: [document filename], section [heading or anchor]
```

### 4.3 If no quote can be found

- Use the closest related section instead.
- Mark it `[INDIRECT]` in the quote block.
- Add a comment in the output noting the limitation.

---

## STEP 5 — Generate outputs

### 5.1 Generate `[product]_extended.md`

```markdown
# [Product Name] — Extended Descriptions Registry

**Generated:** YYYY-MM-DD
**Source Documentation:** `[path]`
**Features Reference:** `_data/features/[product].md`

---

## F01 — Example capability name

**Product:** Example Product
**Base Section:** `[heading or anchor]`
**Related Sections:** `[other heading]`

### Extended Description

[Content faithfully drawn from the documentation]

### Key Capabilities

- Capability 1
- Capability 2

### Verification Quote

> "Direct quote from documentation"
> — Source: [filename], section [heading]

---

## F02 — ...
```

### 5.2 Update `[product].md`

Add an `Extended_Description_Ref` column to the existing table:

**Before:**
```markdown
| F_ID | Feature | Product | Description | Source | Status |
```

**After:**
```markdown
| F_ID | Feature | Product | Description | Source | Status | Extended_Description_Ref |
|------|---------|---------|-------------|--------|--------|-------------------------|
| F01  | Example capability name | Example Product | What it does | S01 | VERIFIED | [example_module_extended.md](example_module_extended.md#F01) |
```

### 5.3 Save both files

- `_data/features/[product]_extended.md` (new file)
- `_data/features/[product].md` (updated file)

---

## STEP 6 — Summary

```markdown
## Extend Features — Complete

**Product:** [Product Name]
**Features Processed:** N
**Extended File:** `_data/features/[product]_extended.md`
**Updated File:** `_data/features/[product].md` (added Extended_Description_Ref column)

### Summary

| Metric | Value |
|--------|-------|
| Total features | N |
| Base sections mapped | N |
| Related sections added | N |
| Verification quotes | N |

### Next steps

1. Review extended descriptions in `[product]_extended.md`.
2. Verify quotes match feature descriptions.
3. Use extended descriptions in verification emails and vertical builds.
```

---

## Checklist

- [ ] User chose a product from the list
- [ ] Features file loaded correctly
- [ ] Source documentation loaded correctly
- [ ] Every feature has a Base Section
- [ ] Every feature has Related Sections (if applicable)
- [ ] Every feature has a Verification Quote
- [ ] Extended descriptions are full content, not shortened summaries
- [ ] Original formatting preserved
- [ ] `Extended_Description_Ref` column added to the features file
- [ ] References in the format `[product]_extended.md#F_ID`
- [ ] Both files saved correctly

---

## Error handling

### No documentation for the product

```markdown
Note: no documentation source is registered for [Product Name].

Continue with available sources anyway?
- [ ] Yes, continue with what's available
- [ ] No, choose a different product
```

### A feature has no matching section

```markdown
Warning: no matching documentation section found for feature F<N> — <Feature Name>.

Options:
1. Skip this feature (marked NO_DOCS)
2. Manual section assignment (provide the section)
3. Use a general product-overview section instead
```

---

**Related:** `enrich_features.md` (the single-shot batch version of this
same method)
