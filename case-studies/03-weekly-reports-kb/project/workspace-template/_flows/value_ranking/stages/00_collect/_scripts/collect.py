# -*- coding: utf-8 -*-
"""Stage 00 of value_ranking - value candidates, engagement proxy, coverage.

This script judges nothing. It points at rows containing a number that looks
like a value, and counts what can be counted without understanding content.
Deciding whether "$1.2M" is a closed deal, a potential one, or a programme-wide
indicator belongs to stage 01 - see the contract next to it.

Narrowing logic is imported from _scripts/kb_query.py, not copied - see that
module's docstring for why two copies of the same filter eventually disagree.

Usage:
    python _flows/value_ranking/stages/00_collect/_scripts/collect.py --since 2025-01-01
"""

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

STAGE = Path(__file__).resolve().parents[1]
ROOT = Path(__file__).resolve().parents[5]
OUT = STAGE / "output"

sys.path.insert(0, str(ROOT / "_scripts"))
import kb_query  # noqa: E402

# The schema says empty is U+2014 (em dash). A lossy encoding pass can turn
# that into a replacement character instead - treat both as empty, or rows
# would merge into one "client" named after a replacement character.
# NOTE: these are DATA values, not prose - do not "fix" U+2014 to a hyphen;
# the schema specifically expects this character, and swapping it would break
# empty-field detection silently.
EMPTY = {"", "—", "-", "�", "None", "null"}

# --- Value signals ------------------------------------------------------
# Each pattern only FLAGS a row for a human/model to read. None of them
# assigns meaning to the number it finds - that is stage 01's job.

AMOUNT = re.compile(r"[$€£]\s?\d[\d.,]*\s?(?:[KkMmBb]\b)?|\b\d[\d.,]*\s?(?:USD|EUR|GBP)\b")
VOLUME = re.compile(
    r"\b\d[\d.,]*\s?[KkMm]?\s?x\s|"                       # "3K x handhelds"
    r"\bx\s?\d[\d.,]*\s?[KkMm]?\b|"                       # "device x 1500"
    r"\b\d[\d.,]*\s?[Kk]?\s?(?:units?|pcs|devices?|seats?|licen[cs]es?|tablets?|phones?)\b",
    re.I,
)
OPPORTUNITY_ID = re.compile(r"\b[A-Z]{2}\d{10,14}\b")


def clean(v):
    """The field's value, or None when empty in any of its forms."""
    if v is None:
        return None
    s = str(v).strip()
    return None if s in EMPTY else s


def iso_periods(start, end):
    """`YYYY-WNN` labels for every ISO week between two dates.

    Computed from the calendar, not from the data. What the base doesn't have
    can't be seen from inside the base itself - and the missing periods are
    exactly the information this computes.
    """
    d = date.fromisoformat(start)
    stop = date.fromisoformat(end)
    seen = []
    while d <= stop:
        y, w, _ = d.isocalendar()
        label = f"{y}-W{w:02d}"
        if label not in seen:
            seen.append(label)
        d += timedelta(days=7)
    return seen


def signals(text):
    """What in this text looks like a value. An empty dict means no signal."""
    found = {
        "amounts": [m.group(0).strip() for m in AMOUNT.finditer(text)],
        "volumes": [m.group(0).strip() for m in VOLUME.finditer(text)],
        "opportunity_ids": OPPORTUNITY_ID.findall(text),
    }
    return {k: v for k, v in found.items() if v}


def collect_candidates(hits):
    candidates = []
    for r in hits:
        text = r.get("activity") or ""
        s = signals(text + " " + str(r.get("bo") or ""))
        if not s:
            continue
        candidates.append({
            "entry_id": r["entry_id"],
            "report_date": r.get("report_date"),
            "section": r.get("section"),
            "object_name": clean(r.get("object_name")),
            "client": clean(r.get("client")),
            "category": clean(r.get("category")),
            "subcategory": clean(r.get("subcategory")),
            "bo": clean(r.get("bo")),
            # A regional/programme indicator, not a deal. Not removed - the
            # model should reject it deliberately, so the rejection is a
            # decision, not a silent loss.
            "aggregate": r.get("section") == "finance",
            "signals": s,
            "activity": text,          # verbatim, unshortened - this is the evidence
            "raw_ref": r.get("raw_ref"),
        })
    return candidates


