# Prompt D — Enrichment (unique entities → category)

**Layer 3 — reference material. Stable between runs.**
**Method layer D** (`_context/00_method.md` §3). Consumer: `index_kb/01_enrich`.

Runs on the **whole corpus**, not per document: one decision per unique entity,
reused by every record naming that entity.

---

## Prompt

```
You assign a category to each entity in a list of unique clients.

## Your inputs

1. The entity list (given to you below): unique client names collected from all
   extracted records, each with a few sample activity texts for context.
2. The controlled vocabulary: _context/20_taxonomy.md
3. The existing entity registry: _kb/_registry/clients.md

Do not look for other files.

## Order of operations — follow exactly

For each entity, in this order:

STEP 1. Look the entity up in _kb/_registry/clients.md, case-insensitively,
        against both canonical names and aliases.
        - Found → reuse its canonical name and its category VERBATIM. Do not
          re-decide. Go to the next entity.
        - Not found → continue to STEP 2.

STEP 2. Determine the canonical name: the company's full legal or commonly used
        form. List every spelling variant you saw in the documents as aliases.

STEP 3. Determine category — the FIRST-LEVEL value, exactly one, copied
        character-for-character from the allowed values in _context/20_taxonomy.md.
        Never invent a name. Never abbreviate.

STEP 4. Determine subcategory — the SECOND-LEVEL detail, at most one, and it MUST
        be one of the details listed under the category you chose in STEP 3.
        A detail belonging to a different category is invalid.
        Unsure → leave subcategory empty. An empty subcategory is fine; a wrong
        one is not.

STEP 5. Write category_conf as {source}/{confidence}
        source:     stated       — the documents state it
                    external     — you know it from general knowledge of the company
                    to_confirm   — needs a human decision
        confidence: high | medium | low
        These six tokens are fixed values. Do not translate or vary them.

## Hard rules

1. The dimension is the CLIENT'S OWN INDUSTRY/DOMAIN, not what they use your
   product for. A chemical manufacturer rolling out warehouse handhelds is
   Manufacturing, not Logistics & Transportation.
2. ONE category per entity. Not a list, not two.
3. Cannot decide → category: "TBD", category_conf: "to_confirm/low".
   Do NOT force a guess. TBD is visible and correctable; a wrong category is
   neither, and it silently corrupts every query about that category.
4. A catch-all value like "Other" (if your taxonomy has one) is a REAL value of the
   standard, meaning "outside the other named categories". It is not a substitute
   for TBD. TBD means "I do not know".
5. Internal entries with no external client (internal training, own tooling)
   get client "—" and category "—".
6. Decide ONCE per entity. Do not repeat the decision per record.

## Output

A JSON array, one object per entity:

  { "entity": "<as given to you>",
    "canonical_name": "...",
    "aliases": ["...", "..."],
    "category": "...",
    "subcategory": "...",
    "category_conf": "stated/high" }

## Quality control — required, at the end of your output

- count of entities resolved from the registry (STEP 1) vs newly decided
- every entity with category "TBD", with the reason you could not decide
- every entity where you proposed a NEW canonical name not in the registry
- every subcategory you left empty although the category was certain
```

---

## Notes for whoever maintains this prompt

- The output of this step never touches `activity`. Enrichment adds three fields and
  reads everything else. `activity_sha256` exists so that this is provable, not
  merely asserted.
- Entities whose proposed canonical name is not in `clients.md` go to
  `_kb/_registry/pending_review.md` by the indexing script. That is a **review
  queue, not a gate** — the record still gets its proposed name and still enters the
  index.
- If the same company keeps coming back as TBD, the fix is a registry entry, not a
  better prompt.
