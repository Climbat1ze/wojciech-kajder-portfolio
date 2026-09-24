"""Etap 04 — Relate, część skryptowa: wątki na poziomie wiadomości, kandydaci na powiązania.
Patrz CONTEXT.md w tym folderze.

Propozycje relacji semantycznych między zdarzeniami (cancels/supersedes/implements/follows_up/
closes/relates) oraz ocena kandydatów na powiązania wątków to robota modelu, wykonywana na wyjściu
tego skryptu — patrz CONTEXT.md, sekcja Process. Decyzje PM zbiera `review.py`.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "_scripts"))
import paths  # noqa: E402
import io_jsonl  # noqa: E402
import threading_graph as tg  # noqa: E402

STAGES = Path(__file__).resolve().parent.parent
VALIDATE_OUTPUT = STAGES / "03_validate" / "output" / "validated.json"
MESSAGES_OUTPUT = STAGES / "03_validate" / "output" / "messages.json"
EXTRACT_OUTPUT = STAGES / "01_extract" / "output" / "raw_text.json"
OUTPUT = Path(__file__).resolve().parent / "output"


def merge_nodes(kb_messages: list[dict], run_messages: list[dict], run_docs: set):
    """Wszystkie wiadomości (baza + ten przebieg) -> (węzły, wystąpienia).

    Dane węzła bierzemy z wystąpienia, w którym wiadomość jest najwyższą w swoim pliku (n = 1),
    bo tylko tam nagłówek pochodzi z metadanych, a nie z cytatu; w pozostałych przypadkach z
    pierwszego wystąpienia. Wystąpienia plików z tego przebiegu zastępują te z bazy.
    """
    nodes: dict[str, dict] = {}
    occs: list[dict] = []

    def offer(key, info, n):
        current = nodes.get(key)
        if current is None or (n == 1 and current["primary_n"] != 1):
            nodes[key] = {**info, "primary_n": n}

    for row in kb_messages:
        occurrences = [o for o in row.get("seen_in", []) if o["doc_key"] not in run_docs]
        for o in occurrences:
            occs.append({"doc_key": o["doc_key"], "n": o["n"], "message_key": row["message_key"], "kind": row["kind"]})
        if occurrences or not row.get("seen_in"):
            offer(row["message_key"], {**row, "doc_key": row.get("primary_doc_key", row.get("doc_key"))},
                  row.get("primary_n", 0))
    for row in run_messages:
        occs.append({"doc_key": row["doc_key"], "n": row["n"], "message_key": row["message_key"], "kind": row["kind"]})
        offer(row["message_key"], row, row["n"])
    return nodes, occs


def main() -> int:
    settings = tg.load_settings(paths.SETTINGS_JSON)
    validated = json.loads(VALIDATE_OUTPUT.read_text(encoding="utf-8")) if VALIDATE_OUTPUT.exists() else []
    run_messages = json.loads(MESSAGES_OUTPUT.read_text(encoding="utf-8")) if MESSAGES_OUTPUT.exists() else []
    raw_docs = json.loads(EXTRACT_OUTPUT.read_text(encoding="utf-8"))
    run_docs = {r["doc_key"] for r in raw_docs}

    existing_docs = io_jsonl.read_all(paths.DOCUMENTS_JSONL)
    kb_messages = io_jsonl.read_all(paths.MESSAGES_JSONL)
    links = io_jsonl.read_all(paths.THREAD_LINKS_JSONL)
    tags = json.loads(paths.TAGS_JSON.read_text(encoding="utf-8")) if paths.TAGS_JSON.exists() else {}

    docs_meta = {d["doc_key"]: {"message_id": d.get("message_id", "—"), "in_reply_to": d.get("in_reply_to", "—"),
                                "subject": d.get("subject", ""), "source_type": d.get("source_type", "")}
                 for d in existing_docs}
    for raw in raw_docs:
        m = raw["metadata"]
        docs_meta[raw["doc_key"]] = {"message_id": m.get("message_id", "—"), "in_reply_to": m.get("in_reply_to", "—"),
                                     "subject": m.get("subject", ""), "source_type": raw["source_type"]}

    nodes, occs = merge_nodes(kb_messages, run_messages, run_docs)
    node_group, replies_to = tg.group_messages(occs, docs_meta)

    doc_nodes: dict[str, list[str]] = {}
    for o in occs:
        key = o["message_key"] if o["kind"] in tg.EMAIL_KINDS else f"F-{o['doc_key']}"
        doc_nodes.setdefault(o["doc_key"], []).append(key)
    first_at: dict[str, object] = {}
    for key, group in node_group.items():
        dt = tg.parse_when(nodes.get(key, {}).get("sent_at"), settings["default_utc_offset"])
        if dt and (group not in first_at or dt < first_at[group]):
            first_at[group] = dt
    stored_docs = {d["doc_key"]: d.get("thread_id", "—") for d in existing_docs}
    stored_nodes = {m["message_key"]: m.get("thread_id", "—") for m in kb_messages}
    node_thread, warnings = tg.stable_thread_ids(node_group, doc_nodes, stored_docs, stored_nodes, first_at)
    doc_thread = {d: node_thread[ns[0]] for d, ns in doc_nodes.items() if ns and ns[0] in node_thread}

    for entry in validated:
        entry["thread_id"] = node_thread.get(entry.get("message_key"), doc_thread.get(entry["doc_key"], "—"))

    rows, _, as_of = tg.build_thread_rows(nodes, node_thread, links, tags, settings, replies_to)
    decided = {tuple(sorted((l["from_thread"], l["to_thread"]))) for l in links}
    candidates = tg.link_candidates(tg.thread_summaries_for_candidates(rows, nodes), decided)
    by_id = {r["thread_id"]: r for r in rows}
    for c in candidates:
        for side in ("from", "to"):
            r = by_id[c[side]]
            first = nodes[r["message_keys"][0]]
            c[f"{side}_title"] = r["title"]
            c[f"{side}_span"] = f"{r['first_at']} → {r['last_at']}"
            c[f"{side}_starts_with"] = first.get("preview", "")[:200]

    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / "related.json").write_text(json.dumps(validated, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUTPUT / "thread_map.json").write_text(json.dumps({
        "docs": doc_thread, "nodes": node_thread, "replies_to": replies_to, "warnings": warnings,
        "as_of": as_of.isoformat() if as_of else None,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUTPUT / "link_candidates.json").write_text(json.dumps(candidates, ensure_ascii=False, indent=2), encoding="utf-8")

    for w in warnings:
        print("UWAGA:", w)
    print(f"Wątki: {len(set(node_thread.values()))} (wiadomości: {len(nodes)}), zdarzeń z wątkiem: {len(validated)}, "
          f"kandydatów na powiązania do oceny: {len(candidates)}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
