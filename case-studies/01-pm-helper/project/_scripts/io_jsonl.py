"""Odczyt/zapis/upsert bazy w formacie JSON Lines. Jedyne miejsce, które dotyka plików .jsonl."""
from __future__ import annotations
import json
from pathlib import Path


def read_all(path: Path) -> list[dict]:
    if not path.exists():
        return []
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            rows.append(json.loads(line))
    return rows


def write_all(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def upsert(path: Path, new_rows: list[dict], key: str) -> list[dict]:
    """Nowy wiersz zastępuje istniejący o tym samym `key`; reszta zostaje. Nigdy zwykły append."""
    existing = read_all(path)
    by_key = {row[key]: row for row in existing}
    for row in new_rows:
        by_key[row[key]] = row
    merged = list(by_key.values())
    write_all(path, merged)
    return merged
