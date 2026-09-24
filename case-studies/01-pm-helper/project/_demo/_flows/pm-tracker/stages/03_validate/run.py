"""Etap 03 — Validate. Patrz CONTEXT.md w tym folderze."""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "_scripts"))
import paths  # noqa: E402
import hashing  # noqa: E402
import io_jsonl  # noqa: E402
import threading_graph as tg  # noqa: E402

STAGES = Path(__file__).resolve().parent.parent
READ_OUTPUT = STAGES / "02_read" / "output" / "entries.json"
EXTRACT_OUTPUT = STAGES / "01_extract" / "output" / "raw_text.json"
PREPARE_OUTPUT = STAGES / "00_prepare" / "output" / "documents.json"
OUTPUT = Path(__file__).resolve().parent / "output"

FILE_TYPES = {"docx", "pptx", "xlsx", "pdf"}   # jedna „wiadomość” rodzaju file — zakłada ją skrypt
KINDS = {"original", "reply", "forward", "file"}
YES_NO = {"yes", "no", "unclear"}
_PLACEHOLDERS = {"", "—", "-", "metadata", None}

_TYPE_ROW = re.compile(r"\|\s*\*\*(\w+)\*\*\s*\|\s*(\w\w)\s*\|")
_AREA_ROW = re.compile(r"\|\s*\*\*([^*]+)\*\*\s*\|[^|]*\|\s*(\w{3})\s*\|")


def load_type_codes() -> dict[str, str]:
    text = (paths.CANON / "10_event_types_relations.md").read_text(encoding="utf-8")
    section = text.split("## Typy zdarzeń")[1].split("## Waga")[0]
    return {name: code for name, code in _TYPE_ROW.findall(section)}


def load_area_codes() -> set[str]:
    text = (paths.CANON / "20_pmbok_areas.md").read_text(encoding="utf-8")
    return {code for _, code in _AREA_ROW.findall(text)}


def build_messages(doc_entry: dict, raw_doc: dict, settings: dict) -> tuple[list[dict], list[str]]:
    """Rozbicie pliku na wiadomości (od modelu) -> wiersze z kluczem i stroną nadawcy.
    Zwraca (wiadomości, błędy twarde). Uwagi miękkie trafiają do `issues` wiadomości."""
    text_lines = raw_doc["text"].splitlines()
    meta = raw_doc["metadata"]
    source_type = raw_doc["source_type"]
    errors: list[str] = []
    given = doc_entry.get("messages") or []

    if not given:
        if source_type in FILE_TYPES:
            given = [{"n": 1, "kind": "file", "from": meta.get("from", "—"), "to": "—",
                      "sent_at": meta.get("date", "—"), "lines": {"start": 1, "end": max(len(text_lines), 1)},
                      "body_from": 1, "expects_reply": "no", "closes_thread": False, "awaiting": "—"}]
        else:
            return [], [f"'{raw_doc['source_file']}': model nie rozbił pliku na wiadomości (`messages` puste)"]

    rows: list[dict] = []
    previous_end = 0
    seen_keys: set[str] = set()
    for i, m in enumerate(given, start=1):
        issues: list[str] = []
        kind = m.get("kind", "reply")
        if kind not in KINDS:
            issues.append(f"rodzaj '{kind}' spoza kanonu")
            kind = "reply"
        start, end = m["lines"]["start"], m["lines"]["end"]
        if not (1 <= start <= end <= max(len(text_lines), 1)):
            errors.append(f"'{raw_doc['source_file']}' wiadomość {i}: zakres linii {start}-{end} poza tekstem ({len(text_lines)} linii)")
            continue
        if start <= previous_end:
            errors.append(f"'{raw_doc['source_file']}' wiadomość {i}: zakres {start}-{end} zachodzi na poprzednią wiadomość")
            continue
        previous_end = end
        body_from = m.get("body_from") or start
        body_from = min(max(body_from, start), end)
        body = "\n".join(text_lines[body_from - 1:end]).strip()

        sender, to, sent_at, subject = m.get("from"), m.get("to"), m.get("sent_at"), meta.get("subject", "—")
        if i == 1 and kind != "file":
            sender = meta.get("from", "—") if sender in _PLACEHOLDERS else sender
            to = meta.get("to", "—") if to in _PLACEHOLDERS else to
            sent_at = meta.get("date", "—") if sent_at in _PLACEHOLDERS else sent_at
        sender = sender or "—"
        if i > 1 and sender == "—":
            issues.append("brak nadawcy w nagłówku")
        elif i > 1:
            first_word = tg.sender_parts(sender)[0].split()[0].lower() if tg.sender_parts(sender)[0] != "—" else ""
            if first_word and first_word not in "\n".join(text_lines[start - 1:end]).lower():
                issues.append(f"nadawca '{sender}' nie występuje w tekście wiadomości")
        if tg.parse_when(sent_at, settings["default_utc_offset"]) is None:
            issues.append(f"nie da się odczytać daty '{sent_at}'")

        expects = m.get("expects_reply", "unclear")
        if expects not in YES_NO:
            issues.append(f"expects_reply '{expects}' spoza kanonu")
            expects = "unclear"

        key = tg.message_key(body, sender) if kind != "file" else f"F-{raw_doc['doc_key']}"
        if key in seen_keys:
            issues.append("ta sama treść dwa razy w jednym pliku")
            key = f"{key}~{i}"
        seen_keys.add(key)

        name, email = tg.sender_parts(sender)
        rows.append({
            "message_key": key, "doc_key": raw_doc["doc_key"], "n": i, "kind": kind,
            "sender": sender if sender != "—" else "—", "sender_name": name, "sender_email": email or "—",
            "sender_side": tg.side_of(sender, settings), "to": to or "—", "sent_at": sent_at or "—",
            "subject": subject, "expects_reply": expects,
            "closes_thread": bool(m.get("closes_thread", False)),
            "awaiting": m.get("awaiting") or "—",
            "lines": {"start": start, "end": end}, "body_from": body_from,
            "preview": re.sub(r"\s+", " ", body)[:300],
            "sample": re.sub(r"\s+", " ", body)[:2500],   # do szukania powiązań między wątkami
            "source_file": raw_doc["source_file"], "source_type": source_type, "issues": issues,
        })
    return rows, errors


