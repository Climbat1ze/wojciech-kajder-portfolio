"""Etap 00 — Collect. Patrz CONTEXT.md w tym folderze."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "_scripts"))
import paths  # noqa: E402
import decode_source  # noqa: E402
import hashing  # noqa: E402

OUTPUT = Path(__file__).resolve().parent / "output"


def doc_key_for(path: Path, text: str) -> str:
    return hashing.sha256_text(path.name + "\n" + text)[:16]


def main() -> int:
    sources = paths.input_files(paths.CONTEXT_SOURCES)
    if not sources:
        print("BRAMKA: brak plikow w _context_sources/ — nie ma z czego zbudowac kontekstu.")
        return 1

    documents = []
    for path in sources:
        decoded = decode_source.decode(path)
        documents.append({
            "doc_key": doc_key_for(path, decoded.text),
            "source_file": path.name,
            "metadata": decoded.metadata,
            "text": decoded.text,
        })

    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / "documents.json").write_text(
        json.dumps(documents, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Zebrano {len(documents)} dokumentow z _context_sources/.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
