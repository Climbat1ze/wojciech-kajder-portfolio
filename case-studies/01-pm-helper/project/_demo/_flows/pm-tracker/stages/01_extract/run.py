"""Etap 01 — Extract. Patrz CONTEXT.md w tym folderze."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "_scripts"))
import paths  # noqa: E402
import decode_source  # noqa: E402

PREPARE_OUTPUT = Path(__file__).resolve().parent.parent / "00_prepare" / "output" / "documents.json"
OUTPUT = Path(__file__).resolve().parent / "output"


def main() -> int:
    if not PREPARE_OUTPUT.exists():
        print("Brak output z 00_prepare — uruchom go najpierw.")
        return 1
    docs = json.loads(PREPARE_OUTPUT.read_text(encoding="utf-8"))

    raw = []
    for doc in docs:
        path = paths.INPUT_ORIGINALS / doc["source_file"]
        decoded = decode_source.decode(path)
        raw.append({
            "doc_key": doc["doc_key"],
            "source_file": doc["source_file"],
            "source_type": doc["source_type"],
            "content_sha256": doc.get("content_sha256", "—"),
            "metadata": decoded.metadata,
            "text": decoded.text,
        })

    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / "raw_text.json").write_text(
        json.dumps(raw, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Zdekodowano {len(raw)} dokumentow.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
