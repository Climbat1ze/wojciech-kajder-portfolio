# Prompt C — Extraction (one document → entries)

**Layer 3 — reference material. Stable between runs.**
**Method layer C** (`_context/00_method.md` §3). Consumer: `build_kb/02_read`.

Written in English on purpose: this file is loaded once per document across a large
corpus, and English tokenizes more efficiently than most other languages.

---

## Prompt

```
You convert the plain text of ONE company report into a fixed record schema.

You READ FOR MEANING, like a person. You do NOT use regular expressions, string
splitting, or code to cut the content. Document structure varies between reports —
tables have different row counts, cells span multiple lines, sections are sometimes
missing. Pattern matching fails on this. Reading does not.

## Your inputs

1. The document text (given to you below).
2. The row schema: _context/10_row_schema.md
3. The team roster (CONTROLLING FILE — the single definition of who is on the
   team): _config/teamRoster.md (demo instance: the fictional "Lighthouse
   Program" roster). If your roster lists nicknames or short forms next to full
   names, treat a nickname as an alias of the name it follows.
4. The variant registry: _config/teamMembers.md — ONLY distorted spellings found
   in documents, plus values that are not people. It holds no roster of its own.
5. If your reports name business units or teams by code: _config/businessUnitCodes.md

Do not look for other files. Do not re-derive facts that these files already state.

## What one record is

ONE RECORD = ONE ACTIVITY. In practice: one table row, or one bullet, or one unit's
update. If a single cell describes three separate activities for three different
clients, that is three records, not one.

## Report structure you will encounter

Adjust this table to your own report's real sections — see
_context/10_row_schema.md for the closed vocabulary you must pick from.

| Section heading in document | section value | Contains |
|---|---|---|
| Financial Index | finance | figures for the reporting period |
| Business Unit Support | business_unit | per-unit activity |
| Product Management | product | updates from product/workstream owners |
| Events | event | workshops, training, market signals |

Inline field markers inside an entry (for example "Opportunity:", "Use case:") belong
to the activity text. Keep them.

## Fields you produce per record

Produce ONLY these seven. The other schema fields are filled by scripts or by a
later step — leave them out entirely, do not invent them.

- report_date    the document's date, format YYYY-MM-DD
- section        one of the values in the closed vocabulary above
- object_name    the subject of the entry: unit code, product name, or event name
- pic            list of responsible people, canonical names from your roster
- client         the client, if one is named
- bo             opportunity/deal ID, if one is given
- activity       the full description, rewritten 1:1

## Hard rules

1. activity is COPIED, not summarised. Do not paraphrase, shorten, expand, fix
   grammar, or "clean up" the text. Keep the original language. Do not expand
   abbreviations. This field is the entire value of the database — a field you
   are allowed to reword stops being evidence.
2. Empty value → write exactly: —
   (an em dash, not "null", not "N/A", not an empty string)
3. Text that is cut off or unreadable → write exactly: [UNREADABLE]
   at the point of the gap, inside activity. Do not guess what was there. This is a
   data token defined by the schema, not a word to translate.
4. pic is ALWAYS a list, even for one person. No one responsible → []
5. For pic, resolve names in this order and no other:
   a. Match against the roster in the CONTROLLING FILE (full names and any aliases
      it lists). Match → write that canonical name.
   b. No match → check _config/teamMembers.md for a distorted-spelling entry.
      Match → write the canonical name it points to.
   c. Still no match → write the name exactly as it appears in the document and
      add it to the anomaly list. Do NOT guess which rostered person was meant,
      and do NOT invent a shortened form.
   The roster lives only in the controlling file. Never treat the variant
   registry as a list of team members.
6. Role labels or team names that are not individual people are NOT people. Do not
   put them in pic. The variant registry lists the known ones.
7. Keep the order of entries as they appear in the document.
8. Leave category, subcategory and category_conf out entirely. A separate
   enrichment step fills them. Do not attempt to classify the entity here.

## Output

A JSON array of record objects, in document order.

## Quality control — required, at the end of your output

After the array, output a QUALITY CONTROL block containing:

- record count per section
- list of records where pic is empty
- list of records where client is empty
- every occurrence of [UNREADABLE], with its record index
- an anomaly list: names not found in the registry, sections you expected but did
  not find, entries you were unsure how to split, anything that looked wrong

## Gate — stop condition

If a section that the document clearly contains produced ZERO records, or if a
section you expected is missing and you cannot explain why in the anomaly list:
STOP. Output what you have, state plainly that the extraction is incomplete and
why. Do not continue, do not fill the gap with a guess, do not silently produce a
shorter result. A halted run is cheap. A quietly wrong database is not.
```

---

## Notes for whoever maintains this prompt

- The section headings and inline markers are meant to be recovered from *your*
  documents' real structure — describe what your reports actually contain, this is
  not a template to leave unedited.
- `case_study` is in the section vocabulary for `.pptx`-style sources; a recurring
  status report will not normally produce it.
- If extraction quality drifts, fix **this file**, not the output. Editing output
  repairs one run; editing the prompt repairs every run that follows.
