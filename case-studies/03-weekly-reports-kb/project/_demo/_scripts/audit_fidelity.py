# -*- coding: utf-8 -*-
"""Independent fidelity check: index against source file.

The gates inside `build_kb` check fidelity against text the run itself
produced. This script does something different: it takes entries from the
finished `activities.jsonl`, decodes the `.msg`/`.docx` source FROM SCRATCH
with the shared extractor, and checks whether `activity` still appears
verbatim in that freshly recovered text, and whether `activity_sha256`
matches the content.

The difference matters: a gate proves one run was internally consistent; this
script proves the index can still be reconstructed from the sources after the
fact.

Usage:  python _scripts/audit_fidelity.py [document_count]
"""

import hashlib
import json
import random
import subprocess
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "_kb" / "activities.jsonl"
EXTRACT = ROOT / "_scripts" / "extract_source.py"
INPUT = ROOT / "_input"
PREPARE = ROOT / "_flows" / "build_kb" / "stages" / "00_prepare" / "_scripts" / "prepare.py"

sys.path.insert(0, str(ROOT / "_scripts"))
from extract_source import extract  # noqa: E402


def sources():
    """doc_key -> source file path.

    The key is derived by `00_prepare`, so we ask it rather than keep our own
    copy of that rule — a private copy would drift the moment the naming
    convention changes.
    """
    r = subprocess.run([sys.executable, str(PREPARE), "--list"],
                       capture_output=True, text=True, encoding="utf-8")

    # Without this check, a broken listing silently reads as "nothing was
    # checked, so zero drift" — a false green in the one script whose entire
    # job is catching drift. This has happened for real: two source files
    # collided on the same document key, `00_prepare` correctly refused, and
    # the audit still reported OK.
    if r.returncode != 0:
        print("ERROR: could not determine the list of source documents.", file=sys.stderr)
        print(r.stderr.rstrip(), file=sys.stderr)
        return None

    mapping = {}
    for line in r.stdout.splitlines():
        line = line.strip()
        if not line or not line[:1].isdigit():
            continue
        key, name = line.split(None, 1)
        # Filenames can repeat across periods, so the key's own year/period
        # segment must be part of the match, not just the bare filename.
        year = key[:4]
        hit = next((c for c in INPUT.rglob(name) if year in str(c)), None)
        if hit:
            mapping[key] = hit
    return mapping


def source_text(path):
    """The same text the model saw - through the same extraction primitive.

    Comparing against raw HTML would be meaningless: entries were produced
    from text after normalisation, so the check must use that same
    normalisation. The independence of this check comes from recovering the
    text from the source file again, not from re-reading a run's own artifact.
    """
    d = extract(path)
    return None if "error" in d else d.get("text", "")


def main():
    entries = [json.loads(l) for l in INDEX.read_text(encoding="utf-8").splitlines() if l.strip()]
    mapping = sources()
    if mapping is None:
        return 1

    keys = sorted({w["entry_id"][:8] for w in entries})

    # Default: the WHOLE corpus. A sample is convenient while building the
    # script, but as a default behaviour it gives a false sense of coverage:
    # "0 mismatches" on six documents out of forty-eight is not a result, it's
    # a promise.
    count = int(sys.argv[1]) if len(sys.argv) > 1 else len(keys)
    if count >= len(keys):
        sample = keys
    else:
        random.seed(20260829)
        sample = sorted(random.sample(keys, count))
        print(f"NOTE: checking a sample of {count} of {len(keys)} documents.\n")

    skipped = 0
    checked = bad_hash = bad_content = 0
    for key in sample:
        path = mapping.get(key)
        if not path:
            print(f"  {key}: no source file found - SKIPPED")
            skipped += 1
            continue
        text = source_text(path)
        if text is None:
            print(f"  {key}: extraction failed - SKIPPED")
            skipped += 1
            continue
        group = [w for w in entries if w["entry_id"].startswith(key)]
        for w in group:
            checked += 1
            a = w["activity"]
            if hashlib.sha256(a.encode("utf-8")).hexdigest() != w.get("activity_sha256"):
                bad_hash += 1
                print(f"  HASH MISMATCH: {w['entry_id']}")
            if a not in text:
                bad_content += 1
                print(f"  CONTENT NOT IN SOURCE: {w['entry_id']}  {a[:70]}")
        print(f"  {key}: {len(group)} entries checked against {path.name}")

    print()
    print(f"documents: {len(sample)}   checked: {len(sample) - skipped}   skipped: {skipped}")
    print(f"entries: {checked}   hash mismatches: {bad_hash}   "
          f"content not in source: {bad_content}")

    # A skipped document is missing evidence, not proof of correctness — end
    # in error so "OK" never means "couldn't actually check".
    if skipped:
        print(f"\nERROR: {skipped} document(s) could not be checked.", file=sys.stderr)
        return 1
    if bad_hash or bad_content:
        return 1
    print(f"\nOK - {checked} entries reconstructed from source with no mismatch")
    return 0


if __name__ == "__main__":
    sys.exit(main())
