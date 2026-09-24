"""Stage 00 - Filter: question -> field conditions -> matching rows.

Contract: ../CONTEXT.md

Retrieval is STRUCTURAL, not semantic: narrowing happens by index field. This
is what makes it cheap, explainable, and workable without a vector database.
The model gets ONLY the hits - never the whole index.
"""

import argparse
import json
import sys

# Force UTF-8 regardless of the console's default codepage.
sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path

STAGE_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = STAGE_DIR.parents[3]
INDEX = PROJECT_ROOT / "_kb" / "activities.jsonl"
OUTPUT = STAGE_DIR / "output" / "hits.json"

sys.path.insert(0, str(PROJECT_ROOT / "_scripts"))
import kb_query  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description="Knowledge-base index filter")
    kb_query.add_filters(ap)
    ap.add_argument("--question", default="", help="the natural-language question, to hand to the model")
    args = ap.parse_args()

    # Reading and narrowing live in _scripts/kb_query.py, shared with
    # kb_stats.py - a private copy here could eventually answer the same
    # question differently.
    rows = kb_query.load()
    if rows is None:
        return 1
    total = len(rows)

    hits = kb_query.narrow(rows, args)

    # Incompleteness signal: TBD rows might belong to the category asked
    # about but were never classified. The model must surface this.
    tbd = sum(1 for r in rows if r.get("category") == "TBD")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({
        "question": args.question,
        "conditions": {k: v for k, v in vars(args).items() if v and k != "question"},
        "rows_in_index": total,
        "hits": len(hits),
        "tbd_rows_in_whole_index": tbd,
        "rows": hits,
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"index: {total} rows   hits: {len(hits)}   TBD in index: {tbd}")
    for r in hits:
        print(f"  {r['entry_id']}  {r['object_name']:14} {r.get('client','—')[:34]:34} {r.get('category','—')}")
    print(f"\n{OUTPUT.relative_to(PROJECT_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