def collect_engagement(hits):
    """Per-client engagement proxy - for the whole range, not just the candidates.

    Columns mirror `_scripts/kb_stats.py`, extended with business units. Period
    count is the leading measure here, because entry count measures how
    finely someone wrote up their work, not how large the work was.
    """
    entries = defaultdict(int)
    periods = defaultdict(set)
    units = defaultdict(set)
    sections = defaultdict(set)
    category_of = {}
    entry_ids = defaultdict(list)

    for r in hits:
        k = clean(r.get("client"))
        if k is None:
            continue
        entries[k] += 1
        periods[k].add(r["entry_id"][:8])
        sections[k].add(r.get("section"))
        entry_ids[k].append(r["entry_id"])
        if r.get("section") == "business_unit":
            unit = clean(r.get("object_name"))
            if unit:
                units[k].add(unit)
        if k not in category_of:
            category_of[k] = (clean(r.get("category")), clean(r.get("subcategory")))

    out = []
    for k in entries:
        cat, sub = category_of[k]
        out.append({
            "client": k,
            "category": cat,
            "subcategory": sub,
            "entries": entries[k],
            "periods": len(periods[k]),
            "period_list": sorted(periods[k]),
            "units": len(units[k]),
            "unit_list": sorted(units[k]),
            "sections": len(sections[k]),
            "section_list": sorted(x for x in sections[k] if x),
            "entry_ids": entry_ids[k],
        })
    out.sort(key=lambda x: (-x["periods"], -x["entries"], x["client"]))
    return out


def main():
    ap = argparse.ArgumentParser(description="Value candidates + engagement proxy")
    kb_query.add_filters(ap)
    args = ap.parse_args()

    # Default range: adjust to your own reporting history's real start.
    # Without an explicit --until, stop at the last CLOSED ISO period - a
    # report for a period still in progress doesn't exist yet, so reporting
    # it as "missing" would be a false alarm.
    if not args.since:
        args.since = "2025-01-01"
    if args.until:
        effective_until = args.until
    else:
        today = date.today()
        effective_until = (today - timedelta(days=today.isoweekday() + 6)).isoformat()

    rows = kb_query.load()
    if rows is None:
        return 1
    hits = kb_query.narrow(rows, args)

    candidates = collect_candidates(hits)
    engagement = collect_engagement(hits)

    present = sorted({r["entry_id"][:8] for r in hits})
    expected = iso_periods(args.since, effective_until)
    missing = [t for t in expected if t not in present]
    coverage = {
        "since": args.since,
        "until": effective_until,
        "narrowing": kb_query.describe_conditions(args),
        "periods_in_range": len(expected),
        "periods_present": len(present),
        "coverage_pct": round(100 * len(present) / len(expected), 1) if expected else 0.0,
        "present": present,
        "missing": missing,
    }

    OUT.mkdir(parents=True, exist_ok=True)
    for name, data in (("candidates.json", candidates),
                        ("engagement.json", engagement),
                        ("coverage.json", coverage)):
        (OUT / name).write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    with_amount = [k for k in candidates if "amounts" in k["signals"] and not k["aggregate"]]
    print(f"narrowing: {kb_query.describe_conditions(args)}")
    print(f"  rows in index: {len(rows)}  ->  after narrowing: {len(hits)}")
    print(f"  value candidates: {len(candidates)}"
          f"  (with an amount outside finance: {len(with_amount)},"
          f" aggregates to reject: {sum(1 for k in candidates if k['aggregate'])})")
    print(f"  clients with engagement: {len(engagement)}")
    print(f"  range coverage: {coverage['periods_present']}/{coverage['periods_in_range']}"
          f" periods ({coverage['coverage_pct']}%)")
    if missing:
        print(f"  MISSING from base: {', '.join(missing)}")
    if not candidates:
        print("\nNOTE: zero candidates. This is an answer, not an error -"
              " the range contains no row with something that looks like a value.")
    print(f"\nwritten to {OUT.relative_to(ROOT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
