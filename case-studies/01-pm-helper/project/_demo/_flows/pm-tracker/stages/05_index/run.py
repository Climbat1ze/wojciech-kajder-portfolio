"""Etap 05 — Index. Patrz CONTEXT.md w tym folderze."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "_scripts"))
import paths  # noqa: E402
import io_jsonl  # noqa: E402
import threading_graph as tg  # noqa: E402

STAGES = Path(__file__).resolve().parent.parent
RELATE_OUTPUT = STAGES / "04_relate" / "output"
EXTRACT_OUTPUT = STAGES / "01_extract" / "output" / "raw_text.json"
MESSAGES_OUTPUT = STAGES / "03_validate" / "output" / "messages.json"

MESSAGE_FIELDS = ("kind", "sender", "sender_name", "sender_email", "sender_side", "to", "sent_at", "subject",
                  "expects_reply", "closes_thread", "awaiting", "source_file", "source_type", "preview", "sample", "issues")


def _load(path: Path, default):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else default


def render_document_md(doc_key: str, raw_doc: dict, events: list[dict], messages: list[dict]) -> str:
    lines = [f"# Dokument {doc_key}", "", f"Źródło: `{raw_doc['source_file']}`", ""]
    metadata = raw_doc["metadata"]
    for key in ("from", "to", "subject", "date"):
        if key in metadata:
            lines.append(f"- {key}: {metadata[key]}")
    lines += ["", "---", ""]

    body_lines = raw_doc["text"].splitlines()
    anchors: dict[int, list[str]] = {}
    for msg in sorted(messages, key=lambda m: m["n"]):
        anchors.setdefault(msg["lines"]["start"] - 1, []).append(f'<a id="msg-{msg["n"]}"></a>')
    for event in events:
        evidence_lines = event["evidence"].splitlines()
        if evidence_lines:
            try:
                start = body_lines.index(evidence_lines[0])
                anchors.setdefault(start, []).append(f'<a id="{event["entry_id"]}"></a>')
            except ValueError:
                pass

    for i, line in enumerate(body_lines):
        lines.extend(anchors.get(i, []))
        lines.append(line)
    return "\n".join(lines)


def attach_messages_to_events(events: list[dict], run_messages: list[dict], raw_by_doc: dict) -> int:
    """Zdarzenia sprzed wprowadzenia wiadomości: znajdź w tekście pliku pierwszą linię dowodu i
    przypisz zdarzenie do wiadomości, w której leży. Zdarzenia z innych plików nie są ruszane."""
    by_doc: dict[str, list[dict]] = {}
    for m in run_messages:
        by_doc.setdefault(m["doc_key"], []).append(m)
    attached = 0
    for event in events:
        if event["doc_key"] not in by_doc or event["doc_key"] not in raw_by_doc:
            continue
        if event.get("message_key") in {m["message_key"] for m in by_doc[event["doc_key"]]}:
            continue   # przypisanie z tego przebiegu jest aktualne
        text_lines = raw_by_doc[event["doc_key"]]["text"].splitlines()
        evidence = event["evidence"].splitlines()
        msgs = sorted(by_doc[event["doc_key"]], key=lambda m: m["n"])
        hit = next((i for i in range(len(text_lines))
                    if evidence and text_lines[i:i + len(evidence)] == evidence), None)
        if hit is not None:
            line = hit + 1
            found = next((m for m in msgs if m["lines"]["start"] <= line <= m["lines"]["end"]), None)
        else:
            found = msgs[0] if len(msgs) == 1 else None   # jedyna wiadomość pliku (np. Word)
        if found:
            event["message_key"], event["message_no"] = found["message_key"], found["n"]
            attached += 1
    return attached


def merge_messages(kb_rows: list[dict], run_messages: list[dict], run_docs: set) -> list[dict]:
    """Jedna wiadomość = jeden wiersz, niezależnie od liczby plików, w których jest cytowana."""
    by_key: dict[str, dict] = {}
    for row in kb_rows:
        row = dict(row)
        row["seen_in"] = [o for o in row.get("seen_in", []) if o["doc_key"] not in run_docs]
        if row["seen_in"]:
            by_key[row["message_key"]] = row
    for r in run_messages:
        occ = {"doc_key": r["doc_key"], "n": r["n"], "lines": r["lines"]}
        row = by_key.get(r["message_key"])
        if row is None:
            row = by_key[r["message_key"]] = {"message_key": r["message_key"], "seen_in": [], "primary_n": 99}
        row["seen_in"].append(occ)
        if r["n"] == 1 or row["primary_n"] == 99:
            row.update({f: r[f] for f in MESSAGE_FIELDS})
            row.update({"primary_doc_key": r["doc_key"], "primary_n": r["n"], "primary_lines": r["lines"]})
    for row in by_key.values():
        top = next((o for o in row["seen_in"] if o["n"] == 1), None) or min(row["seen_in"], key=lambda o: o["n"])
        row.update({"primary_doc_key": top["doc_key"], "primary_n": top["n"], "primary_lines": top["lines"]})
    return list(by_key.values())


def main() -> int:
    settings = tg.load_settings(paths.SETTINGS_JSON)
    related = _load(RELATE_OUTPUT / "related.json", [])
    thread_map = _load(RELATE_OUTPUT / "thread_map.json", {"docs": {}, "nodes": {}, "replies_to": {}})
    raw_by_doc = {d["doc_key"]: d for d in _load(EXTRACT_OUTPUT, [])}
    run_messages = _load(MESSAGES_OUTPUT, [])
    proposals = _load(RELATE_OUTPUT / "link_proposals.json", [])
    tags = _load(paths.TAGS_JSON, {})

    # --- zdarzenia
    io_jsonl.upsert(paths.EVENTS_JSONL, related, key="entry_id")
    events = io_jsonl.read_all(paths.EVENTS_JSONL)
    attached = attach_messages_to_events(events, run_messages, raw_by_doc)

    # --- wiadomości
    messages = merge_messages(io_jsonl.read_all(paths.MESSAGES_JSONL), run_messages, set(raw_by_doc))
    node_thread, doc_thread, replies_to = thread_map["nodes"], thread_map["docs"], thread_map["replies_to"]
    events_by_message: dict[str, list[str]] = {}
    for e in events:
        if e.get("message_key"):
            events_by_message.setdefault(e["message_key"], []).append(e["entry_id"])

    docs_now = {d["doc_key"]: d for d in io_jsonl.read_all(paths.DOCUMENTS_JSONL)}
    nodes = {}
    for row in messages:
        row["thread_id"] = node_thread.get(row["message_key"], row.get("thread_id", "—"))
        row["replies_to"] = replies_to.get(row["message_key"], "—")
        row["entry_ids"] = sorted(events_by_message.get(row["message_key"], []))
        nodes[row["message_key"]] = {**row, "doc_key": row["primary_doc_key"], "n": row["primary_n"]}

    # --- powiązania wątków: zaproponowane przez model, decyzje PM zostają
    links = io_jsonl.read_all(paths.THREAD_LINKS_JSONL)
    have = {l["link_id"] for l in links}
    for p in proposals:
        link_id = f"{p['from']}-{p['kind']}-{p['to']}"
        if link_id in have:
            for row in links:   # decyzja PM zostaje; niezatwierdzona propozycja dostaje nowszą treść
                if row["link_id"] == link_id and row["status"] == "suggested":
                    row.update({"confidence": p.get("confidence", row["confidence"]), "reason": p.get("reason", row["reason"]),
                                "evidence": p.get("evidence", row["evidence"]), "quotes": p.get("quotes", [])})
            continue
        links.append({"link_id": link_id, "from_thread": p["from"], "to_thread": p["to"], "kind": p["kind"],
                      "confidence": p.get("confidence", "medium"), "reason": p.get("reason", "—"),
                      "evidence": p.get("evidence", "—"), "quotes": p.get("quotes", []),
                      "status": "suggested", "by": "llm", "decided_at": "—"})
    io_jsonl.write_all(paths.THREAD_LINKS_JSONL, links)

    # --- stany odpowiedzi i wątki (pochodne)
    thread_rows, msg_states, _ = tg.build_thread_rows(nodes, node_thread, links, tags, settings, replies_to)
    for row in messages:
        st = msg_states.get(row["message_key"], {"state": "info", "answered_by": None})
        row["reply_state"], row["answered_by"] = st["state"], st["answered_by"] or "—"
    io_jsonl.write_all(paths.MESSAGES_JSONL, sorted(messages, key=lambda r: (r["thread_id"], r["message_key"])))
    io_jsonl.write_all(paths.THREADS_JSONL, thread_rows)

    # --- dokumenty (nowe i uzupełniane); numery wątków we wszystkich wierszach zgodne z grafem
    entries_by_doc: dict[str, list[dict]] = {}
    for e in events:
        entries_by_doc.setdefault(e["doc_key"], []).append(e)
    for doc_key, raw_doc in raw_by_doc.items():
        entries = entries_by_doc.get(doc_key, [])
        base = docs_now.get(doc_key, {})
        md = raw_doc["metadata"]
        docs_now[doc_key] = {
            "doc_key": doc_key,
            "source_type": raw_doc["source_type"],
            "source_file": raw_doc["source_file"],
            "content_sha256": raw_doc.get("content_sha256") if raw_doc.get("content_sha256") not in (None, "—")
                              else base.get("content_sha256", "—"),
            "doc_date": md.get("date", "—"),
            "author": md.get("from", "—"),
            "author_email": md.get("from_email", "—"),
            "recipients": md.get("to", "—"),
            "subject": md.get("subject", "—"),
            "message_id": md.get("message_id", "—"),
            "in_reply_to": md.get("in_reply_to", "—"),
            "summary": base.get("summary", "—"),
            "doc_importance": base.get("doc_importance", "normal"),
            "doc_importance_by": base.get("doc_importance_by", "llm"),
            "doc_relations": base.get("doc_relations", []),
            "thread_id": "—",
            "entry_ids": [e["entry_id"] for e in entries],
            "confirmed": base.get("confirmed", False),
            "issues": base.get("issues", []),
        }
        paths.KB_MD.mkdir(parents=True, exist_ok=True)
        (paths.KB_MD / f"{doc_key}.md").write_text(
            render_document_md(doc_key, raw_doc, entries, [m for m in run_messages if m["doc_key"] == doc_key]),
            encoding="utf-8",
        )
    changed = 0
    for doc_key, doc in docs_now.items():
        new = doc_thread.get(doc_key)
        if new and doc.get("thread_id") != new:
            changed += doc.get("thread_id", "—") not in ("—", new)
            doc["thread_id"] = new
    for e in events:
        new = node_thread.get(e.get("message_key")) or doc_thread.get(e["doc_key"])
        if new:
            e["thread_id"] = new
    io_jsonl.write_all(paths.DOCUMENTS_JSONL, list(docs_now.values()))
    io_jsonl.write_all(paths.EVENTS_JSONL, events)

    print(f"Baza: {len(events)} zdarzeń (+{len(related)}, {attached} przypisano do wiadomości), "
          f"{len(docs_now)} dokumentów, {len(messages)} wiadomości, {len(thread_rows)} wątków, "
          f"{len(links)} powiązań; zmieniony numer wątku w {changed} dokumentach.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
