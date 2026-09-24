# -*- coding: utf-8 -*-
"""Shared read-and-narrow logic for the knowledge-base index.

The one place that defines what "this row matches these conditions" means.
Used by `query_kb/00_filter` (narrowing to what the model reads) and by
`kb_stats.py` (aggregation). Without this shared module, the same logic would
exist in two copies and would eventually answer the same question two
different ways — exactly how divergent canon copies happen in this method.
"""

import json
import sys
from pathlib import Path

# Windows consoles default to a legacy codepage on both streams; only reconfiguring
# stdout (as most callers of this module do for their own output) still leaves this
# module's own error message below garbled. Reconfigure defensively, here too.
try:
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "_kb" / "activities.jsonl"

# Filter field names are part of both tools' interface — kept here so adding a
# new dimension is a change in one file.
FIELDS = ["category", "subcategory", "client", "pic", "section", "since", "until"]


def add_filters(ap):
    """Adds the standard narrowing arguments to an existing parser."""
    ap.add_argument("--category")
    ap.add_argument("--subcategory")
    ap.add_argument("--client")
    ap.add_argument("--pic")
    ap.add_argument("--section")
    ap.add_argument("--since", help="report_date >= YYYY-MM-DD")
    ap.add_argument("--until", help="report_date <= YYYY-MM-DD")
    return ap


def load():
    """All index rows. None if the index doesn't exist yet."""
    if not INDEX.is_file():
        print(f"ERROR: {INDEX} not found — run index_kb first.", file=sys.stderr)
        return None
    return [json.loads(l) for l in INDEX.read_text(encoding="utf-8").splitlines() if l.strip()]


def matches(r, args):
    """Whether a row satisfies the given conditions.

    Category, subcategory and section are compared literally — they are
    controlled-vocabulary values, so a partial match would introduce silent
    over-matches. Client and person are matched as substrings, since those
    are usually searched by a fragment of a name.
    """
    if args.category and r.get("category", "").lower() != args.category.lower():
        return False
    if args.subcategory and r.get("subcategory", "").lower() != args.subcategory.lower():
        return False
    if args.client and args.client.lower() not in r.get("client", "").lower():
        return False
    if args.pic and not any(args.pic.lower() in p.lower() for p in r.get("pic", [])):
        return False
    if args.section and r.get("section") != args.section:
        return False
    if args.since and r.get("report_date", "") < args.since:
        return False
    if getattr(args, "until", None) and r.get("report_date", "") > args.until:
        return False
    return True


def narrow(rows, args):
    return [r for r in rows if matches(r, args)]


def describe_conditions(args):
    """Active conditions in readable form — for a result's header."""
    active = {k: v for k, v in vars(args).items() if v and k in FIELDS}
    if not active:
        return "whole index, no narrowing"
    return ", ".join(f"{k}={v}" for k, v in active.items())
