"""Canon check - is the taxonomy really the ONLY reference in use.

Claiming "this file is the one source" means nothing until it can be checked.
This script checks three things:

  1. Every `category`/`subcategory` value in the base belongs to the canon,
     and every subcategory belongs to the details of its OWN category.
  2. Every consumer declared in the canon actually exists on disk.
  3. No other file in the project keeps its own, competing copy of values that
     the canon has since superseded (only relevant once you've retired a
     value — see SUPERSEDED below).

Run: python _scripts/check_canon.py
Exit code 1 means drift - this is a test, not an informational report.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANON = ROOT / "_context" / "20_taxonomy.md"
INDEX = ROOT / "_kb" / "activities.jsonl"

# Values that USED TO be valid categories and have since been retired. List
# your own here once you retire a value, so this script can catch a document
# that still uses it. Empty by default in this template.
SUPERSEDED = []
HISTORY_OK = {"_context/00_method.md", "_context/20_taxonomy.md"}


def load_canon():
    tax, current = {}, None
    for line in CANON.read_text(encoding="utf-8").split("\n"):
        m = re.match(r"^### \d+\.\s+(.+?)\s*$", line)
        if m:
            current = m.group(1).strip()
            tax[current] = []
        elif current and line.startswith("- "):
            tax[current].append(line[2:].strip())
        elif line.startswith("## "):
            current = None
    return tax


def main():
    tax = load_canon()
    problems = []

    print(f"canon: {CANON.relative_to(ROOT)}")
    print(f"  categories: {len(tax)}   details: {sum(len(v) for v in tax.values())}")
    if len(tax) == 0:
        problems.append("canon has zero categories — fill in _context/20_taxonomy.md before indexing anything")

    # 1. Values actually used in the base
    if INDEX.is_file():
        rows = [json.loads(l) for l in INDEX.read_text(encoding="utf-8").splitlines() if l.strip()]
        used = {r.get("category") for r in rows} - {"—", "TBD", None}
        for row in rows:
            v, s = row.get("category"), row.get("subcategory")
            if v in ("—", "TBD", None):
                continue
            if v not in tax:
                problems.append(f"{row['entry_id']}: category '{v}' outside canon")
            elif s and s not in ("—", "") and s not in tax[v]:
                problems.append(f"{row['entry_id']}: subcategory '{s}' does not belong to '{v}'")
        print(f"  rows in base: {len(rows)}   distinct categories used: {len(used)}")

    # 2. Consumers declared in the canon
    declared = re.findall(r"^\| `([^`]+)` \|", CANON.read_text(encoding="utf-8"), re.MULTILINE)
    consumers = [c for c in declared if c.startswith(("_flows/", "_prompts/"))]
    for c in consumers:
        path = ROOT / c
        if not (path.exists() or path.with_suffix(".md").exists() or (path / "CONTEXT.md").exists()):
            problems.append(f"declared consumer does not exist: {c}")
    print(f"  declared consumers: {len(consumers)}")

    # 3. Competing lists of superseded values, outside the archive
    if SUPERSEDED:
        for path in ROOT.rglob("*.md"):
            rel = path.relative_to(ROOT).as_posix()
            if rel.startswith("_archive/") or rel in HISTORY_OK:
                continue
            text = path.read_text(encoding="utf-8", errors="ignore")
            hits = [c for c in SUPERSEDED if re.search(rf"\b{re.escape(c)}\b", text)]
            if len(hits) >= 2:
                problems.append(f"competing taxonomy list in {rel} (values: {', '.join(hits)})")

    print()
    if problems:
        print(f"DRIFT - {len(problems)} problem(s):")
        for p in problems:
            print(f"  - {p}")
        return 1
    print("OK - canon is the only reference, base is consistent, no competing lists")
    return 0


if __name__ == "__main__":
    sys.exit(main())
