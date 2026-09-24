"""Etap 04 — kolejka decyzji PM. Patrz CONTEXT.md w tym folderze.

  python review.py           zbuduj output/pending_review.md z propozycji modelu
  python review.py --apply   zastosuj decyzje wpisane w pending_review.md, potem zbuduj plik od nowa

Model proponuje, PM zatwierdza (`_context/00_method.md`, reguła 4). Wpis bez decyzji `yes` / `no`
nie zmienia niczego. Wpisane, a jeszcze niezastosowane decyzje przeżywają ponowne zbudowanie pliku.

Reguła trwała: plik `pending_review.md` musi wystarczyć do decyzji. Każda pozycja niesie kontekst obu
stron, dosłowne cytaty ze źródeł (sprawdzone skryptem) i opis skutku „yes” i „no” — PM nie ma
otwierać źródeł, żeby zdecydować. Pozycji bez cytatu, którego nie da się potwierdzić w źródle,
nie wolno przedstawiać jako pewnej: dostaje wyraźne ostrzeżenie.
"""
import json
import re
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "_scripts"))
import paths  # noqa: E402
import io_jsonl  # noqa: E402
import source_text as st  # noqa: E402
import threading_graph as tg  # noqa: E402

OUTPUT = Path(__file__).resolve().parent / "output"
REVIEW_MD = OUTPUT / "pending_review.md"
DECISIONS_JSONL = paths.KB / "review_decisions.jsonl"
_ITEM_RE = re.compile(r"^### (Link|Tag|Close) (\S+)\s*$")
_DECISION_RE = re.compile(r"^- Decision:\s*(.*)$")
FILE_LABEL = {"msg": "Email", "eml": "Email", "docx": "Word", "pptx": "PowerPoint", "xlsx": "Excel", "pdf": "PDF"}
LINK_TEXT = {"continuation": "a continuation of", "attachment_of": "an attachment of", "related": "related to"}


def _load(path: Path, default):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else default


def parse_decisions() -> dict[tuple, str]:
    """{(rodzaj, id): 'yes'|'no'|''} z ręcznie wypełnionego pliku."""
    out: dict[tuple, str] = {}
    if not REVIEW_MD.exists():
        return out
    current = None
    for line in REVIEW_MD.read_text(encoding="utf-8").splitlines():
        m = _ITEM_RE.match(line)
        if m:
            current = (m.group(1), m.group(2))
            continue
        d = _DECISION_RE.match(line)
        if d and current:
            value = d.group(1).strip().lower()
            out[current] = value if value in ("yes", "no") else ""
            current = None
    return out


# ---------------------------------------------------------------- zbieranie pozycji

def collect_items() -> dict[str, list[dict]]:
    links = io_jsonl.read_all(paths.THREAD_LINKS_JSONL)
    decided = {l["link_id"] for l in links if l["status"] != "suggested"}
    items: dict[str, dict] = {}
    for l in links:
        if l["status"] == "suggested":
            items[l["link_id"]] = {"id": l["link_id"], "from": l["from_thread"], "to": l["to_thread"], "kind": l["kind"],
                                   "confidence": l.get("confidence", "—"), "reason": l.get("reason", "—"),
                                   "evidence": l.get("evidence", "—"), "quotes": l.get("quotes", [])}
    for p in _load(OUTPUT / "link_proposals.json", []):
        link_id = f"{p['from']}-{p['kind']}-{p['to']}"
        if link_id not in decided:
            items[link_id] = {"id": link_id, "from": p["from"], "to": p["to"], "kind": p["kind"],
                              "confidence": p.get("confidence", "—"), "reason": p.get("reason", "—"),
                              "evidence": p.get("evidence", "—"), "quotes": p.get("quotes", [])}
    titles = {t["thread_id"]: t["title"] for t in io_jsonl.read_all(paths.THREADS_JSONL)}

    tags = _load(paths.TAGS_JSON, {})
    known = {(key, t) for kind in ("threads", "sources") for key, ts in tags.get(kind, {}).items() for t in ts}
    rejected = set(tags.get("_rejected", []))
    tag_items = []
    for s in _load(OUTPUT / "tag_suggestions.json", []):
        tid = f"{s['target']}+{s['tag']}"
        if tid in rejected or (s["target"], s["tag"]) in known:
            continue
        tag_items.append({"id": tid, "target": s["target"], "tag": s["tag"], "reason": s.get("reason", "—"),
                          "quote": s.get("quote", ""), "new": s["tag"] not in tags.get("vocabulary", {})})

    events = {e["entry_id"]: e for e in io_jsonl.read_all(paths.EVENTS_JSONL)}
    close_items = []
    for e in events.values():
        for r in e.get("relations", []):
            target = events.get(r["target"])
            if r["rel"] in ("closes", "cancels") and r.get("by") == "llm" and not r.get("decision") \
               and target and target.get("status") == "open":
                close_items.append({"id": f"{e['entry_id']}=>{r['target']}", "rel": r["rel"], "source": e,
                                    "target": target, "note": r.get("note", "")})
    return {"links": list(items.values()), "tags": tag_items, "closes": close_items, "titles": titles}


