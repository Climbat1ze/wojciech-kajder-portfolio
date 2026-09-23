"""Etap 00 — Prepare. Patrz CONTEXT.md w tym folderze.

Tryb zwykły: nowe pliki z `_input/originals/`. Plik jest „już znany”, gdy ma tę samą TREŚĆ (suma
kontrolna bajtów) co przetworzony wcześniej — nazwa pliku nie decyduje, bo ten sam mail zapisany
przez dwie osoby ma dwie różne nazwy. Plik o znanej nazwie, ale zmienionej treści, nie jest
przetwarzany po cichu od nowa ani po cichu pomijany: dostaje ostrzeżenie w `output/skipped.json`.
Tryb `--backfill`: pliki znane bazie, które nie mają jeszcze rozbicia na wiadomości.
Tryb `--record-hashes`: dopisuje do bazy sumę kontrolną plików, które przetworzono, zanim ją
zapisywano (zakłada, że plik w `_input/originals/` jest tą przetworzoną wersją).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "_scripts"))
import paths  # noqa: E402
import io_jsonl  # noqa: E402
import hashing  # noqa: E402

OUTPUT = Path(__file__).resolve().parent / "output"


def doc_key_for(path: Path) -> str:
    return hashing.sha256_bytes(path.name.encode("utf-8") + b"\n" + path.read_bytes())[:16]


def content_sha(path: Path) -> str:
    return hashing.sha256_bytes(path.read_bytes())


def main() -> int:
    args = sys.argv[1:]
    backfill, record = "--backfill" in args, "--record-hashes" in args
    existing_docs = io_jsonl.read_all(paths.DOCUMENTS_JSONL)
    sources = paths.input_files(paths.INPUT_ORIGINALS)

    if record:
        by_name = {p.name: p for p in sources}
        added = 0
        for d in existing_docs:
            if d.get("content_sha256") in (None, "", "—") and d["source_file"] in by_name:
                d["content_sha256"] = content_sha(by_name[d["source_file"]])
                added += 1
        io_jsonl.write_all(paths.DOCUMENTS_JSONL, existing_docs)
        print(f"Dopisano sumę kontrolną do {added} dokumentów (z {len(existing_docs)}).")
        return 0

    by_name = {d["source_file"]: d for d in existing_docs}
    by_sha = {d["content_sha256"]: d for d in existing_docs if d.get("content_sha256") not in (None, "", "—")}
    with_messages = {occ["doc_key"] for m in io_jsonl.read_all(paths.MESSAGES_JSONL) for occ in m.get("seen_in", [])}

    new_docs, skipped = [], []
    for path in sources:
        sha = content_sha(path)
        known = by_name.get(path.name)
        if known is None and sha in by_sha:
            skipped.append({"file": path.name, "reason": "duplicate", "same_as": by_sha[sha]["source_file"]})
            continue
        if backfill:
            if known is None or known["doc_key"] in with_messages:
                continue
        elif known is not None:
            stored = known.get("content_sha256")
            if stored not in (None, "", "—") and stored != sha:
                skipped.append({"file": path.name, "reason": "changed", "same_as": path.name})
            continue
        new_docs.append({
            "doc_key": known["doc_key"] if known else doc_key_for(path),
            "source_file": path.name,
            "source_type": path.suffix.lstrip(".").lower(),
            "content_sha256": sha,
            **({"backfill": True} if backfill else {}),
        })

    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / "documents.json").write_text(json.dumps(new_docs, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUTPUT / "skipped.json").write_text(json.dumps(skipped, ensure_ascii=False, indent=2), encoding="utf-8")
    what = "do uzupelnienia o wiadomosci" if backfill else "do przetworzenia"
    print(f"Dokumenty {what}: {len(new_docs)}; pominiete jako duplikaty: {sum(s['reason'] == 'duplicate' for s in skipped)}; "
          f"zmienione od przetworzenia: {sum(s['reason'] == 'changed' for s in skipped)}.")
    for s in skipped:
        if s["reason"] == "duplicate":
            print(f"  DUPLIKAT: '{s['file']}' ma te sama tresc co juz przetworzony '{s['same_as']}' — pominiety.")
        else:
            print(f"  ZMIENIONY: '{s['file']}' rozni sie od przetworzonej wersji — NIE przetwarzam po cichu; "
                  "zmien nazwe pliku, jesli to nowa wersja do przetworzenia.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
