"""Audyt zgodności kanonu i bazy zdarzeń. Uruchom: python check_canon.py"""
from __future__ import annotations
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import paths  # noqa: E402
import hashing  # noqa: E402

_EVENT_TYPE_ROW = re.compile(r"\|\s*\*\*(\w+)\*\*\s*\|\s*(\w\w)\s*\|")
_AREA_ROW = re.compile(r"\|\s*\*\*([^*]+)\*\*\s*\|[^|]*\|\s*(\w{3})\s*\|")

_REQUIRED_EVENT_FIELDS = {
    "entry_id", "doc_key", "source_type", "source_file", "event_date", "author",
    "author_email", "type", "pmbok_area", "title", "evidence", "evidence_sha256",
    "raw_ref", "owner", "due", "importance", "importance_by", "status", "status_by",
    "relations", "thread_id", "confirmed", "rejected", "issues",
}


def load_event_types() -> dict[str, str]:
    text = (paths.CANON / "10_event_types_relations.md").read_text(encoding="utf-8")
    section = text.split("## Typy zdarzeń")[1].split("## Waga")[0]
    return {code: name for name, code in _EVENT_TYPE_ROW.findall(section)}


def load_pmbok_areas() -> dict[str, str]:
    text = (paths.CANON / "20_pmbok_areas.md").read_text(encoding="utf-8")
    return {code: name.strip() for name, code in _AREA_ROW.findall(text)}


def _read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def check_events(event_types: dict, areas: dict) -> list[str]:
    problems = []
    for row in _read_jsonl(paths.EVENTS_JSONL):
        entry_id = row.get("entry_id", "?")
        missing = _REQUIRED_EVENT_FIELDS - row.keys()
        if missing:
            problems.append(f"{entry_id}: brakuje pól {sorted(missing)}")
        else:
            evidence = row.get("evidence", "")
            if not evidence:
                problems.append(f"{entry_id}: puste pole evidence (cytat) — napraw od źródła, po numerach linii")
            elif hashing.sha256_text(evidence) != row.get("evidence_sha256"):
                problems.append(f"{entry_id}: suma kontrolna cytatu nie zgadza się z jego treścią")
        if row.get("type") not in event_types.values():
            problems.append(f"{entry_id}: typ '{row.get('type')}' spoza kanonu")
        if row.get("pmbok_area") not in areas:
            problems.append(f"{entry_id}: obszar '{row.get('pmbok_area')}' spoza kanonu")
    return problems


def main() -> int:
    event_types = load_event_types()
    areas = load_pmbok_areas()
    print(f"Kanon typów zdarzeń: {len(event_types)} pozycji — {sorted(event_types)}")
    print(f"Kanon obszarów PMBOK 7: {len(areas)} pozycji — {sorted(areas)}")

    ok = True
    if len(event_types) != 8:
        print("BŁĄD: oczekiwano 8 typów zdarzeń.")
        ok = False
    if len(areas) != 8:
        print("BŁĄD: oczekiwano 8 obszarów PMBOK 7.")
        ok = False

    problems = check_events(event_types, areas)
    if problems:
        print(f"BŁĘDY w bazie zdarzeń ({len(problems)}):")
        for p in problems:
            print(f"  - {p}")
        ok = False
    else:
        print(f"Baza zdarzeń: {len(_read_jsonl(paths.EVENTS_JSONL))} wierszy, zgodna z kanonem.")

    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