def message_of(line: int, messages: list[dict]):
    for msg in messages:
        if msg["lines"]["start"] <= line <= msg["lines"]["end"]:
            return msg
    earlier = [m for m in messages if m["lines"]["end"] < line]
    return earlier[-1] if earlier else (messages[0] if messages else None)


def main() -> int:
    if not READ_OUTPUT.exists():
        print("Brak output/entries.json z etapu 02_read — uruchom go najpierw (etap modelu).")
        return 1

    settings = tg.load_settings(paths.SETTINGS_JSON)
    docs_entries = json.loads(READ_OUTPUT.read_text(encoding="utf-8"))
    raw_by_doc = {d["doc_key"]: d for d in json.loads(EXTRACT_OUTPUT.read_text(encoding="utf-8"))}
    backfill = {d["doc_key"] for d in json.loads(PREPARE_OUTPUT.read_text(encoding="utf-8")) if d.get("backfill")} \
        if PREPARE_OUTPUT.exists() else set()
    type_codes = load_type_codes()
    area_codes = load_area_codes()

    validated: list[dict] = []
    all_messages: list[dict] = []
    counters: dict[tuple, int] = {}
    hard_errors: list[str] = []

    for doc_entries in docs_entries:
        doc_key = doc_entries["doc_key"]
        raw_doc = raw_by_doc[doc_key]
        text_lines = raw_doc["text"].splitlines()

        messages, errors = build_messages(doc_entries, raw_doc, settings)
        hard_errors += errors
        all_messages += messages

        entries = [] if doc_key in backfill else doc_entries["entries"]
        if not entries:
            if doc_key in backfill:
                print(f"Dokument '{raw_doc['source_file']}': uzupełnienie wiadomości ({len(messages)}), zdarzenia bez zmian.")
                continue
            explanation = (doc_entries.get("quality_control") or "").strip()
            if not explanation:
                print(
                    f"BRAMKA: dokument '{raw_doc['source_file']}' dał zero zdarzeń w etapie "
                    "read, bez wyjaśnienia w quality_control. Zatrzymuję przebieg — to sygnał "
                    "nieudanej ekstrakcji, nie spokojnego dokumentu."
                )
                return 1
            print(
                f"Dokument '{raw_doc['source_file']}' dał zero zdarzeń — wyjaśnienie: "
                f"{explanation}"
            )
            continue

        for entry in entries:
            issues = []
            entry_type = entry["type"]
            code = type_codes.get(entry_type)
            if not code:
                issues.append(f"typ '{entry_type}' spoza kanonu")
                code = "XX"

            area = entry.get("pmbok_area", "") or ""
            if area and area not in area_codes:
                issues.append(f"obszar '{area}' spoza kanonu")

            start, end = entry["evidence_lines"]["start"], entry["evidence_lines"]["end"]
            evidence = "\n".join(text_lines[start - 1:end])

            msg = message_of(start, messages)
            if msg and end > msg["lines"]["end"]:
                issues.append("dowód wychodzi poza wiadomość, w której się zaczyna")

            key = (doc_key, code)
            counters[key] = counters.get(key, 0) + 1
            entry_id = f"{doc_key}-{code}-{counters[key]:02d}"

            validated.append({
                "entry_id": entry_id,
                "doc_key": doc_key,
                "source_type": raw_doc["source_type"],
                "source_file": raw_doc["source_file"],
                "event_date": entry.get("event_date") or (msg["sent_at"] if msg and msg["sent_at"] != "—" else None)
                              or raw_doc["metadata"].get("date", "—"),
                "author": (msg["sender"] if msg else raw_doc["metadata"].get("from", "—")),
                "author_email": (msg["sender_email"] if msg else raw_doc["metadata"].get("from_email", "—")),
                "type": entry_type,
                "pmbok_area": area,
                "title": entry["title"],
                "evidence": evidence,
                "evidence_sha256": hashing.sha256_text(evidence),
                "raw_ref": f"_kb/md/{doc_key}.md#{entry_id}",
                "message_key": msg["message_key"] if msg else "—",
                "message_no": msg["n"] if msg else 0,
                "owner": entry.get("owner", "—"),
                "due": entry.get("due", "—"),
                "importance": entry.get("importance", "normal"),
                "importance_by": "llm",
                "status": entry.get("status", "—"),
                "status_by": "llm" if entry.get("status") else "—",
                "relations": [],
                "thread_id": "—",
                "confirmed": False,
                "rejected": False,
                "issues": issues,
            })

    # ta sama wiadomość mogła trafić do bazy w innym pliku (np. ten sam mail zapisany przez drugą osobę)
    prior: dict[str, dict] = {}
    for e in io_jsonl.read_all(paths.EVENTS_JSONL):
        if e.get("message_key") and e["doc_key"] not in raw_by_doc:
            prior.setdefault(e["message_key"], e)
    dup = 0
    for v in validated:
        p = prior.get(v.get("message_key"))
        if p:
            v["issues"].append(f"wiadomość ma już zdarzenia z innego pliku ({p['entry_id']}) — możliwy duplikat")
            dup += 1
    if dup:
        print(f"UWAGA: {dup} zdarzeń pochodzi z wiadomości, która ma już zdarzenia z innego pliku — "
              "sprawdź pole issues w output/validated.json, zanim trafią do bazy.")

    if hard_errors:
        print("BRAMKA: rozbicie na wiadomości jest niepoprawne — popraw etap read:")
        for e in hard_errors:
            print(f"  - {e}")
        return 1
    if not validated and not backfill:
        print("BRAMKA: zero zwalidowanych zdarzen w tym przebiegu.")
        return 1

    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / "validated.json").write_text(json.dumps(validated, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUTPUT / "messages.json").write_text(json.dumps(all_messages, ensure_ascii=False, indent=2), encoding="utf-8")
    soft = sum(len(m["issues"]) for m in all_messages)
    print(f"Zwalidowano {len(validated)} zdarzen i {len(all_messages)} wiadomosci"
          + (f" (uwagi do wiadomosci: {soft} — patrz pole issues w output/messages.json)." if soft else "."))
    return 0


if __name__ == "__main__":
    sys.exit(main())
