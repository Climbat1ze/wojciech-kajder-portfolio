"""Kontrola spójności bazy wiadomości i wątków. Uruchom: python check_kb.py
Zwraca kod 1, gdy coś się nie zgadza. Patrz `_context/30_row_schema.md`."""
from __future__ import annotations
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import paths  # noqa: E402
import io_jsonl  # noqa: E402


def check() -> list[str]:
    problems: list[str] = []
    events = io_jsonl.read_all(paths.EVENTS_JSONL)
    docs = {d["doc_key"]: d for d in io_jsonl.read_all(paths.DOCUMENTS_JSONL)}
    messages = io_jsonl.read_all(paths.MESSAGES_JSONL)
    threads = {t["thread_id"]: t for t in io_jsonl.read_all(paths.THREADS_JSONL)}
    links = io_jsonl.read_all(paths.THREAD_LINKS_JSONL)
    by_key = {m["message_key"]: m for m in messages}

    if len(by_key) != len(messages):
        problems.append("klucze wiadomości się powtarzają")
    ranges: dict[str, list[tuple[int, int, str]]] = {}
    for m in messages:
        k = m["message_key"]
        if not m.get("seen_in"):
            problems.append(f"{k}: wiadomość bez żadnego pliku (seen_in puste)")
        for o in m.get("seen_in", []):
            if o["doc_key"] not in docs:
                problems.append(f"{k}: plik {o['doc_key']} nie istnieje w documents.jsonl")
            ranges.setdefault(o["doc_key"], []).append((o["lines"]["start"], o["lines"]["end"], k))
        if m["thread_id"] not in threads:
            problems.append(f"{k}: wątek {m['thread_id']} nie istnieje w threads.jsonl")
        if m["replies_to"] != "—" and m["replies_to"] not in by_key:
            problems.append(f"{k}: replies_to wskazuje nieistniejącą wiadomość")
        if m["reply_state"] not in ("answered", "no_reply", "info"):
            problems.append(f"{k}: nieznany stan odpowiedzi '{m['reply_state']}'")
    for doc_key, rs in ranges.items():
        rs.sort()
        for (s1, e1, k1), (s2, e2, k2) in zip(rs, rs[1:]):
            if s2 <= e1:
                problems.append(f"plik {doc_key}: zakresy wiadomości {k1} i {k2} zachodzą na siebie")

    for e in events:
        if not e.get("message_key") or e["message_key"] == "—":
            problems.append(f"{e['entry_id']}: zdarzenie bez wiadomości (uruchom uzupełnienie: 00_prepare --backfill)")
        elif e["message_key"] not in by_key:
            problems.append(f"{e['entry_id']}: wiadomość {e['message_key']} nie istnieje")
        elif e["thread_id"] != by_key[e["message_key"]]["thread_id"]:
            problems.append(f"{e['entry_id']}: wątek zdarzenia różni się od wątku jego wiadomości")
    for d in docs.values():
        if d["thread_id"] != "—" and d["thread_id"] not in threads:
            problems.append(f"dokument {d['source_file']}: wątek {d['thread_id']} nie istnieje")

    seen_ids = set()
    for l in links:
        if l["link_id"] in seen_ids:
            problems.append(f"powiązanie {l['link_id']} występuje dwa razy")
        seen_ids.add(l["link_id"])
        for side in ("from_thread", "to_thread"):
            if l[side] not in threads:
                problems.append(f"powiązanie {l['link_id']}: wątek {l[side]} nie istnieje")
        if l["status"] not in ("suggested", "confirmed", "rejected"):
            problems.append(f"powiązanie {l['link_id']}: nieznany status {l['status']}")
    for t in threads.values():
        if any(k not in by_key for k in t["message_keys"]):
            problems.append(f"wątek {t['thread_id']}: wskazuje nieistniejącą wiadomość")
        if not re.fullmatch(r"THR-\d{3,}", t["thread_id"]):
            problems.append(f"wątek {t['thread_id']}: zły format numeru")
    return problems


def main() -> int:
    problems = check()
    if problems:
        print(f"BŁĘDY ({len(problems)}):")
        for p in problems:
            print(f"  - {p}")
        return 1
    print("Baza wiadomości i wątków spójna: "
          f"{len(io_jsonl.read_all(paths.MESSAGES_JSONL))} wiadomości, "
          f"{len(io_jsonl.read_all(paths.THREADS_JSONL))} wątków, "
          f"{len(io_jsonl.read_all(paths.THREAD_LINKS_JSONL))} powiązań.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
