# -*- coding: utf-8 -*-
"""Assembles output/metadata.json from the model's decisions plus the registry's memory.

The model only decides a category for entities the registry doesn't already
know. An entity present in _kb/_registry/clients.md gets its established
category copied across without being re-decided - that keeps classification
stable between runs instead of re-rolled every time.

Gate: a value outside the canon in _context/20_taxonomy.md stops this stage
before it can reach the index.

Expects the model's decisions in decisions.json, next to this script, shaped as
a JSON array (see ../CONTEXT.md for the exact shape and _prompts/D_enrichment.md
for how the model is instructed to produce it).
"""

import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

STAGE_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = STAGE_DIR.parents[3]
ENTITIES = STAGE_DIR.parent / "00_collect_entities" / "output" / "entities.json"
CLIENTS = PROJECT_ROOT / "_kb" / "_registry" / "clients.md"
CANON = PROJECT_ROOT / "_context" / "20_taxonomy.md"
OUTPUT = STAGE_DIR / "output" / "metadata.json"
DECISIONS = Path(__file__).resolve().parent / "decisions.json"


def load_canon():
    """The canon is read from its file, never from a copy in code - otherwise the two drift."""
    category, details = None, {}
    for line in CANON.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^### \d+\.\s+(.+)$", line)
        if m:
            category = m.group(1).strip()
            details[category] = set()
        elif category and line.startswith("- "):
            details[category].add(line[2:].strip())
    return details


def load_registry():
    known = {}
    for line in CLIENTS.read_text(encoding="utf-8").splitlines():
        if not line.startswith("| ") or line.startswith("| Canonical") or set(line) <= set("|- "):
            continue
        c = [x.strip() for x in line.strip("|").split("|")]
        if len(c) < 5:
            continue
        name, aliases, cat, sub, conf = c[0], c[1], c[2], c[3], c[4]
        rec = (name, [a.strip() for a in aliases.split(",") if a.strip()], cat,
               "" if sub in ("", "—") else sub, conf)
        known[name.lower()] = rec
        for a in rec[1]:
            known[a.lower()] = rec
    return known


def load_decisions():
    if not DECISIONS.is_file():
        return {}
    items = json.loads(DECISIONS.read_text(encoding="utf-8"))
    return {d["entity"]: d for d in items}


def main():
    details = load_canon()
    known = load_registry()
    data = json.loads(ENTITIES.read_text(encoding="utf-8"))
    decisions = load_decisions()

    out, missing, errors = [], [], []
    for e in data["entities"]:
        name = e["entity"]
        hit = known.get(name.lower())
        if hit:
            canonical, aliases, cat, sub, conf = hit
            if name not in aliases and name != canonical:
                aliases = aliases + [name]
        elif name in decisions:
            d = decisions[name]
            canonical = d.get("canonical_name", name)
            aliases = d.get("aliases", [name])
            cat, sub, conf = d["category"], d.get("subcategory", ""), d["category_conf"]
        else:
            missing.append(name)
            continue

        if cat != "TBD":
            if cat not in details:
                errors.append(f"{name}: category '{cat}' outside canon")
            elif sub and sub not in details[cat]:
                errors.append(f"{name}: detail '{sub}' does not belong to '{cat}'")

        out.append({"entity": name, "canonical_name": canonical, "aliases": aliases,
                    "category": cat, "subcategory": sub, "category_conf": conf})

    if missing:
        print(f"ERROR: {len(missing)} entities have no decision:", file=sys.stderr)
        for m in missing[:20]:
            print(f"  - {m}", file=sys.stderr)
        print(f"\nWrite them to {DECISIONS.relative_to(PROJECT_ROOT)} following _prompts/D_enrichment.md", file=sys.stderr)
        return 1
    if errors:
        print(f"ERROR: {len(errors)} value(s) outside canon:", file=sys.stderr)
        for e in errors[:20]:
            print(f"  - {e}", file=sys.stderr)
        return 1

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")

    tbd = [o["entity"] for o in out if o["category"] == "TBD"]
    print(f"OK  entities: {len(out)}   from registry: {sum(1 for o in out if o['entity'].lower() in known)}"
          f"   newly decided: {sum(1 for o in out if o['entity'].lower() not in known)}")
    print(f"    TBD: {len(tbd)}" + (f"  ->  " + ", ".join(tbd) if tbd else ""))
    print(f"    {OUTPUT.relative_to(PROJECT_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
