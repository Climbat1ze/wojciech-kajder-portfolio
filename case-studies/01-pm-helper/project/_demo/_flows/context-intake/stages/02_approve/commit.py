"""Etap 02 — Approve, krok 3: scal zatwierdzone pozycje do project_context.md. Patrz CONTEXT.md.

Bramka: pozycja bez jawnej decyzji PM (`decyzja: PROPOSED`, czyli nietknieta) NIE trafia do
project_context.md. To jest twarde wymaganie, nie do ominiecia nawet gdy wszystkie propozycje
wygladaja bezspornie.
"""
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "_scripts"))
import paths  # noqa: E402

ITEM_RE = re.compile(
    r"## \[(?P<id>[^\]]+)\] (?P<category>\w+)\n"
    r"- value: (?P<value>.*)\n"
    r"- evidence: \"(?P<evidence>.*)\"\n"
    r"- source_ref: (?P<source_ref>.*)\n"
    r"- decyzja: (?P<decision>\w+)\n"
    r"- poprawiona_tresc:[ \t]*(?P<edited>.*)"
)


def parse_candidates(text: str) -> list[dict]:
    return [{k: v.strip() for k, v in m.groupdict().items()} for m in ITEM_RE.finditer(text)]


def main() -> int:
    candidate = paths.CONTEXT_PROPOSALS / "candidate_context.md"
    if not candidate.exists():
        print("Brak candidate_context.md — uruchom render.py najpierw.")
        return 1

    items = parse_candidates(candidate.read_text(encoding="utf-8"))
    if not items:
        print("Nie znaleziono pozycji do przetworzenia w candidate_context.md.")
        return 1

    approved: list[dict] = []
    decisions: list[dict] = []
    now = datetime.now(timezone.utc).isoformat()
    skipped = 0

    for item in items:
        decision = item["decision"].upper()
        if decision not in {"APPROVED", "REJECTED", "EDITED", "PROPOSED"}:
            print(f"BLAD: nieznana decyzja '{item['decision']}' dla {item['id']}")
            return 1
        if decision == "PROPOSED":
            skipped += 1
            decisions.append({**item, "decided_by": None, "decided_at": None})
            continue
        final_value = item["edited"] if decision == "EDITED" and item["edited"] else item["value"]
        decisions.append({**item, "final_value": final_value, "decided_by": "PM", "decided_at": now})
        if decision in {"APPROVED", "EDITED"}:
            approved.append({**item, "final_value": final_value})

    existing = (
        paths.PROJECT_CONTEXT.read_text(encoding="utf-8")
        if paths.PROJECT_CONTEXT.exists()
        else "# Kontekst projektu\n\nNiemutowalny poza przeplywem context-intake. Patrz\n"
        "_context/00_method.md, regula 4.\n"
    )

    by_category: dict[str, list[str]] = {}
    for item in approved:
        if item["final_value"] in existing:
            continue
        by_category.setdefault(item["category"], []).append(item["final_value"])

    addition = ""
    for category, values in by_category.items():
        addition += f"\n## {category}\n"
        for v in values:
            addition += f"- {v}\n"

    paths.PROJECT_CONTEXT.parent.mkdir(parents=True, exist_ok=True)
    paths.PROJECT_CONTEXT.write_text(existing + addition, encoding="utf-8")

    archive = paths.CONTEXT_PROPOSALS / (
        datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M%S") + "_decisions.jsonl"
    )
    with archive.open("w", encoding="utf-8") as f:
        for d in decisions:
            f.write(json.dumps(d, ensure_ascii=False) + "\n")

    print(
        f"Zatwierdzono {len(approved)}/{len(items)} pozycji "
        f"({skipped} bez decyzji PM — pominiete zgodnie z bramka). "
        f"Archiwum decyzji: {archive.name}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
