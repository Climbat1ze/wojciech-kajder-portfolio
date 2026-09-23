# Sales Pipeline Reference — Demo Instance

**Layer 0 — answers: where am I?**

---

## What this is

The identical engine from `../workspace-template/`, run end to end against a small, entirely
fictional dataset — a made-up company ("Northwind") selling a made-up product line, with invented
account names, invented people, and invented numbers. Nothing here is real data from any company.

This folder exists so you can see the whole pipeline work — spreadsheet in, HTML report out —
before you touch your own data.

## What's fictional here

| Element | Fictional value used |
|---|---|
| Company | "Northwind" (a made-up sales organization) |
| Product | A made-up device/platform line ("Platform License Tier," "IoT Device Manager," etc.) |
| Business units | NW-US, NW-EU, NW-APAC, NW-LATAM — invented regional office codes |
| People | Jordan Lee, Priya Sharma, Marcus Webb, Elena Novak, Sam Okafor, Diego Fuentes, Aiko Tanaka (sales); Wei Chen, Fatima Al-Sayed, Lucas Bianchi, Nadia Kovacs (delivery) — all invented names |
| Accounts | Northwind Grocers, Harborline Shipping, CedarPoint Health Network, etc. — all invented |

## What actually ran

This is not a hand-written mockup of what a report *would* look like — the three pipeline stages
were actually executed against `_input/pipeline_20260901.xlsx` (a fictional 20-row sales sheet
plus a 7-row delivery-projects sheet), and every file under `stages/*/output/` and
`_output/_final/` is real output from that real run.

The one exception: `_output/_final/pipeline_report_20260916.html` is a hand-built stand-in for
"the previous week's report" — used only so the real 2026-09-23 run has something to compute a
week-over-week delta against. It says so at the top of the file. Everything else is a genuine
script output.

## How to reproduce it yourself

```bash
cd _demo
npm install          # installs the xlsx package
node _scripts/stage_01_convert.js
node _scripts/stage_02_process.js
node _scripts/stage_03_report.js
```

(There's no Stage 0 run here — the fictional spreadsheet was placed directly in `_input/` rather
than copied from a watched downloads folder, since that step is about your own environment, not
the method.)

## Tour

| If you want to see... | Open |
|---|---|
| The raw fictional spreadsheet, converted | `stages/01_convert/output/pipeline_data.md` |
| What normalization actually changed | `stages/02_process/output/validation_report.md` |
| The two people who *aren't* normalized cleanly (a deliberate example) | Look for "Casey Whitfield" (an external partner referral, not on the team roster) and "OPS" (a queue label, not a person) in the validation report |
| The finished report | `_output/_final/pipeline_report_20260923.html` — open it in a browser |
| The filled-in config tables that made normalization work | `_config/*.md` |

---

**Method:** filesystem-as-orchestration for staged data pipelines.
