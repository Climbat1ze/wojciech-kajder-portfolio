# -*- coding: utf-8 -*-
"""Stage 02 of value_ranking - merge and render the ranking.

This script adds no content. It arranges what stage 01 decided into order and
tables. The amount shown in a table is always the source form; the parsed
number exists only to sort by and is never displayed on its own.

Usage:
    python _flows/value_ranking/stages/02_rank/_scripts/rank.py
"""

import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

STAGE = Path(__file__).resolve().parents[1]
FLOW = STAGE.parents[1]
ROOT = Path(__file__).resolve().parents[5]
OUT = STAGE / "output"

VALUED = FLOW / "stages/01_assess/output/valued.json"
ENGAGE = FLOW / "stages/00_collect/output/engagement.json"
COVER = FLOW / "stages/00_collect/output/coverage.json"

MULTIPLIER = {"k": 1e3, "m": 1e6, "b": 1e9}


def to_number(amount):
    """Source amount -> a number to sort by. None when it can't be parsed.

    Source text sometimes uses a comma as a decimal separator ("$1,4M" means
    1.4 million) and doesn't use a thousands separator alongside a K/M/B
    suffix. So a comma immediately before a suffix is read as a decimal point
    - otherwise "$1,4M" would sort as 14 million.
    """
    if not amount:
        return None
    m = re.search(r"[$€£]\s*([\d.,]+)\s*([KkMmBb])?", amount)
    if not m:
        m = re.search(r"([\d.,]+)\s*([KkMmBb])\b", amount)
        if not m:
            return None
    number, suffix = m.group(1).rstrip(".,"), (m.group(2) or "").lower()
    if "." in number and "," in number:
        number = number.replace(",", "")          # comma = thousands separator
    elif "," in number:
        number = number.replace(",", ".")         # comma = decimal separator
    try:
        return float(number) * MULTIPLIER.get(suffix, 1.0)
    except ValueError:
        return None


def shorten(text, n=60):
    if not text:
        return "-"
    t = " ".join(str(text).split())
    return t if len(t) <= n else t[: n - 1] + "…"


def table_a(deals):
    """Deals with a stated amount, in a comparable currency (USD)."""
    with_amount = [d for d in deals if d.get("amount") and not d.get("non_usd_currency")]
    for d in with_amount:
        d["_sort"] = to_number(d["amount"]) or 0.0
    return sorted(with_amount, key=lambda d: -d["_sort"])


def table_a_other_currencies(deals):
    return [d for d in deals if d.get("amount") and d.get("non_usd_currency")]


def table_b(engagement, limit=25):
    return engagement[:limit]


def intersection(deals, engagement, period_threshold=4):
    """Rows present in BOTH measures - the actual answer to "what mattered".

    Requires both signals at once: a qualified deal (scale) AND persistence in
    the index (at least `period_threshold` distinct periods). Sorted by
    periods, not amount - otherwise this table would just duplicate table A
    and lose engagements that ran for months without ever getting a number.

    Matched by client name. Canonical names in valued.json come from the
    registry; keys in engagement.json come straight from the index - names
    that don't line up are a signal to fix the registry, not a script bug.
    """
    by_client = {z["client"]: z for z in engagement}
    result = []
    for d in deals:
        z = by_client.get(d.get("client"))
        if not z or z["periods"] < period_threshold:
            continue
        result.append((d, z["periods"], z["units"], z["entries"]))
    result.sort(key=lambda t: (-t[1], -(to_number(t[0].get("amount")) or 0.0)))
    return result


def sustained_without_amount(deals, engagement, period_threshold=5, limit=12):
    """Clients with the longest engagement who have no value signal at all.

    Not a data gap - a finding: in a typical corpus, the most sustained work
    often has no figure attached anywhere. Without this table, an
    amount-only ranking would read as if that work never happened.
    """
    known = {d.get("client") for d in deals}
    return [z for z in engagement
            if z["client"] not in known and z["periods"] >= period_threshold][:limit]


