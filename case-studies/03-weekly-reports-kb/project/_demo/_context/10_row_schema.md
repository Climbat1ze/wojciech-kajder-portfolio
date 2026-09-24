# Row schema (canon)

**Layer 3 — reference material. Stable between runs.**

One row of `_kb/activities.jsonl` = **one activity**. Every source type (`.msg`,
`.docx`, `.pptx`) is reduced to this same shape by a different extraction contract —
the contracts differ, the schema does not.

---

## Status of this canon

This is the **only** authoritative field list. Changing it is a deliberate decision,
not a routine edit — if another team builds their own base with this same method and
this same schema, one query can run against the sum of both bases (see
`00_method.md` §7). Reconciling mismatched schemas after the fact is a debt that
grows with every base added — that is the entire reason this file exists.

---

## Fields — 15

| Field | Holds | Set by | Required |
|---|---|---|---|
| `entry_id` | stable identifier for the row | script | yes |
| `source_file` | name of the source document | script | yes |
| `source_type` | `msg` / `docx` / `pptx` | script | yes |
| `report_date` | document date (ISO `YYYY-MM-DD`) | model | yes |
| `section` | kind of entry — see the closed vocabulary below | model | yes |
| `object_name` | subject of the entry: unit code / product name / event name | model | yes |
| `pic` | responsible people (list) | model | yes (may be `[]`) |
| `client` | client, if one is named | model | yes (may be `—`) |
| `bo` | opportunity/deal ID, if one is given | model | no |
| `category` | first-level category from `20_taxonomy.md` | enrichment | yes |
| `subcategory` | second-level detail of the **same** category | enrichment | no |
| `category_conf` | source + confidence of the assignment | enrichment | yes |
| `activity` | full description, **copied 1:1** | model | yes |
| `activity_sha256` | SHA-256 of `activity` — proof the field was never touched again | script | yes |
| `raw_ref` | pointer into `_kb/md/` (full surrounding context) | script | yes |

### Two naming decisions worth stating explicitly

- **`activity_sha256`, not some other name.** The hash's name must match the field it
  hashes, or the schema points at a field that doesn't exist. If you rename
  `activity`, rename its hash the same run.
- **No separate `week` field.** If your source documents are weekly, the year and
  week belong inside `entry_id` (e.g. `2025-W05-BU-02`), and `report_date` already
  gives the full date. A separate field would be a third copy of the same fact — and
  a third place for it to drift from the other two.

---

## `entry_id` — construction

```
{document_key}-{section_code}-{number}
```

Example: `2025-W05-BU-02`

- **`document_key`** — a stable identifier for the source document:
  - a recurring report → `{YYYY}-W{NN}`, where the year comes from the input
    directory (never the filename — see below) and the week number from the
    filename;
  - other sources (e.g. a case study) → `{YYYY-MM-DD}-{short-slug}`.
- **`section_code`** — a two-letter code from the section table below.
- **`number`** — the entry's position **within its own section** in this document,
  counted from 1, zero-padded to two digits.

### Why not the filename

The filename looks like a natural key and is not safe to use as one: recurring
reports frequently reuse identical filenames across periods or years (a week 8
report from two different years can easily share one filename), and naming
conventions for the same kind of document drift over time as export tools change.
A key based on the filename would silently merge two different documents into one
identity, and an upsert would overwrite one period's data with another's without a
trace. The **business key** here is the period the document covers, not its
filename; the actual filename is preserved in `source_file`, so provenance is not
lost.

### Known limitation: period aggregation assumes a `YYYY-WNN`-shaped key

`kb_stats.py --group-by period`, and the `value_ranking` flow's engagement and
coverage calculations, all derive a row's reporting period from the **first 8
characters of `entry_id`**. That is correct for a recurring `{YYYY}-W{NN}` key
(`2025-W05-BU-01`[:8] = `2025-W05`) but produces a meaningless fragment for a
date-slug key from a non-recurring source such as a case study
(`2025-02-20-bracken-manufacturing-case-study-CS-01`[:8] = `2025-02-`, not a real
period). This is a real, inherited limitation of the method as described here,
not something this reference implementation has fixed — a corpus mixing
recurring and non-recurring document keys will show a garbled "period" for the
non-recurring ones in exactly those two places. If your own corpus mixes both
kinds of source, either give non-recurring documents a period-shaped key too
(at the cost of a slightly fictional "period"), or treat any aggregation by
period as valid only for recurring sources until this is addressed properly.

