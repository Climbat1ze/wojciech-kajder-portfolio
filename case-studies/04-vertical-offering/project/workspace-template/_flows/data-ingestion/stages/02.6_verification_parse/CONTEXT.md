# Stage 02.6 — Verification Parse

**Layer 2 — Stage contract.**

---

## What this stage is

The only place in this project where `Status` becomes `VERIFIED` for an
AI-proposed row. It parses a reviewer's free-text reply to a Stage 02.5
email, resolves each item number against **that same email's own numbering**
(`_flows/data-ingestion/stages/02.5_verification_export/output/export_report.json`
for this `--pm`), and applies one of three verdicts per item.

```bash
node run.js --pm PM01 --email-file reply.txt
node run.js --pm PM01 --email "accept 1, 2. reject 3 (duplicate of F04)."
```

## The three verdicts

| Verdict | Effect on `_state/verification_queue.md` | Effect on `_data/*.md` |
|---|---|---|
| **accept** | moved to Resolved, `Decision = ACCEPTED` | the row's `Status` flips `PROPOSED -> VERIFIED` |
| **correct** | stays in the Active Queue | nothing — fix the wording by hand, then re-run Stage 02.5 for this reviewer so they confirm the corrected wording |
| **reject** | moved to Resolved, `Decision = REJECTED`, with the reason | **nothing** — the row is left at `Status = PROPOSED` forever |

**Why `correct` exists as a third option, not just accept/reject:** a
reviewer who finds a proposal 90% right but wrongly worded should not have to
choose between accepting bad wording and losing the row's queue position by
rejecting it. `correct` keeps the item live for a follow-up round instead of
forcing a binary call.

**Why a rejected row is not deleted or marked `REJECTED` in `_data/*.md`:**
`_data/*.md` has exactly three `Status` values across this whole project —
`VERIFIED`, `PROPOSED`, `TBC` (hardware only) — see `_data/README.md`. Adding
a fourth, `_data/*.md`-only value for "a human said no" would fork the status
model for one narrow case. The rejection and its reason are fully preserved,
just in `_state/pm_responses.md` instead. A row you find at `PROPOSED` for a
long time might be unreviewed, or it might be something a reviewer already
rejected — check `pm_responses.md` to tell the difference.

## Inputs

| Input | Purpose |
|---|---|
| `--pm <PM_ID>` | whose reply this is |
| `--email <text>` or `--email-file <path>` | the reply itself |
| `../02.5_verification_export/output/export_report.json` | the number -> Entry_ID map for this reviewer's last export |
| `_state/verification_queue.md` | Active Queue rows to resolve |
| `_data/*.md` | rows to flip to `VERIFIED` on acceptance |

## Outputs

| Output | Path |
|---|---|
| `_state/verification_queue.md` | Active -> Resolved moves |
| `_data/*.md` | `Status` flips for accepted rows |
| `_state/pm_responses.md` | one new `RESP-###` row per parse, listing every accept/reject/correct decision with its reason |
| `output/parse_report.json` | stage envelope |

## Recognised reply formats (English and Polish)

```
accept 1, 2, 5
akceptuj 1, 2

correct 3 (title should say "bulk enrollment", not "single enrollment")
popraw 3 (co zmienić)

reject 4 (duplicate of F04)
odrzuć 4 (duplikat F04)
```

A number not mentioned at all simply stays pending — there is no
"unanswered = rejected" rule anywhere in this system.
