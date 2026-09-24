# -*- coding: utf-8 -*-
"""Generates a report for one category (or subcategory) from the knowledge base.

Grouping is by client, in the order entries occur, because that is the
question this report answers: "what do we do for clients in this category,
and what does it look like client by client" — not a ranking. For a ranking
of engagement size, see the `value_ranking` flow instead.

This script produces plain Markdown so it has no visual dependency on any
particular organization's slide or report template. If you already have a
house visual style, wrap this Markdown in it at publish time — do not fold
the styling into this script, or the report generation stops being reusable
independently of the current template.

Usage:
    python _scripts/build_topic_report.py "Manufacturing"
    python _scripts/build_topic_report.py "Manufacturing" --subcategory "Discrete Manufacturing"
    python _scripts/build_topic_report.py "Manufacturing" --since 2025-01-01
"""

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "_outputs" / "topics"

sys.path.insert(0, str(ROOT / "_scripts"))
import kb_query  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description="Per-category report from the knowledge base")
    ap.add_argument("category", help="category value, exactly as written in _context/20_taxonomy.md")
    ap.add_argument("--subcategory")
    ap.add_argument("--since", help="report_date >= YYYY-MM-DD")
    ap.add_argument("--until", help="report_date <= YYYY-MM-DD")
    args = ap.parse_args()

    rows = kb_query.load()
    if rows is None:
        return 1

    def matches(r):
        if r.get("category", "").lower() != args.category.lower():
            return False
        if args.subcategory and r.get("subcategory", "").lower() != args.subcategory.lower():
            return False
        if args.since and r.get("report_date", "") < args.since:
            return False
        if args.until and r.get("report_date", "") > args.until:
            return False
        return True

    hits = [r for r in rows if matches(r)]
    label = args.category + (f" / {args.subcategory}" if args.subcategory else "")

    if not hits:
        print(f"No entries found for category '{label}'.")
        return 0

    by_client = defaultdict(list)
    for r in hits:
        by_client[r.get("client") or "—"].append(r)

    periods = sorted({r["entry_id"][:8] for r in hits})

    out = [f"# Topic report — {label}\n",
           f"**Entries:** {len(hits)} · **Clients:** {len(by_client)} · "
           f"**Periods represented:** {len(periods)} ({periods[0]} … {periods[-1]})\n"]

    tbd = sum(1 for r in rows if r.get("category") == "TBD")
    if tbd:
        out.append(f"> **{tbd} row(s) in the whole index carry category `TBD`.** "
                    f"Some of them may belong to `{args.category}` but were never "
                    f"classified — this report may be under-counted.\n")

    for client in sorted(by_client, key=lambda c: -len(by_client[c])):
        client_rows = sorted(by_client[client], key=lambda r: r.get("report_date", ""))
        out.append(f"## {client}\n")
        out.append(f"*{len(client_rows)} entries*\n")
        for r in client_rows:
            out.append(f"- `{r['entry_id']}` ({r.get('report_date', '—')}): {r['activity']}")
        out.append("")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_")
    target = OUT_DIR / f"{slug}.md"
    target.write_text("\n".join(out), encoding="utf-8")

    print(f"OK  {label}: {len(hits)} entries, {len(by_client)} clients")
    print(f"    {target.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