# ---------------------------------------------------------------- kontekst do czytania

class Context:
    """Wszystko, co trzeba, żeby pozycja była zrozumiała bez źródeł."""

    def __init__(self):
        self.settings = tg.load_settings(paths.SETTINGS_JSON)
        self.tz = tg._offset(self.settings["default_utc_offset"])
        self.threads = {t["thread_id"]: t for t in io_jsonl.read_all(paths.THREADS_JSONL)}
        self.messages = {m["message_key"]: m for m in io_jsonl.read_all(paths.MESSAGES_JSONL)}
        self.docs = {d["doc_key"]: d for d in io_jsonl.read_all(paths.DOCUMENTS_JSONL)}
        self._text: dict[str, str] = {}

    def when(self, sent_at: str) -> str:
        dt = tg.parse_when(sent_at, self.settings["default_utc_offset"])
        return dt.astimezone(self.tz).strftime("%d %b %Y, %H:%M") if dt else str(sent_at)

    def source(self, doc_key: str) -> str:
        d = self.docs.get(doc_key)
        if not d:
            return "source"
        kind = FILE_LABEL.get(d.get("source_type", ""), "Email" if d.get("author", "—") not in ("—", "") else "Note")
        subject = d.get("subject", "—")
        title = tg.short_title(d["source_file"] if kind not in ("Email", "Note") or subject in ("—", "") else subject)
        return f"{kind} · {title}"

    def thread_text(self, tid: str) -> str:
        if tid not in self._text:
            t = self.threads.get(tid, {"message_keys": []})
            self._text[tid] = "\n".join(st.message_text(self.messages[k]) for k in t["message_keys"] if k in self.messages)
        return self._text[tid]

    def people(self, t: dict, limit: int = 6) -> str:
        p = [x for x in t.get("participants", []) if x and x != "—"]
        if not p:
            return "no author recorded (a document)"
        return ", ".join(p[:limit]) + (f" and {len(p) - limit} more" if len(p) > limit else "")

    def state(self, t: dict) -> str:
        s = t["state"]
        if s == "awaiting":
            return f"waiting for {t['awaiting'] if t['awaiting'] != '—' else 'a reply'} for {t['days_waiting']} day(s)" + \
                   (" (overdue)" if t.get("stale") else "")
        return {"closed": "closed", "ended": "nothing is expected", "continued": "continued in another conversation",
                "unclear": "unclear"}.get(s, s)

    def message_line(self, key: str, label: str) -> str:
        m = self.messages[key]
        return (f"{label} ({m['sender_name']}, {self.when(m['sent_at'])}; {self.source(m['primary_doc_key'])}): "
                f"“{st.clip(st.message_text(m), 340)}”")

    def card(self, tid: str, role: str) -> list[str]:
        t = self.threads.get(tid)
        if not t:
            return [f"**{role}: conversation {tid}** — no longer in the database."]
        keys = [k for k in t["message_keys"] if k in self.messages]
        first, last = keys[0], keys[-1]
        span = self.when(self.messages[first]["sent_at"]) + (f" → {self.when(self.messages[last]['sent_at'])}" if len(keys) > 1 else "")
        out = [f"**{role}: “{t['title']}”** — {len(keys)} message(s), {span}; people: {self.people(t)}.",
               f"  - Status: {self.state(t)}.",
               "  - " + self.message_line(first, "Opens with")]
        if last != first:
            out.append("  - " + self.message_line(last, "Latest message"))
        return out

    def quote_lines(self, quotes: list[dict], fallback: str) -> list[str]:
        out = []
        for q in quotes:
            title = self.threads.get(q["thread"], {}).get("title", q["thread"])
            ok = st.verify_quote(q["text"], self.thread_text(q["thread"]))
            mark = "✓ checked against the source" if ok else "⚠ NOT found verbatim in the source — treat as the model's paraphrase"
            out.append(f"  - From “{title}”: “{q['text']}” ({mark})")
        if not quotes and fallback and fallback != "—":
            out.append(f"  - Model's note (not checked against the source): {fallback}")
        return out


