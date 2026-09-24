"""Stage 03 - Validate: mechanical fields + checks against controlled lists.

Contract: ../CONTEXT.md

This stage does NOT change content. It attaches fields the model does not
produce (entry_id, hash, source pointers) and checks against your controlled
lists. Violations go to issues[], never silently corrected.
"""

import hashlib
import json
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

STAGE_DIR = Path(__file__).resolve().parents[1]
FLOW_ROOT = STAGE_DIR.parents[1]
PROJECT_ROOT = FLOW_ROOT.parents[1]

ENTRIES = STAGE_DIR.parent / "02_read" / "output" / "entries.json"
METADATA = STAGE_DIR.parent / "00_prepare" / "output" / "metadata.json"
OUTPUT = STAGE_DIR / "output" / "validated.json"

# Self-contained by default: your own roster and unit-code canon live inside
# this workspace. Repoint these two constants if your organization keeps them
# somewhere else - see _config/teamRoster.md for the tradeoffs.
ROSTER_FILE = PROJECT_ROOT / "_config" / "teamRoster.md"
BUSINESS_UNIT_FILE = PROJECT_ROOT / "_config" / "businessUnitCodes.md"
VARIANTS_FILE = PROJECT_ROOT / "_config" / "teamMembers.md"

# Connector words and role labels that ride alongside names in a PIC cell
# ("Covering for Robert"). Neither people nor anomalies.
PIC_NOISE = {"for", "covering", "and", "backup", "acting"}

# Closed section vocabulary - see _context/10_row_schema.md
SECTION_CODES = {
    "finance": "FI", "business_unit": "BU", "product": "PM",
    "event": "EV", "case_study": "CS",
}

# A small set of Latin letters that don't decompose under NFD into a base
# letter plus a combining mark (e.g. a crossed l, a slashed o).
STROKE = str.maketrans({"ł": "l", "Ł": "L", "ø": "o", "Ø": "O", "đ": "d"})


def fold(value):
    value = value.translate(STROKE)
    return "".join(c for c in unicodedata.normalize("NFD", value)
                   if unicodedata.category(c) != "Mn").lower()


def load_roster():
    """Team roster from the controlling file ONLY. No copy in code."""
    if not ROSTER_FILE.is_file():
        return None
    names = []
    for line in ROSTER_FILE.read_text(encoding="utf-8").split("\n"):
        m = re.match(r"^-\s+(.+?)(?:\s*\(([^)]+)\))?\s*$", line)
        if m and m.group(1).strip():
            names.append(m.group(1).strip())
    return names


def split_pic(cell, roster, variants):
    """Splits a run-together PIC cell by matching against the roster.

    This is a dictionary lookup, i.e. DETERMINISTIC work - which is why it
    lives here rather than in the model step. The model decides what the
    content means; it does not decide where one name ends and the next begins.
    """
    found, rest = [], fold(cell)
    for variant, canonical in variants.items():
        if variant in rest:
            found.append(canonical)
            rest = rest.replace(variant, " ")
    for name in sorted(roster, key=len, reverse=True):
        f = fold(name)
        if f in rest:
            found.append(name)
            rest = rest.replace(f, " ")
    leftover = " ".join(w for w in rest.split()
                        if len(w) > 2 and w.isalpha() and w not in PIC_NOISE)
    return sorted(set(found)), leftover


def load_variants():
    """Distorted spellings -> canonical name, from _config/teamMembers.md.

    This registry does NOT contain the roster - only forms not in the
    controlling file and that should not be there.
    """
    if not VARIANTS_FILE.is_file():
        return {}
    variants = {}
    for line in VARIANTS_FILE.read_text(encoding="utf-8").split(chr(10)):
        cells = [c.strip() for c in line.split("|")]
        if len(cells) >= 3 and cells[1] and not cells[1].startswith(("Variant", "-", "")):
            if set(cells[1]) <= set("-") or not cells[2]:
                continue
            variants[fold(cells[1])] = cells[2]
    return variants


