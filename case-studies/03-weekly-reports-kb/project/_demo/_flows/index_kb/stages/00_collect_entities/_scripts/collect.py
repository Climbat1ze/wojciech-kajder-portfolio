"""Stage 00 - Collect entities: unique clients across the whole corpus.

Contract: ../CONTEXT.md

This stage works on the WHOLE corpus, not one document - category is decided
once per entity. If it worked per document, the same client would be
reclassified every period and the two decisions would eventually disagree.
"""

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

STAGE_DIR = Path(__file__).resolve().parents[1]
FLOW_ROOT = STAGE_DIR.parents[1]
PROJECT_ROOT = FLOW_ROOT.parents[1]
BUILD_KB = PROJECT_ROOT / "_flows" / "build_kb"
REGISTRY = PROJECT_ROOT / "_kb" / "_registry" / "clients.md"
OUTPUT = STAGE_DIR / "output" / "entities.json"

EMPTY = {"—", "", "-", "TBD", None}


def load_registry():
    """Canonical names and aliases already resolved - these entities are skipped."""
    if not REGISTRY.is_file():
        return {}
    known = {}
    for line in REGISTRY.read_text(encoding="utf-8").split("\n"):
        cells = [c.strip() for c in line.split("|")]
        if len(cells) >= 7 and cells[1] and cells[1] not in ("Canonical name", ""):
            if set(cells[1]) <= set("-"):
                continue
            known[cells[1].lower()] = {"category": cells[3], "subcategory": cells[4], "conf": cells[5]}
            for alias in re.split(r",\s*", cells[2]):
                if alias and alias != "—":
                    known[alias.lower()] = known[cells[1].lower()]
    return known


def main():
    # _kb/_runs/ is the source of truth. The current stage-03 output is the
    # same content for whichever document was processed most recently -
    # dedupe by doc_key.
    sources, seen_docs = [], set()
    for path in sorted((PROJECT_ROOT / "_kb" / "_runs").glob("*/validated.json")):
        sources.append(path)
        seen_docs.add(json.loads(path.read_text(encoding="utf-8"))["doc_key"])
    current = BUILD_KB / "stages" / "03_validate" / "output" / "validated.json"
    if current.is_file() and json.loads(current.read_text(encoding="utf-8"))["doc_key"] not in seen_docs:
        sources.append(current)
    if not sources:
        print("ERROR: no validated.json found - run build_kb first.", file=sys.stderr)
        return 1

    known = load_registry()
    entities, seen = [], {}
    for path in sources:
        data = json.loads(path.read_text(encoding="utf-8"))
        for entry in data["entries"]:
            name = (entry.get("client") or "").strip()
            if name in EMPTY:
                continue
            key = name.lower()
            if key in seen:
                seen[key]["occurrences"] += 1
                continue
            record = {
                "entity": name,
                "occurrences": 1,
                "in_registry": key in known,
                "sample": entry["activity"][:400],
                "first_entry_id": entry["entry_id"],
            }
            seen[key] = record
            entities.append(record)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({
        "stage": "00_collect_entities",
        "collected_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "sources": len(sources),
        "entities_total": len(entities),
        "needs_decision": sum(1 for e in entities if not e["in_registry"]),
        "entities": entities,
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"OK  sources: {len(sources)}  entities: {len(entities)}")
    print(f"    already in registry: {sum(1 for e in entities if e['in_registry'])}")
    print(f"    need a decision: {sum(1 for e in entities if not e['in_registry'])}")
    print(f"    {OUTPUT.relative_to(PROJECT_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
