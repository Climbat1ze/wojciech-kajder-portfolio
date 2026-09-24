"""Stage 02 - Index: entries + entity dictionary -> _kb/activities.jsonl.

Contract: ../CONTEXT.md

Three rules this stage enforces:
  1. A value outside the controlled list is an ERROR, not a variant.
  2. `activity` and `activity_sha256` are NEVER touched - only category /
     subcategory / category_conf are added.
  3. Writing is an UPSERT by entry_id, not an append - reprocessing a document
     overwrites its own rows instead of duplicating them.
"""

import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

STAGE_DIR = Path(__file__).resolve().parents[1]
FLOW_ROOT = STAGE_DIR.parents[1]
PROJECT_ROOT = FLOW_ROOT.parents[1]

VALIDATED = PROJECT_ROOT / "_flows" / "build_kb" / "stages" / "03_validate" / "output" / "validated.json"
METADATA = STAGE_DIR.parent / "01_enrich" / "output" / "metadata.json"
TAXONOMY = PROJECT_ROOT / "_context" / "20_taxonomy.md"
KB = PROJECT_ROOT / "_kb"
INDEX = KB / "activities.jsonl"
CLIENTS = KB / "_registry" / "clients.md"
PENDING = KB / "_registry" / "pending_review.md"

EMPTY = {"—", "", "-", None}


def load_taxonomy():
    """Categories and their details - from the CANON file, never a copy in code."""
    tax, current = {}, None
    for line in TAXONOMY.read_text(encoding="utf-8").split("\n"):
        m = re.match(r"^### \d+\.\s+(.+?)\s*$", line)
        if m:
            current = m.group(1).strip()
            tax[current] = []
            continue
        if current and line.startswith("- "):
            tax[current].append(line[2:].strip())
        elif line.startswith("## "):
            current = None
    return tax


def main():
    for path, label in ((VALIDATED, "build_kb/03_validate"), (METADATA, "01_enrich")):
        if not path.is_file():
            print(f"ERROR: {path.name} not found - run {label} first.", file=sys.stderr)
            return 1

    tax = load_taxonomy()
    if len(tax) == 0:
        print("ERROR: taxonomy has zero categories - fill in _context/20_taxonomy.md first.", file=sys.stderr)
        return 1

    # This flow works PER CORPUS - it merges every archived run, not just the
    # latest one. Otherwise a taxonomy change would never propagate to
    # already-indexed periods.
    runs, seen_docs = [], set()
    for path in sorted((KB / "_runs").glob("*/validated.json")):
        d = json.loads(path.read_text(encoding="utf-8"))
        runs.append(d)
        seen_docs.add(d["doc_key"])
    if VALIDATED.is_file():
        cur = json.loads(VALIDATED.read_text(encoding="utf-8"))
        if cur["doc_key"] not in seen_docs:
            runs.append(cur)
    if not runs:
        print("ERROR: no runs to index.", file=sys.stderr)
        return 1
    enrich = json.loads(METADATA.read_text(encoding="utf-8"))

    by_name = {}
    for m in enrich:
        for key in [m["entity"], m["canonical_name"], *m.get("aliases", [])]:
            by_name[key.lower()] = m

    # --- Hard canon validation. A bad value stops the run.
    errors = []
    for m in enrich:
        v, s = m["category"], m.get("subcategory", "")
        if v == "TBD":
            continue
        if v not in tax:
            errors.append(f"{m['canonical_name']}: category '{v}' outside the allowed list")
        elif s and s not in tax[v]:
            errors.append(f"{m['canonical_name']}: subcategory '{s}' does not belong to '{v}'")
    if errors:
        print("ERROR: values outside the controlled list - run stopped.", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    existing = {}
    if INDEX.is_file():
        for line in INDEX.read_text(encoding="utf-8").splitlines():
            if line.strip():
                row = json.loads(line)
                existing[row["entry_id"]] = row

    added, updated, to_review = 0, 0, []
    for entry in [e for run in runs for e in run["entries"]]:
        client = (entry.get("client") or "").strip()
        meta = by_name.get(client.lower()) if client not in EMPTY else None

        row = dict(entry)
        if meta:
            row["client"] = meta["canonical_name"]
            row["category"] = meta["category"]
            row["subcategory"] = meta.get("subcategory") or "—"
            row["category_conf"] = meta["category_conf"]
            if meta["category"] == "TBD":
                to_review.append((meta["canonical_name"], entry["entry_id"], "category undecided"))
        else:
            row["category"] = "—" if client in EMPTY else "TBD"
            row["subcategory"] = "—"
            row["category_conf"] = "—" if client in EMPTY else "to_confirm/low"
            if client not in EMPTY:
                to_review.append((client, entry["entry_id"], "entity not enriched"))

        # Immutability guarantee: the hash must match the content AFTER merging.
        if hashlib.sha256(row["activity"].encode("utf-8")).hexdigest() != row["activity_sha256"]:
            print(f"ERROR: entry {row['entry_id']}'s hash does not match its content.", file=sys.stderr)
            return 1

        if row["entry_id"] in existing:
            updated += 1
        else:
            added += 1
        existing[row["entry_id"]] = row

    INDEX.parent.mkdir(parents=True, exist_ok=True)
    with INDEX.open("w", encoding="utf-8", newline="\n") as fh:
        for entry_id in sorted(existing):
            fh.write(json.dumps(existing[entry_id], ensure_ascii=False) + "\n")

    # --- Entity registry: memory of past decisions, so they aren't re-decided.
    header = CLIENTS.read_text(encoding="utf-8").split("| Canonical name")[0]
    rows = ["| Canonical name | Aliases | category | subcategory | category_conf | First seen |",
            "|---|---|---|---|---|---|"]
    today = datetime.now(timezone.utc).date().isoformat()
    for m in sorted(enrich, key=lambda x: x["canonical_name"]):
        # The form actually seen in the document is an alias too - otherwise
        # the same entity comes back as "new" on every following report.
        aliases = sorted((set(m['aliases']) | {m['entity']}) - {m['canonical_name']})
        rows.append(f"| {m['canonical_name']} | {', '.join(aliases) or '—'} | "
                    f"{m['category']} | {m.get('subcategory') or '—'} | {m['category_conf']} | {today} |")
    CLIENTS.write_text(header + "\n".join(rows) + "\n", encoding="utf-8")

    # --- Review queue: does not block indexing, but does not let uncertainty disappear either.
    ph = PENDING.read_text(encoding="utf-8").split("| Date |")[0]
    prows = ["| Date | Entity | Reason | Source entry_id |", "|---|---|---|---|"]
    for name, eid, why in sorted(set(to_review)):
        prows.append(f"| {today} | {name} | {why} | `{eid}` |")
    PENDING.write_text(ph + "\n".join(prows) + "\n", encoding="utf-8")

    print(f"    runs merged: {len(runs)} ({', '.join(sorted(r['doc_key'] for r in runs))})")
    print(f"OK  rows in index: {len(existing)}  (new: {added}, updated: {updated})")
    print(f"    taxonomy: {len(tax)} categories, hard validation passed")
    print(f"    client registry: {len(enrich)} entities")
    print(f"    review queue: {len(set(to_review))} item(s)")
    print(f"    {INDEX.relative_to(PROJECT_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
