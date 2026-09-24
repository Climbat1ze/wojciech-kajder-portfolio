"""Stage 00 - Prepare: determine the document key and metadata.

Contract: ../CONTEXT.md
Never picks a document on its own. A key collision stops the run.
"""

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

STAGE_DIR = Path(__file__).resolve().parents[1]
FLOW_ROOT = STAGE_DIR.parents[1]
PROJECT_ROOT = FLOW_ROOT.parents[1]
INPUT_ROOT = PROJECT_ROOT / "_input"
OUTPUT = STAGE_DIR / "output" / "metadata.json"

# Matches an input directory named "<anything> 2025" — adjust the label if your
# own convention differs from "Reports {YYYY}".
PERIOD_YEAR_DIR = re.compile(r"(\d{4})")
WEEK_IN_NAME = re.compile(r"W(\d{1,2})", re.IGNORECASE)
SUPPORTED = {".msg": "msg", ".docx": "docx"}


def year_from_path(path: Path):
    """Year comes from the directory, never the filename — filenames repeat across years."""
    for part in path.parts:
        if part == path.name:
            continue
        m = PERIOD_YEAR_DIR.search(part)
        if m:
            return m.group(1)
    return None


def doc_key_for(path: Path):
    year = year_from_path(path)
    if not year:
        return None, "no year found in the containing directory name"
    m = WEEK_IN_NAME.search(path.stem)
    if not m:
        return None, "no week number found in the filename"
    return f"{year}-W{int(m.group(1)):02d}", None


def collect():
    """Returns (key -> [paths], list of skipped files with reasons)."""
    keyed, skipped = {}, []
    for path in sorted(INPUT_ROOT.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED:
            continue
        if "_old" in path.stem.lower():
            skipped.append((path, "'_old' variant"))
            continue
        key, err = doc_key_for(path)
        if err:
            skipped.append((path, err))
            continue
        keyed.setdefault(key, []).append(path)
    return keyed, skipped


def sha256_of(path: Path):
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser(description="Stage 00 - Prepare")
    ap.add_argument("--key", help="document key, e.g. 2025-W05")
    ap.add_argument("--file", help="explicit path to a source file")
    ap.add_argument("--list", action="store_true", help="print available keys and exit")
    args = ap.parse_args()

    if not INPUT_ROOT.is_dir():
        print(f"ERROR: input directory not found: {INPUT_ROOT}", file=sys.stderr)
        return 1

    keyed, skipped = collect()

    # Gate 1: key collisions stop the run.
    collisions = {k: v for k, v in keyed.items() if len(v) > 1}
    if collisions:
        print("ERROR: document key collision - run stopped.", file=sys.stderr)
        print("Point at the canonical document; move the other one out of _input/.", file=sys.stderr)
        print("Resolution rule: _context/10_row_schema.md\n", file=sys.stderr)
        for key, paths in sorted(collisions.items()):
            print(f"  {key}:", file=sys.stderr)
            for p in paths:
                print(f"     {p.stat().st_size:>9} B  {p.relative_to(PROJECT_ROOT)}", file=sys.stderr)
        return 1

    if args.list or not (args.key or args.file):
        print(f"Available documents: {len(keyed)}")
        for key in sorted(keyed):
            print(f"  {key}  {keyed[key][0].name}")
        if skipped:
            print(f"\nSkipped: {len(skipped)}")
            for path, why in skipped:
                print(f"  {why}: {path.name}")
        if args.list:
            return 0
        # Gate 2: no explicit choice is a refusal to guess, not an error.
        print("\nPoint at a document: --key <key> or --file <path>.", file=sys.stderr)
        print("This stage never picks 'the latest one' - that is how silent substitutions happen.", file=sys.stderr)
        return 2

    if args.file:
        source = Path(args.file).resolve()
        if not source.is_file():
            print(f"ERROR: file not found: {source}", file=sys.stderr)
            return 1
        key, err = doc_key_for(source)
        if err:
            print(f"ERROR: cannot determine a key ({err}): {source.name}", file=sys.stderr)
            return 1
    else:
        key = args.key
        if key not in keyed:
            print(f"ERROR: unknown key {key!r}. Use --list.", file=sys.stderr)
            return 1
        source = keyed[key][0]

    year, week = key.split("-W")
    metadata = {
        "stage": "00_prepare",
        "prepared_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "doc_key": key,
        "year": int(year),
        "week": int(week),
        "source_file": source.name,
        "source_path": str(source.relative_to(PROJECT_ROOT)),
        "source_type": SUPPORTED[source.suffix.lower()],
        "file_size": source.stat().st_size,
        "file_sha256": sha256_of(source),
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK  {key}  <-  {source.name}")
    print(f"    {OUTPUT.relative_to(PROJECT_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
