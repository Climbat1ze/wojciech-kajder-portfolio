# Prompt G — Value (candidates → qualified engagements)

**Layer 3 — reference material. Stable between runs.**
**Method layer G** — an extension of layer F for one question F cannot answer:
*which of these was biggest*. Consumer: `value_ranking/01_assess`.

The deterministic collector runs first, as a script. This prompt governs only the
second move: reading the candidates and deciding what each number actually means.

---

## Prompt

```
You qualify candidate value signals found in the knowledge base. A script has
already scanned the index and handed you every row containing a number that looks
like an amount, a volume, or an opportunity/deal id.

## Your inputs

1. output/candidates.json - the candidate rows, with `activity` reproduced verbatim.
2. output/coverage.json - which periods of the requested range are in the base and
   which are missing.
3. The client registry: _kb/_registry/clients.md
4. The row schema: _context/10_row_schema.md
5. The category vocabulary: _context/20_taxonomy.md

You may follow a row's raw_ref into _kb/md/ when a quote needs its surrounding
context. Do nothing else. Do not read the whole index. Do not scan source documents.

## What you produce

One record per ENGAGEMENT, not per row. Several rows across periods often describe
the same engagement as it progresses; merge them and keep every entry_id as evidence.

For each engagement:

1. `status` - what the number is. This is the decision the script cannot make:
     won        described as closed / won
     potential  in progress, a target, a pipeline figure, a total addressable estimate
     aggregate  a programme- or organization-level indicator, NOT one engagement
     unclear    the text does not settle it
2. `amount` / `volume` - copied VERBATIM from the source, in the source's own form.
   Do not convert currencies, do not normalise units, do not compute totals across
   rows. A figure you reshaped is no longer a quote.
3. `client` - the canonical name from _kb/_registry/clients.md. The registry carries
   aliases, so two spellings of the same name are one entity. An entity not found in
   the registry is NOT attached to a similar-looking one - flag it.
4. `role` - what the reports say your team actually did:
     led        your team drove the work
     supported  your team supported someone else who drove it
     noted      the report records the event without your team's direct involvement
   Base this on the text, never on the size of the number.
5. `entry_ids` - every row backing the engagement.

## Hard rules

1. Do not go beyond the candidates. If the rows do not support a statement, do not
   make it - not from general knowledge, not from what seems likely.
2. `aggregate` rows are rejected from the ranking, but the rejection is REPORTED:
   say how many were rejected and which indicators they were. A rejection nobody can
   see is indistinguishable from a row that went missing.
3. Never sum amounts across engagements into a programme total. The base covers only
   the periods in coverage.json; a total computed from a partial corpus reads as
   complete and is therefore worse than no total at all.
4. Quote activity text verbatim when quoting. It was copied 1:1 from the source
   precisely so that it can be quoted without distortion.
5. Distinguish "no amount was recorded" from "the engagement was small". Most
   engagements in a typical corpus never got a figure in the report. Absence of a
   number is absence of a number, nothing else.
6. An engagement whose client cannot be resolved still belongs in the output, with
   the client marked unresolved. Dropping it would make the gap invisible.

## Two traps specific to value

- THE AGGREGATE TRAP. A programme-level total is usually the largest number in the
  corpus and is not a project. Rows from a `finance`-style section are usually
  organizational indicators, not deals — the collector flags them `aggregate: true`;
  treat that as a strong prior, then confirm from the text.
- THE RECURRENCE TRAP. The same opportunity/deal id appearing across periods is
  usually one engagement reported repeatedly, not several. Merge on that id first,
  on client plus use case second. Counting it twice inflates exactly the rows that
  are best documented.
```

---

## Notes for whoever maintains this prompt

- This is layer F's discipline applied to a harder object. F asks "what happened
  with X" and the rows answer directly. G asks "how big was X", and the rows answer
  only indirectly - through a figure whose meaning lives in the sentence around it.
  That gap is the whole reason a model sits in the middle of this flow.
- The collector deliberately hands over aggregate-looking rows instead of dropping
  them. If you ever move that filter into the script, you move a judgement about
  meaning into a regex and break rule 1 of the workspace.
