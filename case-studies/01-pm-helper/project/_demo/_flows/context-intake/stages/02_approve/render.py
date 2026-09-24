"""Etap 02 — Approve, krok 1: renderuj propozycje do czytelnego pliku. Patrz CONTEXT.md."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "_scripts"))
import paths  # noqa: E402

PROPOSALS = Path(__file__).resolve().parent.parent / "01_propose" / "output" / "proposals.jsonl"


def main() -> int:
    if not PROPOSALS.exists():
        print("Brak output/proposals.jsonl w etapie 01_propose — uruchom go najpierw.")
        return 1

    rows = [
        json.loads(line)
        for line in PROPOSALS.read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]

    lines = [
        "# Propozycje kontekstu — do decyzji PM",
        "",
        "Przy kazdej pozycji wpisz decyzje w polu `decyzja`: APPROVED / REJECTED / EDITED.",
        "Dla EDITED wypelnij tez `poprawiona_tresc`. Brak decyzji (PROPOSED) = pozycja NIE",
        "wejdzie do kontekstu.",
        "",
    ]
    for row in rows:
        lines += [
            f"## [{row['proposal_id']}] {row['category']}",
            f"- value: {row['value']}",
            f"- evidence: \"{row['evidence']}\"",
            f"- source_ref: {row['source_ref']}",
            "- decyzja: PROPOSED",
            "- poprawiona_tresc:",
            "",
        ]

    paths.CONTEXT_PROPOSALS.mkdir(parents=True, exist_ok=True)
    out = paths.CONTEXT_PROPOSALS / "candidate_context.md"
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Zapisano {len(rows)} propozycji do {out} — czeka na decyzje PM.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
