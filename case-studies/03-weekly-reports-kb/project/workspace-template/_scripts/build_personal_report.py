# -*- coding: utf-8 -*-
"""Generates a per-person activity report straight from the knowledge base.

Why this reads the INDEX and not the source Markdown: an earlier approach (in
the project this method was extracted from) matched a person by scanning
Markdown text for their first name and grafting on whichever lines happened to
follow. That produced files named after sentence fragments and page headers,
and one real person scattered across three files under three different
misspellings of their own name.

Here, `pic` is already a list of canonical names, resolved once during
`build_kb/03_validate` against your own roster. Matching is therefore exact,
and the content shown is `activity` — a verbatim quote — not a guess about
which nearby line belonged to that person.

Usage:
    python _scripts/build_personal_report.py "Elena Rossi"
    python _scripts/build_personal_report.py "Elena Rossi" --since 2025-01-01
"""

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "_kb" / "activities.jsonl"
OUT_DIR = ROOT / "_outputs" / "personal"

sys.path.insert(0, str(ROOT / "_scripts"))
import kb_query  # noqa: E402

SECTION_LABELS = {
    "finance": "Financial Index",
    "business_unit": "Business Unit Support",
    "product": "Product Management",
    "event": "Events & Workshops",
    "case_study": "Case Studies",
}


def main():
    ap = argparse.ArgumentParser(description="Per-person activity report from the knowledge base")
    ap.add_argument("person", help="canonical full name, exactly as it appears in pic")
    kb_query.add_filters(ap)
    args = ap.parse_args()

    rows = kb_query.load()
    if rows is None:
        return 1

    hits = [r for r in kb_query.narrow(rows, args) if args.person in (r.get("pic") or [])]
    if not hits:
        print(f"No entries found for '{args.person}' with the given filters.")
        return 0

    by_period = defaultdict(list)
    for r in sorted(hits, key=lambda r: (r.get("report_date", ""), r["entry_id"])):
        by_period[r["entry_id"][:8]].append(r)

    out = [f"# Activity report — {args.person}\n",
           f"**Entries:** {len(hits)} · **Periods active:** {len(by_period)} · "
           f"**Narrowed by:** {kb_query.describe_conditions(args)}\n"]

    for period in sorted(by_period):
        period_rows = by_period[period]
        out.append(f"## {period} ({period_rows[0].get('report_date', '—')})\n")
        for r in period_rows:
            label = SECTION_LABELS.get(r["section"], r["section"])
            client = f" — {r['client']}" if r.get("client") not in (None, "—") else ""
            out.append(f"**{label}{client}** (`{r['entry_id']}`)\n")
            out.append(f"> {r['activity']}\n")
        out.append("")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    slug = args.person.lower().replace(" ", "_")
    target = OUT_DIR / f"{slug}.md"
    target.write_text("\n".join(out), encoding="utf-8")

    print(f"OK  {args.person}: {len(hits)} entries across {len(by_period)} periods")
    print(f"    {target.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