def load_business_unit_codes():
    if not BUSINESS_UNIT_FILE.is_file():
        return None
    text = BUSINESS_UNIT_FILE.read_text(encoding="utf-8")
    codes = set(re.findall(r"^\|\s*([A-Z0-9]+)\s*\|", text, re.MULTILINE))
    return codes or None


def main():
    for path, label in ((ENTRIES, "Stage 02"), (METADATA, "Stage 00")):
        if not path.is_file():
            print(f"ERROR: {path.name} not found - run {label} first.", file=sys.stderr)
            return 1

    entries = json.loads(ENTRIES.read_text(encoding="utf-8"))
    metadata = json.loads(METADATA.read_text(encoding="utf-8"))
    doc_key = metadata["doc_key"]

    roster = load_roster()
    variants = load_variants()
    business_units = load_business_unit_codes()
    issues = []
    if not roster:
        issues.append("NOTE: no roster in _config/teamRoster.md yet - pic field left unchecked")
    if business_units is None:
        issues.append(f"NOTE: no codes in {BUSINESS_UNIT_FILE.name} - unit codes left unchecked")

    seq = {}
    validated = []
    for index, entry in enumerate(entries):
        section = entry.get("section")
        activity = entry.get("activity", "")

        # Gate: an entry with no content has no reason to exist.
        if not activity.strip():
            print(f"ERROR: entry {index} has no content - run stopped.", file=sys.stderr)
            return 1

        if section not in SECTION_CODES:
            issues.append(f"entry {index}: section '{section}' outside the vocabulary")
            code = "XX"
        else:
            code = SECTION_CODES[section]

        seq[code] = seq.get(code, 0) + 1
        entry_id = f"{doc_key}-{code}-{seq[code]:02d}"

        if section == "business_unit" and business_units and entry.get("object_name") not in business_units:
            issues.append(f"{entry_id}: unit code '{entry.get('object_name')}' outside canon")

        # An entry arrives either with a `pic` list already, or with a raw
        # `pic_raw` cell still to be split.
        if "pic_raw" in entry and roster:
            pic, leftover = split_pic(entry["pic_raw"], roster, variants)
            if leftover:
                issues.append(f"{entry_id}: '{leftover}' in the PIC field is not in the controlling file")
        else:
            pic = entry.get("pic", [])
            if roster:
                known = {fold(n) for n in roster}
                for person in pic:
                    if fold(person) not in known:
                        issues.append(f"{entry_id}: '{person}' is not in the controlling file")

        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(entry.get("report_date", ""))):
            issues.append(f"{entry_id}: report_date '{entry.get('report_date')}' is not an ISO date")

        validated.append({
            "entry_id": entry_id,
            "source_file": metadata["source_file"],
            "source_type": metadata["source_type"],
            "report_date": entry.get("report_date"),
            "section": section,
            "object_name": entry.get("object_name"),
            "pic": pic,
            "client": entry.get("client", "—"),
            "bo": entry.get("bo", "—"),
            # category / subcategory / category_conf are added by index_kb.
            "activity": activity,
            "activity_sha256": hashlib.sha256(activity.encode("utf-8")).hexdigest(),
            "raw_ref": f"_kb/md/{doc_key}.md#{entry_id}",
        })

    ids = [e["entry_id"] for e in validated]
    if len(ids) != len(set(ids)):
        print("ERROR: entry_id values are not unique - run stopped.", file=sys.stderr)
        return 1

    result = {
        "stage": "03_validate",
        "validated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "doc_key": doc_key,
        "entry_count": len(validated),
        "issues": issues,
        "entries": validated,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"OK  {doc_key}  entries: {len(validated)}")
    print(f"    roster from controlling file: {len(roster) if roster else 0} people   variants: {len(variants)}")
    print(f"    {OUTPUT.relative_to(PROJECT_ROOT)}")
    if issues:
        print(f"\n  TO REVIEW ({len(issues)}):")
        for item in issues:
            print(f"    - {item}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