### Gate: one document per key

Two files producing the same `document_key` must **stop the run**. Do not pick
"whichever has the newer modification date" — that exact shortcut is how silent
overwrites happen. A human must point at the canonical document; the other moves to
an archive location.

### Stability

`entry_id` must come out identical when the same document is processed again. That
is what turns writing to the index into an **upsert** instead of a duplicate
generator — the precondition for safe resumability. Stability additionally depends
on entry order within a section staying fixed between runs; if a change to the
extraction contract reorders entries, re-index deliberately rather than upserting.

---

## `section` — closed vocabulary (example)

The example below matches a typical recurring status report. Adjust the list to
your own report's real sections — the discipline (a **closed**, versioned list) is
what matters, not these exact five values.

| Value | Code | Covers |
|---|---|---|
| `finance` | `FI` | financial figures for the reporting period |
| `business_unit` | `BU` | activity reported per regional/organizational unit |
| `product` | `PM` | updates from product or workstream owners |
| `event` | `EV` | workshops, training, market signals |
| `case_study` | `CS` | case studies (typically from `.pptx` sources) |

Values outside this list are not allowed. A new kind of entry is a deliberate
extension of the vocabulary and its code, never a value invented mid-run.

---

## `category_conf` — format

```
{source}/{confidence}
```

- **source:** `stated` (directly in the document) · `external` (established from
  outside sources) · `to_confirm` (needs a human decision)
- **confidence:** `high` · `medium` · `low`

Examples: `stated/high`, `external/medium`, `to_confirm/low`.

When `category` = `TBD`, `category_conf` must be `to_confirm/low` and the entry
belongs in `_kb/_registry/pending_review.md`.

---

## Value rules

1. **`activity` is copied 1:1.** No summarising, no paraphrasing, no filling gaps.
   Original language preserved, abbreviations not expanded. This field is the entire
   value of the base — a field you're allowed to reword stops being evidence.
2. **Empty value → `—`.** Not `null`, not `""`, not a missing key. One consistent
   representation of "nothing here" keeps filters simple.
3. **Cut off or unreadable → `[UNREADABLE]`**, inline, at the point of the gap. Do
   not guess what was there.
4. **`pic` is always a list**, even for one person. Empty = `[]`.
5. **`activity_sha256` is computed once, from the final `activity`, and is never
   recomputed during enrichment.** Enrichment adds `category` / `subcategory` /
   `category_conf` and touches nothing else — the hash is what makes that provable,
   not merely asserted.

---

## Example row

```json
{
  "entry_id": "2025-W05-BU-02",
  "source_file": "W05_Lighthouse_Program_Weekly_Note.md",
  "source_type": "msg",
  "report_date": "2025-01-31",
  "section": "business_unit",
  "object_name": "MSNA",
  "pic": ["Sam Okafor", "Elena Rossi"],
  "client": "Trailhead Logistics",
  "bo": "—",
  "category": "Logistics & Transportation",
  "subcategory": "Freight & Trucking",
  "category_conf": "stated/high",
  "activity": "Trailhead Logistics – fleet console pilot. Rolled out enrollment profile to 40 handheld scanners across the Denver depot; two devices failed enrollment due to an expired certificate, reissued and reprocessed same day.",
  "activity_sha256": "6a1c…",
  "raw_ref": "_kb/md/2025-W05.md#2025-W05-BU-02"
}
```

---

**Basis:** `00_method.md` §4, extended with `activity_sha256` and `raw_ref` (worth
keeping even though the method summary omits them for brevity) and `subcategory`
where a two-level taxonomy is in use.