# ---------------------------------------------------------------- render

def render(items: dict, carried: dict) -> None:
    ctx = Context()
    n_l, n_t, n_c = len(items["links"]), len(items["tags"]), len(items["closes"])
    out = [f"# Decisions waiting for the PM — {date.today().isoformat()}", "",
           "**How to use this file.** Each item below carries everything needed to decide: what is proposed, who wrote",
           "what and when, and verbatim quotes from the sources — you do not need to open them. Write `yes` or `no`",
           "after `Decision:`; leave it empty to decide later. Then run `python review.py --apply` in this folder.",
           "Nothing changes until you decide. Times are shown in " + ctx.settings["default_utc_offset"] + ".", "",
           "| What | Items | What a “yes” does |", "|---|---|---|",
           f"| Links between conversations | {n_l} | The two conversations are joined by a solid line in the dashboard. A conversation that continues elsewhere stops being reported as “waiting for a reply”. |",
           f"| Tags | {n_t} | The tag is added to the conversation and can be used as a filter. |",
           f"| Open items proposed to close | {n_c} | The open item is marked closed (or superseded) by you. |", ""]

    def decision(kind, item_id):
        return f"- Decision: {carried.get((kind, item_id), '')}".rstrip()

    out += ["## 1. Links between conversations", ""]
    if not items["links"]:
        out += ["(none)", ""]
    for l in items["links"]:
        a, b = ctx.threads.get(l["from"], {}), ctx.threads.get(l["to"], {})
        yes = {"continuation": f"“{a.get('title', l['from'])}” is shown as continuing “{b.get('title', l['to'])}”; if that earlier conversation was reported as waiting for a reply, it is shown as continued instead.",
               "attachment_of": f"The file “{a.get('title', l['from'])}” is shown as an attachment of “{b.get('title', l['to'])}”.",
               "related": "The two conversations are shown as related."}[l["kind"]]
        out += [f"### Link {l['id']}",
                f"**Question: is “{a.get('title', l['from'])}” {LINK_TEXT[l['kind']]} “{b.get('title', l['to'])}”?**",
                f"- Model's confidence: **{l['confidence']}**. Why: {l['reason']}",
                f"- If **yes**: {yes} If **no**: the proposal is dropped and not suggested again.", ""]
        out += [x for x in ctx.card(l["from"], "Conversation 1")] + [""]
        out += [x for x in ctx.card(l["to"], "Conversation 2")] + [""]
        out += ["**Quotes the model relies on:**"] + ctx.quote_lines(l["quotes"], l["evidence"]) + ["", decision("Link", l["id"]), ""]

    out += ["## 2. Tags", "",
            "A tag is a label you can filter by. It says nothing about the truth of the conversation — it only groups it.", ""]
    if not items["tags"]:
        out += ["(none)", ""]
    for t in items["tags"]:
        th = ctx.threads.get(t["target"], {})
        out += [f"### Tag {t['id']}",
                f"**Question: add the tag “{t['tag']}”{' (new tag)' if t['new'] else ''} to “{th.get('title', t['target'])}”?**",
                f"- Meaning of the tag: {t['reason']}"]
        if th:
            keys = [k for k in th["message_keys"] if k in ctx.messages]
            out.append(f"- Conversation: {len(keys)} message(s), {ctx.when(ctx.messages[keys[0]]['sent_at'])}; people: {ctx.people(th)}; status: {ctx.state(th)}.")
        if t["quote"]:
            ok = st.verify_quote(t["quote"], ctx.thread_text(t["target"]))
            out.append(f"- Why it fits — quote: “{t['quote']}” ({'✓ checked against the source' if ok else '⚠ NOT found verbatim in the source'})")
        out += [decision("Tag", t["id"]), ""]

    out += ["## 3. Open items the model proposes to close", ""]
    if not items["closes"]:
        out += ["(none)", ""]
    for c in items["closes"]:
        tg_e, src_e = c["target"], c["source"]
        out += [f"### Close {c['id']}",
                f"**Question: is this open item done — “{st.clip(tg_e['title'], 200)}”?**",
                f"- Open item: {tg_e['type']}, importance {tg_e['importance']}, owner {tg_e.get('owner', '—')}, "
                f"recorded from {ctx.source(tg_e['doc_key'])} ({str(tg_e.get('event_date', '—'))[:10]}), status **{tg_e['status']}**.",
                f"  - What the source says: “{st.clip(tg_e.get('evidence') or '(the stored quote for this item is empty — the source must be checked)', 700)}”",
                f"- Model believes it was answered by: “{st.clip(src_e['title'], 200)}” — {ctx.source(src_e['doc_key'])} ({str(src_e.get('event_date', '—'))[:10]}).",
                f"  - What the source says: “{st.clip(src_e.get('evidence', ''), 700)}”"]
        if c["note"]:
            out.append(f"- What the model could not confirm: {c['note']}")
        out += [f"- If **yes**: the open item is marked {'closed' if c['rel'] == 'closes' else 'superseded'} (by you, not by the model). "
                "If **no**: it stays open and is not proposed again.", decision("Close", c["id"]), ""]
    OUTPUT.mkdir(parents=True, exist_ok=True)
    REVIEW_MD.write_text("\n".join(out), encoding="utf-8")


