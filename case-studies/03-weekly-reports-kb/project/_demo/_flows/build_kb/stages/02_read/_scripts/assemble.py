"""Stage 02 - tool that assembles entries from the model's DECISIONS.

Contract: ../CONTEXT.md

The division of labour this script enforces:
  - The MODEL decides: where an entry starts and ends, which section it is,
    who the client is, what the opportunity id is. These are judgment calls
    requiring understanding.
  - The SCRIPT copies: the `activity` content is CUT from the source text,
    never retyped from the model's memory of it.

This drops the risk of transcription errors across thousands of characters to
zero - and, crucially, makes that provable: every `activity` must occur
verbatim in the input text.

Input: spec.json next to this script (written by the model), shaped as:
  {
    "report_date": "YYYY-MM-DD",
    "finance": [[label_line, value_line], ...],
    "sections": {"business_unit": [19, 26], "product": [32, 55]},   # inclusive range
    "event_cols": 4,          # the event section has a Date column before PIC
    "meta": {"19": ["Trailhead Logistics", "—"]}
  }
"""

import json
import sys
from pathlib import Path

STAGE_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = STAGE_DIR.parents[3]
RAW = STAGE_DIR.parent / "01_extract" / "output" / "raw_text.json"
SPEC_DIR = Path(__file__).resolve().parent


def spec_for(doc_key):
    """Per-document spec, so every run can be reproduced.

    Without this, one document's decisions would be overwritten by the next,
    and the corpus could never be reprocessed from scratch.
    """
    per_doc = SPEC_DIR / f"spec_{doc_key}.json"
    return per_doc if per_doc.is_file() else SPEC_DIR / "spec.json"


OUTPUT = STAGE_DIR / "output" / "entries.json"


def main():
    raw = json.loads(RAW.read_text(encoding="utf-8"))
    doc_key = raw["doc_key"]
    spec_path = spec_for(doc_key)
    if not spec_path.is_file():
        print(f"ERROR: spec_{doc_key}.json not found - the model must write its decisions first.", file=sys.stderr)
        return 1

    text = raw["text"]
    lines = text.split(chr(10))
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    # report_date defaults to the message header if the spec doesn't set it -
    # one less field to copy by hand, one less place to get it wrong.
    date = spec.get("report_date") or (raw["message_meta"].get("date") or "")[:10]
    if not date:
        print("ERROR: no report_date in the spec or in the message header.", file=sys.stderr)
        return 1
    meta = {int(k): v for k, v in spec.get("meta", {}).items()}

    entries = []
    for entry_lines in spec.get("finance", []):
        # A value sometimes spans several lines (a metric with a footnote).
        # Format accepts [label, value, ...].
        label_i, value_idx = entry_lines[0], entry_lines[1:]
        entries.append({
            "report_date": date, "section": "finance",
            "object_name": lines[label_i].rstrip(":"),
            "pic": [], "client": "—", "bo": "—",
            "activity": chr(10).join([lines[label_i]] + [lines[v] for v in value_idx]),
        })

    for section, spans in spec.get("sections", {}).items():
        # A range can be non-contiguous when a nested table interrupts it -
        # the extractor leaves a shortened duplicate between rows that is not
        # itself a data row. Format accepts [start, end] or a list of such pairs.
        if spans and isinstance(spans[0], list):
            indices = [i for s_, e_ in spans for i in range(s_, e_ + 1)]
        else:
            indices = list(range(spans[0], spans[1] + 1))
        for i in indices:
            cols = [c.strip() for c in lines[i].split(" | ")]
            # Gate: the spec points at a line that isn't a table row. Happens
            # when the source text changed after an extraction fix but the
            # spec is stale.
            if len(cols) < 3:
                print(f"ERROR: line {i} is not a table row ({len(cols)} column(s)).", file=sys.stderr)
                print(f"       content: {lines[i][:90]}", file=sys.stderr)
                print(f"       Re-scan the document and fix spec_{doc_key}.json.", file=sys.stderr)
                return 1
            if section == "event" and len(cols) >= 4:
                pic_cell, activity = cols[2], cols[3]
            else:
                pic_cell, activity = cols[1], cols[2]
            client, bo = meta.get(i, ["—", "—"])
            entries.append({
                "report_date": date, "section": section, "object_name": cols[0],
                "pic_raw": pic_cell, "client": client, "bo": bo, "activity": activity,
            })

    # Gate: content must come from the source, never from memory.
    bad = [e for e in entries if e["activity"] not in text]
    if bad:
        print(f"ERROR: {len(bad)} entries have content not found in the source text.", file=sys.stderr)
        return 1

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")

    from collections import Counter
    c = Counter(e["section"] for e in entries)
    print(f"OK  entries: {len(entries)}   " + "  ".join(f"{k}={v}" for k, v in sorted(c.items())))
    print(f"    fidelity: {len(entries)}/{len(entries)} activity found verbatim in source")
    print(f"    spec: {spec_path.name}")
    print(f"    {OUTPUT.relative_to(PROJECT_ROOT)}")
    print("\n    NOTE: pic_raw still needs splitting into canonical names - Stage 03 does that.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
