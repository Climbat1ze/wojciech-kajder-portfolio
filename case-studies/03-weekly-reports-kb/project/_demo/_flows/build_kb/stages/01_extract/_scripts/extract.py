"""Stage 01 - Extract: binary format -> clean text.

Contract: ../CONTEXT.md

Decoding is NOT implemented here. It delegates to the shared primitive
_scripts/extract_source.py, so a decoding fix happens once, not once per flow
that needs the same source text.
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

STAGE_DIR = Path(__file__).resolve().parents[1]
FLOW_ROOT = STAGE_DIR.parents[1]
PROJECT_ROOT = FLOW_ROOT.parents[1]
METADATA = STAGE_DIR.parent / "00_prepare" / "output" / "metadata.json"
OUTPUT = STAGE_DIR / "output" / "raw_text.json"

sys.path.insert(0, str(PROJECT_ROOT / "_scripts"))
from extract_source import extract  # noqa: E402


def main():
    if not METADATA.is_file():
        print(f"ERROR: {METADATA.relative_to(PROJECT_ROOT)} not found - run Stage 00 first.", file=sys.stderr)
        return 1

    metadata = json.loads(METADATA.read_text(encoding="utf-8"))
    source = PROJECT_ROOT / metadata["source_path"]

    extracted = extract(source)
    if "error" in extracted:
        print(f"ERROR: {extracted['error']}", file=sys.stderr)
        return 1

    text = extracted.get("text", "")

    # Gate: empty content stops the run.
    if not text.strip():
        print("ERROR: zero content after extraction - run stopped.", file=sys.stderr)
        print("There is no point calling a model on empty input.", file=sys.stderr)
        return 1

    result = {
        "stage": "01_extract",
        "extracted_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "doc_key": metadata["doc_key"],
        "source_file": metadata["source_file"],
        "source_type": metadata["source_type"],
        "content_origin": extracted.get("content_origin"),
        "message_meta": extracted.get("metadata", {}),
        "tables_found": extracted.get("tables_found", 0),
        "text_chars": len(text),
        "text": text,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"OK  {metadata['doc_key']}  content source: {result['content_origin']}")
    print(f"    characters: {len(text)}   tables: {result['tables_found']}")
    print(f"    {OUTPUT.relative_to(PROJECT_ROOT)}")
    if len(text) < 1000:
        print("    NOTE: under 1000 characters - check whether extraction actually worked.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