def main():
    for p in (VALUED, ENGAGE, COVER):
        if not p.is_file():
            print(f"ERROR: {p.relative_to(ROOT)} not found - run the earlier stage first.",
                  file=sys.stderr)
            return 1

    data = json.loads(VALUED.read_text(encoding="utf-8"))
    deals = data["deals"]
    meta = data["meta"]
    engagement = json.loads(ENGAGE.read_text(encoding="utf-8"))
    cov = json.loads(COVER.read_text(encoding="utf-8"))

    o = []
    o.append("# Value ranking — engagements and involvement\n")
    o.append(f"**Range:** {cov['since']} … {cov['until']} · **narrowed by:** {cov['narrowing']}  ")
    o.append(f"**Coverage:** {cov['periods_present']}/{cov['periods_in_range']} periods "
             f"({cov['coverage_pct']}%)  ")
    o.append(f"**Deals after qualification:** {len(deals)} · "
             f"**candidates before qualification:** {meta['candidates']}\n")

    # --- A ---
    a = table_a(deals)
    o.append("## A. Deals with a stated amount (USD)\n")
    o.append("Amount shown in its source form. Do not sum this column - see the coverage section.\n")
    o.append("| # | Client | Category | Amount | Status | Role | Periods | entry_id |")
    o.append("|---:|---|---|---:|---|---|---:|---|")
    for i, d in enumerate(a, 1):
        periods = len({e[:8] for e in d["entry_ids"]})
        o.append(f"| {i} | {d['client'] or d.get('client_raw','-')} | "
                 f"{shorten(d.get('category'), 28)} | {d['amount']} | {d['status']} | "
                 f"{d['role']} | {periods} | {', '.join(d['entry_ids'])} |")

    other = table_a_other_currencies(deals)
    if other:
        o.append("\n### A2. Deals in another currency - not comparable to the above\n")
        o.append("No exchange rate is given in the source, so these are not ranked "
                 "alongside the USD figures above.\n")
        o.append("| Client | Category | Amount | Status | Role | entry_id |")
        o.append("|---|---|---:|---|---|---|")
        for d in other:
            o.append(f"| {d['client'] or d.get('client_raw','-')} | "
                     f"{shorten(d.get('category'), 28)} | {d['amount']} | {d['status']} | "
                     f"{d['role']} | {', '.join(d['entry_ids'])} |")

    # --- B ---
    o.append("\n## B. Clients by engagement\n")
    o.append("Sorted by number of **periods**, not entries: entry count measures how "
             "finely work was written up, period count measures how long a topic "
             "actually kept coming back.\n")
    o.append("| # | Client | Category | Periods | Entries | Units | Sections |")
    o.append("|---:|---|---|---:|---:|---:|---:|")
    for i, z in enumerate(table_b(engagement), 1):
        o.append(f"| {i} | {z['client']} | {shorten(z.get('category'), 28)} | "
                 f"{z['periods']} | {z['entries']} | {z['units']} | {z['sections']} |")

    # --- Intersection ---
    p = intersection(deals, engagement)
    o.append("\n## C. Scale **and** sustained engagement\n")
    o.append("The intersection of both measures: a qualified deal **and** presence in at "
             "least 4 distinct periods. This is the answer to \"what mattered\" - not the "
             "amount alone and not the mention count alone. Sorted by periods.\n")
    o.append("| # | Client | Amount / scale | Status | Role | Periods | Entries | Units |")
    o.append("|---:|---|---|---|---|---:|---:|---:|")
    for i, (d, periods, units, entries) in enumerate(p, 1):
        scale = d.get("amount") or shorten(d.get("volume"), 46) or "-"
        o.append(f"| {i} | {d['client'] or d.get('client_raw','-')} | {scale} | "
                 f"{d['status']} | {d['role']} | {periods} | {entries} | {units} |")

    without = sustained_without_amount(deals, engagement)
    o.append("\n### C2. Most sustained topics with no value signal at all\n")
    o.append("Clients present in 5+ periods where no row carries an amount, a volume, or an "
             "opportunity id - so value qualification never saw them. An amount-only ranking "
             "would suggest this work didn't happen.\n")
    o.append("| Client | Category | Periods | Entries | Units |")
    o.append("|---|---|---:|---:|---:|")
    for z in without:
        o.append(f"| {z['client']} | {shorten(z.get('category'), 28)} | {z['periods']} | "
                 f"{z['entries']} | {z['units']} |")

    # --- Rejections ---
    ag = meta["rejected_aggregates"]
    fp = meta["rejected_false_positives"]
    o.append("\n## D. What was rejected and why\n")
    o.append(f"**Programme-level aggregates - {ag['count']} row(s).** "
             + " ".join(f"`{w}`." for w in ag["indicators"]) + " " + ag["reason"] + "\n")
    o.append(f"**Pattern false positives - {fp['count']} row(s).**\n")
    o.append("| entry_id | What the pattern matched | Why it isn't a value signal |")
    o.append("|---|---|---|")
    for item in fp["items"]:
        o.append(f"| {item['entry_id']} | `{item['matched']}` | {item['reason']} |")

    # --- Coverage ---
    o.append("\n## E. Range coverage\n")
    o.append(f"The base covers **{cov['periods_present']} of {cov['periods_in_range']}** "
             f"periods in range ({cov['coverage_pct']}%). This ranking describes what the "
             f"reports for those periods recorded - not everything that happened.\n")
    if cov["missing"]:
        o.append(f"**Missing from base ({len(cov['missing'])} periods):** "
                 + ", ".join(f"`{t}`" for t in cov["missing"]) + "\n")
    o.append(f"> {meta['note_on_totals']}\n")

    text = "\n".join(o) + "\n"
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "ranking.md").write_text(text, encoding="utf-8")

    print(f"written: {(OUT / 'ranking.md').relative_to(ROOT)}")
    print(f"  deals with amount (USD): {len(a)}   in another currency: {len(other)}")
    print(f"  clients in engagement table: {len(engagement)} (showing {len(table_b(engagement))})")
    print(f"  coverage: {cov['periods_present']}/{cov['periods_in_range']} periods")
    return 0


if __name__ == "__main__":
    sys.exit(main())
