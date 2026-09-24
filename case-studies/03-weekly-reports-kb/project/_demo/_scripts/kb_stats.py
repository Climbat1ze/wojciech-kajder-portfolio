# -*- coding: utf-8 -*-
"""Aggregation over the knowledge-base index - counting, not narrowing.

Why this is a separate tool. `query_kb/00_filter` answers "what happened with
X" — it narrows the index and hands the hits to a model. It does not answer
"which X shows up most often", because that requires counting the whole
corpus.

Handing a model a thousand rows just to have it count them would break the
method's core rule (a model is not a search engine, still less a calculator)
and would be wasteful: counting is deterministic, so it belongs to a script.
A model gets the finished table if it needs to interpret it.

Usage:
    python _scripts/kb_stats.py --group-by client
    python _scripts/kb_stats.py --group-by pic --sort periods
    python _scripts/kb_stats.py --group-by client --category "Manufacturing"
    python _scripts/kb_stats.py --group-by category --since 2025-01-01
"""

import argparse
import sys
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
TEMP = ROOT / "_temp"

sys.path.insert(0, str(ROOT / "_scripts"))
import kb_query  # noqa: E402

EMPTY = ("", "—", None)

# Dimensions that hold more than one value per row. `pic` is a list, so one
# entry counts toward every person named in it — the "entries" column sum
# will exceed the row count. That must be visible in the header, not only in
# documentation.
MULTI_VALUED = {"pic"}

DIMENSIONS = {
    "pic": lambda r: r.get("pic") or [],
    "client": lambda r: [r.get("client")],
    "category": lambda r: [r.get("category")],
    "subcategory": lambda r: [r.get("subcategory")],
    "object_name": lambda r: [r.get("object_name")],
    "section": lambda r: [r.get("section")],
    "period": lambda r: [r["entry_id"][:8]],
    "year": lambda r: [r["entry_id"][:4]],
}


def main():
    ap = argparse.ArgumentParser(description="Aggregation over the knowledge-base index")
    ap.add_argument("--group-by", required=True, choices=sorted(DIMENSIONS), dest="group_by")
    ap.add_argument("--sort", default="count", choices=["count", "periods", "clients", "name"],
                    help="column to sort by, descending (default: count)")
    ap.add_argument("--limit", type=int, help="show only the first N rows")
    ap.add_argument("--include-empty", action="store_true",
                    help="include empty and '—' values (excluded by default)")
    kb_query.add_filters(ap)
    args = ap.parse_args()

    rows = kb_query.load()
    if rows is None:
        return 1
    hits = kb_query.narrow(rows, args)

    entries = defaultdict(int)
    periods = defaultdict(set)
    clients = defaultdict(set)

    for r in hits:
        for key in DIMENSIONS[args.group_by](r):
            if not args.include_empty and key in EMPTY:
                continue
            key = key if key not in EMPTY else "—"
            entries[key] += 1
            periods[key].add(r["entry_id"][:8])
            if r.get("client") not in EMPTY:
                clients[key].add(r["client"])

    column = {"count": lambda k: entries[k],
              "periods": lambda k: len(periods[k]),
              "clients": lambda k: len(clients[k]),
              "name": lambda k: k}
    reverse = args.sort != "name"
    rows_out = sorted(entries, key=column[args.sort], reverse=reverse)
    if args.limit:
        rows_out = rows_out[:args.limit]

    out = []
    out.append(f"# Index aggregation — by `{args.group_by}`\n")
    out.append(f"**Narrowed by:** {kb_query.describe_conditions(args)}  ")
    out.append(f"**Rows in index:** {len(rows)} · **after narrowing:** {len(hits)}  ")
    out.append(f"**Distinct values:** {len(entries)}"
               + (f" (showing {len(rows_out)})" if args.limit else "") + "\n")

    if args.group_by in MULTI_VALUED:
        out.append('> **The `entries` column sums to more than the row count** — '
                   'one row can name several people and counts for each of them.\n')
        out.append('> **This table measures mentions in reports, not contribution.** '
                   'Whoever describes their work in finer detail ranks higher here. The '
                   '`periods` column is more robust: it says how long someone was '
                   'consistently involved, not how their work happened to be written up.\n')

    out.append("| # | " + args.group_by + " | entries | periods | clients |")
    out.append("|---:|---|---:|---:|---:|")
    for i, k in enumerate(rows_out, 1):
        out.append(f"| {i} | {k} | {entries[k]} | {len(periods[k])} | {len(clients[k])} |")

    text = "\n".join(out)
    print(text)

    # A per-person breakdown is a workload analysis. Keep it out of anything
    # that might be committed to version control by default.
    if args.group_by in MULTI_VALUED:
        TEMP.mkdir(exist_ok=True)
        target = TEMP / f"aggregation_{args.group_by}.md"
        target.write_text(text + "\n", encoding="utf-8")
        print(f"\nNOTE: this per-person breakdown was also saved to {target.relative_to(ROOT)} "
              f"(kept out of version control).")
        print("      Consider whether to commit it — it is a workload analysis.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
