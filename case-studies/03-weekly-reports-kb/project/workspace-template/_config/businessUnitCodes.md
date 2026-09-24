# Business unit / team codes (canon)

**Layer 3 — reference material.**

---

## Status: fill this in only if your reports use codes

If your source reports refer to regional teams, subsidiaries, or business units by a
short code (the kind of thing that shows up in an `object_name` field for a
`business_unit`-section entry), list the valid codes here. If they don't, delete this
file and remove the `business_unit` section from `_context/10_row_schema.md` and
`_context/00_method.md` §4 — a section nobody ever populates is worse than no
section, because its permanent emptiness stops looking like a signal of anything.

## Why this is a flat list, not a lookup with descriptions baked into other files

A copy of "what code X means" pasted into some other document (a report template, a
prompt, a slide) is exactly how this kind of canon rots: the copy drifts the moment
this file changes, and nobody notices because nothing points back here. Keep the
expansion of each code in this one file, and have everything else — prompts, scripts,
report templates — read it from here rather than repeat it.

## Codes

*(empty — fill in your own; the format below is a suggestion)*

| Code | Full name | Notes |
|---|---|---|
| | | |

## Superseded / retired codes

*(a place to record codes that used to be valid and no longer are, so a validator can
tell "wrong code" apart from "code that was correct once" — optional, delete this
section if you don't need the distinction)*

| Code | Retired | Replaced by |
|---|---|---|
| | | |

---

**Consumed by:** `_flows/build_kb/stages/03_validate` (if you wire the check in),
`_prompts/C_extraction.md`.