# ---------------------------------------------------------------- stosowanie decyzji

def apply(decisions: dict[tuple, str], items: dict) -> list[dict]:
    today = date.today().isoformat()
    log: list[dict] = []
    links = io_jsonl.read_all(paths.THREAD_LINKS_JSONL)
    tags = _load(paths.TAGS_JSON, {"vocabulary": {}, "threads": {}, "sources": {}, "thread_titles": {}})
    events = io_jsonl.read_all(paths.EVENTS_JSONL)
    by_id = {e["entry_id"]: e for e in events}

    for l in items["links"]:
        d = decisions.get(("Link", l["id"]), "")
        if not d:
            continue
        row = next((x for x in links if x["link_id"] == l["id"]), None)
        if row is None:
            row = {"link_id": l["id"], "from_thread": l["from"], "to_thread": l["to"], "kind": l["kind"],
                   "confidence": l["confidence"], "reason": l["reason"], "evidence": l["evidence"], "quotes": l["quotes"]}
            links.append(row)
        row.update({"status": "confirmed" if d == "yes" else "rejected", "by": "pm", "decided_at": today,
                    "reason": l["reason"], "evidence": l["evidence"], "quotes": l["quotes"]})
        log.append({"kind": "link", "id": l["id"], "decision": d, "at": today})
    for t in items["tags"]:
        d = decisions.get(("Tag", t["id"]), "")
        if not d:
            continue
        if d == "yes":
            bucket = "threads" if t["target"].startswith("THR-") else "sources"
            tags.setdefault(bucket, {}).setdefault(t["target"], [])
            if t["tag"] not in tags[bucket][t["target"]]:
                tags[bucket][t["target"]].append(t["tag"])
            tags.setdefault("vocabulary", {}).setdefault(t["tag"], t["reason"])
        else:
            tags.setdefault("_rejected", []).append(t["id"])
        log.append({"kind": "tag", "id": t["id"], "decision": d, "at": today})
    for c in items["closes"]:
        d = decisions.get(("Close", c["id"]), "")
        if not d:
            continue
        source_id, target_id = c["id"].split("=>")
        for r in by_id[source_id]["relations"]:
            if r["target"] == target_id and r["rel"] == c["rel"]:
                r["decision"] = "accepted" if d == "yes" else "rejected"
        if d == "yes":
            by_id[target_id].update({"status": "closed" if c["rel"] == "closes" else "superseded",
                                     "status_by": "pm"})
        log.append({"kind": "close", "id": c["id"], "decision": d, "at": today})

    if log:
        io_jsonl.write_all(paths.THREAD_LINKS_JSONL, links)
        io_jsonl.write_all(paths.EVENTS_JSONL, events)
        paths.TAGS_JSON.write_text(json.dumps(tags, ensure_ascii=False, indent=2), encoding="utf-8")
        with DECISIONS_JSONL.open("a", encoding="utf-8") as f:
            for row in log:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
    return log


def main() -> int:
    decisions = parse_decisions()
    items = collect_items()
    if "--apply" in sys.argv[1:]:
        log = apply(decisions, items)
        print(f"Zastosowano decyzji: {len(log)} (pozostałe pozycje czekają).")
        decisions = {}
        items = collect_items()
    render(items, decisions)
    n = len(items["links"]) + len(items["tags"]) + len(items["closes"])
    print(f"pending_review.md: {n} pozycji czeka na decyzję ({len(items['links'])} powiązań, "
          f"{len(items['tags'])} tagów, {len(items['closes'])} zamknięć).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
