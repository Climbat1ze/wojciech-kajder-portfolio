# -*- coding: utf-8 -*-
"""Builds a running index of processed documents: one row per period.

Deliberately generic: no KPI figures, no targets, no organization-specific
metrics. Those belong to your own reporting layer, built on your own numbers
— see `_config/businessUnitCodes.md` and the note in the top-level README
about why this reference implementation stops at the knowledge base rather
than reaching into a company-specific KPI report. What this script gives you
is the shape that any such report would sit on top of: per period, how many
entries landed in each section, and which clients and categories were active.

Usage:
    python _scripts/build_weekly_index.py
"""

import sys
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_outputs" / "weekly_index.md"

sys.path.insert(0, str(ROOT / "_scripts"))
import kb_query  # noqa: E402

EMPTY = ("", "—", None)


def main():
    rows = kb_query.load()
    if rows is None:
        return 1

    by_period = defaultdict(list)
    for r in rows:
        by_period[r["entry_id"][:8]].append(r)

    out = ["# Weekly index\n",
           f"**Periods:** {len(by_period)} · **Total entries:** {len(rows)}\n"]

    for period in sorted(by_period):
        period_rows = by_period[period]
        sections = defaultdict(int)
        clients = set()
        categories = defaultdict(int)
        for r in period_rows:
            sections[r["section"]] += 1
            if r.get("client") not in EMPTY:
                clients.add(r["client"])
            if r.get("category") not in EMPTY:
                categories[r["category"]] += 1

        out.append(f"## {period}\n")
        out.append(f"**Entries:** {len(period_rows)} · **Distinct clients:** {len(clients)}\n")
        out.append("| Section | Entries |")
        out.append("|---|---:|")
        for section, n in sorted(sections.items(), key=lambda kv: -kv[1]):
            out.append(f"| {section} | {n} |")
        if categories:
            out.append("\n**Categories touched:** "
                        + ", ".join(f"{c} ({n})" for c, n in
                                    sorted(categories.items(), key=lambda kv: -kv[1])))
        out.append("")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(out), encoding="utf-8")

    print(f"OK  {len(by_period)} periods, {len(rows)} entries")
    print(f"    {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
