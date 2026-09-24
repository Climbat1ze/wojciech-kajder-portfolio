"""Stage 07 — Report. See CONTEXT.md in this folder.

Every run builds, from the knowledge base only (no model step):
  - _outputs/dashboard.html          areas for executives, thread timeline, conversation view, list
  - _outputs/sources/<name>.html     verbatim text of every source file, split into messages
  - _outputs/timeline_report.md      the same content as plain text (diffable, works without a browser)

The look and the browser logic live in assets/ (tokens.css, dashboard.css, dashboard.js, template.html);
this script only prepares the data and inlines the assets, so the result is one file that opens
from disk with no external libraries.

Rule (do not change without asking the owner): a link between threads that the PM has confirmed is
drawn solid, one that only the model has proposed is drawn dashed — so the two can be compared
on the same picture. Sources are always linked by a readable label ("Email · <short subject>",
"Word · <short file name>"), never by an identifier.
"""
import html
import json
import re
import shutil
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "_scripts"))
import paths  # noqa: E402
import io_jsonl  # noqa: E402
import threading_graph as tg  # noqa: E402

ASSETS = Path(__file__).resolve().parent / "assets"
AREA_ORDER = ["STK", "TEA", "DAL", "PLN", "PWK", "DEL", "MEA", "UNC"]
TYPE_LABEL = {"decision": "decision", "action": "action", "risk": "risk", "issue": "issue",
              "change": "change", "milestone": "milestone", "meeting": "meeting", "note": "note"}
FILE_LABEL = {"msg": "Email", "eml": "Email", "docx": "Word", "pptx": "PowerPoint", "xlsx": "Excel", "pdf": "PDF"}
IMPORTANCE_ORDER = {"normal": 0, "high": 1, "critical": 2}
STATUS_RULES = [
    ("red", "An open critical risk or issue with no resolution date."),
    ("yellow", "An open high-importance risk or issue."),
    ("green", "Nothing critical or high-importance is open."),
    ("gray", "No events recorded for this area yet."),
]
_AREA_ROW = re.compile(r"\|\s*\*\*[^*]+\*\*\s*\|\s*([^|]+?)\s*\|\s*(\w{3})\s*\|[^|]*\|\s*([^|]*?)\s*\|")
_ANCHOR_LINE = re.compile(r'^<a id="[^"]+"></a>$')


# ---------------------------------------------------------------- canon, areas

def load_areas() -> dict[str, dict]:
    """Full name and executive description of each PMBOK 7 area — from the canon, not from code."""
    text = (paths.CANON / "20_pmbok_areas.md").read_text(encoding="utf-8")
    return {code: {"name": name.strip(), "description": desc.strip()} for name, code, desc in _AREA_ROW.findall(text)}


def read_area_status(code: str) -> tuple[str, str]:
    path = paths.AREAS / f"{code}.md"
    if not path.exists():
        return "no data", "(this area has no events yet)"
    paragraphs = [p.strip() for p in path.read_text(encoding="utf-8").split("\n\n") if p.strip()]
    status, conclusion = "—", "—"
    for para in paragraphs:
        first = para.splitlines()[0]
        if first.lower().startswith("status:"):
            status = first.split(":", 1)[-1].strip()
        elif not first.startswith("#"):
            conclusion = " ".join(l.strip() for l in para.splitlines())
            break
    return status, conclusion


def status_tone(status: str) -> str:
    s = status.strip().lower()
    return {"red": "red", "czerwony": "red", "yellow": "yellow", "żółty": "yellow", "zolty": "yellow",
            "green": "green", "zielony": "green"}.get(s, "gray")


# ---------------------------------------------------------------- sources: labels, slugs, pages

def slugify(text: str, limit: int = 60) -> str:
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")[:limit].strip("-") or "source"


def source_kind(doc: dict) -> str:
    st = doc.get("source_type", "")
    if st in FILE_LABEL:
        return FILE_LABEL[st]
    return "Email" if doc.get("author", "—") not in ("—", "") else "Note"


def source_title(doc: dict) -> str:
    subject = doc.get("subject", "—")
    if source_kind(doc) not in ("Email", "Note") or subject in ("—", ""):
        return tg.short_title(doc["source_file"])   # office files: the file name; their subject is often a tool name
    return tg.short_title(subject)


def source_slugs(docs: list[dict]) -> dict[str, str]:
    out, used = {}, set()
    for d in sorted(docs, key=lambda d: (str(d.get("doc_date", ""))[:10], d["source_file"])):
        base = f"{str(d.get('doc_date', ''))[:10]}_{slugify(source_title(d))}".strip("_")
        slug, i = base, 2
        while slug in used:
            slug, i = f"{base}-{i}", i + 1
        used.add(slug)
        out[d["doc_key"]] = slug
    return out


def original_href(doc: dict, settings: dict) -> str:
    """Link do oryginału (względem `_outputs/`): plik lokalny, jeśli istnieje; inaczej wspólny adres
    z `originals_base_url` w `_config/pm_settings.json` (np. folder SharePoint); inaczej brak linku —
    oryginały nie są w repozytorium (ignorowane przez git), więc link do nieistniejącego pliku byłby martwy."""
    name = doc["source_file"]
    if (paths.INPUT_ORIGINALS / name).exists():
        return "../_input/originals/" + quote(name)
    base = str(settings.get("originals_base_url", "") or "").strip()
    return base.rstrip("/") + "/" + quote(name) if base else ""


def doc_lines(doc_key: str) -> list[str]:
    """Verbatim text lines of a source file, recovered from _kb/md (anchor lines removed)."""
    path = paths.KB_MD / f"{doc_key}.md"
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8")
    body = text.split("\n---\n", 1)[1] if "\n---\n" in text else text
    body = body[1:] if body.startswith("\n") else body
    return [l for l in body.split("\n") if not _ANCHOR_LINE.match(l)]


def find_block(lines: list[str], evidence: str):
    ev = evidence.splitlines()
    if not ev:
        return None
    for i in range(len(lines) - len(ev) + 1):
        if lines[i:i + len(ev)] == ev:
            return i, i + len(ev)
    return None


_PAGE_CSS = (ASSETS / "source.css").read_text(encoding="utf-8") if (ASSETS / "source.css").exists() else ""


def build_source_page(doc: dict, label: str, doc_msgs: list[dict], events: list[dict], fmt, orig: str = "") -> str:
    lines = doc_lines(doc["doc_key"])
    marks: dict[int, list[str]] = {}
    ev_by_msg: dict[str, list[dict]] = {}
    for e in events:
        ev_by_msg.setdefault(e.get("message_key", ""), []).append(e)
        block = find_block(lines, e.get("evidence", ""))
        if block:
            for i in range(*block):
                marks.setdefault(i, []).append(f"{TYPE_LABEL.get(e['type'], e['type'])}: {e['title']}")
    if orig and not orig.startswith("http"):
        orig = "../" + orig     # the page lives one folder deeper than the dashboard
    orig_link = (f' <a class="orig" href="{orig}">Open the original file</a>' if orig
                 else " The original file is not stored in this repository.")
    parts = [f'<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8">'
             f'<meta name="viewport" content="width=device-width, initial-scale=1"><title>{html.escape(label)}</title>'
             f'<style>{_PAGE_CSS}</style></head><body><main class="wrap">'
             f'<p class="back"><a href="../dashboard.html">← Dashboard</a></p>'
             f'<h1>{html.escape(label)}</h1>'
             f'<p class="muted">Verbatim text of <b>{html.escape(doc["source_file"])}</b>, split into messages. '
             f'Highlighted lines are the evidence of extracted events. '
             f'{orig_link}</p>']
    ranges = sorted(doc_msgs, key=lambda m: m["n"])
    if not ranges:
        ranges = [{"n": 1, "lines": {"start": 1, "end": max(len(lines), 1)}, "row": None}]
    for m in ranges:
        row = m.get("row")
        head = ""
        if row:
            who = html.escape(row.get("sender_name", "—"))
            to = html.escape(str(row.get("to", "—")))
            when = html.escape(fmt(row))
            badge = {"no_reply": '<span class="badge warn">⚠ no reply yet</span>',
                     "answered": '<span class="badge ok">✓ answered</span>'}.get(row.get("reply_state"), "")
            head = f'<div class="mh"><b>{who}</b>' + (f' → {to}' if to not in ("—", "metadata") else "") + \
                   f' <span class="muted">· {when}</span> {badge}</div>'
        chips = "".join(f'<span class="chip t-{e["type"]}">{html.escape(TYPE_LABEL.get(e["type"], e["type"]))}: '
                        f'{html.escape(e["title"])}</span>' for e in ev_by_msg.get(row["message_key"] if row else "", []))
        body = []
        for i in range(m["lines"]["start"] - 1, min(m["lines"]["end"], len(lines))):
            cls = ' class="ev"' if i in marks else ""
            tip = f' title="{html.escape(" | ".join(marks[i]))}"' if i in marks else ""
            body.append(f"<span{cls}{tip}>{html.escape(lines[i])}</span>")
        parts.append(f'<section class="msg" id="msg-{m["n"]}">{head}<div class="chips">{chips}</div>'
                     f'<pre>{chr(10).join(body)}</pre></section>')
    parts.append("</main></body></html>")
    return "".join(parts)


# ---------------------------------------------------------------- data for the dashboard

def _clean_people(raw: str) -> list[str]:
    if not raw or raw == "—":
        return []
    out, seen = [], set()
    for p in re.split(r";(?![^<]*>)", raw):
        p = p.strip().strip('"').strip("'").replace("\t", " ")
        m = re.match(r"^(.*?)<([^>]+)>$", p)
        name = (m.group(1).strip().strip("'\"") or m.group(2).strip()) if m else p
        if name and name not in seen:
            seen.add(name)
            out.append(name)
    return out


def build_data(events, docs, messages, links, tags, settings, areas):
    tz = tg._offset(settings["default_utc_offset"])
    zone_label = f"UTC{settings['default_utc_offset']}"
    docs_by_key = {d["doc_key"]: d for d in docs}
    slugs = source_slugs(docs)
    active = [e for e in events if not e.get("rejected")]

    # ---- times: chain order wins over clock times (see threading_graph._enforce_chain_order)
    nodes = {m["message_key"]: {**m, "doc_key": m["primary_doc_key"], "n": m["primary_n"]} for m in messages}
    node_thread = {m["message_key"]: m["thread_id"] for m in messages}
    replies_to = {m["message_key"]: m["replies_to"] for m in messages if m.get("replies_to", "—") != "—"}
    thread_rows, msg_states, as_of = tg.build_thread_rows(nodes, node_thread, links, tags, settings, replies_to)

    def when(key):
        dt = nodes[key]["sent_dt"]
        return dt.astimezone(tz) if dt else None

    def label_time(row_or_key):
        key = row_or_key if isinstance(row_or_key, str) else row_or_key["message_key"]
        dt = when(key)
        return dt.strftime("%a %d %b %Y, %H:%M") if dt else "date unknown"

    def src_of(key):
        m = nodes[key]
        doc = docs_by_key.get(m["doc_key"])
        if not doc:
            return {"label": "Source", "href": "", "orig": ""}
        return {"label": f"{source_kind(doc)} · {source_title(doc)}",
                "href": f"sources/{slugs[doc['doc_key']]}.html#msg-{m['n']}",
                "orig": original_href(doc, settings)}

    # ---- messages
    msgs_out = []
    for m in messages:
        key = m["message_key"]
        dt = when(key)
        st = msg_states.get(key, {"state": "info", "answered_by": None})
        msgs_out.append({
            "key": key, "thread": m["thread_id"], "kind": m["kind"], "side": m.get("sender_side", "unknown"),
            "name": m.get("sender_name", "—"), "to": m.get("to", "—") if m.get("to") != "metadata" else "—",
            "day": dt.strftime("%Y-%m-%d") if dt else "", "mod": dt.hour * 60 + dt.minute if dt else -1,
            "label": label_time(key), "written": m.get("sent_at", "—"),
            "state": st["state"], "answeredBy": st["answered_by"], "repliesTo": m.get("replies_to", "—"),
            "expects": m.get("expects_reply", "unclear"), "closes": bool(m.get("closes_thread")),
            "awaiting": m.get("awaiting", "—"), "preview": m.get("preview", ""),
            "events": m.get("entry_ids", []), "src": src_of(key),
        })

    # ---- threads
    threads_out = []
    for t in thread_rows:
        threads_out.append({
            "id": t["thread_id"], "title": t["title"], "state": t["state"], "awaiting": t["awaiting"],
            "days": t["days_waiting"], "stale": t["stale"], "tags": t["tags"], "messages": t["message_keys"],
            "first": label_time(t["message_keys"][0]), "last": label_time(t["message_keys"][-1]),
        })
    threads_out.sort(key=lambda t: (nodes[t["messages"][0]]["sent_dt"] or datetime.max.replace(tzinfo=timezone.utc), t["id"]))
    by_thread = {t["thread_id"]: t for t in thread_rows}

    # ---- links between threads: anchors on the messages they connect
    links_out = []
    for l in links:
        a, b = by_thread.get(l["from_thread"]), by_thread.get(l["to_thread"])
        if not a or not b:
            continue
        floor = datetime.min.replace(tzinfo=timezone.utc)
        if l["kind"] == "attachment_of":            # file (from) -> mail (to): nearest mail message not after the file
            fkey = a["message_keys"][0]
            ft = nodes[fkey]["sent_dt"] or floor
            earlier = [k for k in b["message_keys"] if (nodes[k]["sent_dt"] or floor) <= ft]
            left, right = (earlier[-1] if earlier else b["message_keys"][0]), fkey
        else:                                        # continuation / related: last of the earlier thread -> first of the later
            first, second = (b, a) if l["kind"] == "continuation" else sorted(
                (a, b), key=lambda t: nodes[t["message_keys"][0]]["sent_dt"] or floor)
            left, right = first["message_keys"][-1], second["message_keys"][0]
        links_out.append({"id": l["link_id"], "from": l["from_thread"], "to": l["to_thread"], "kind": l["kind"],
                          "status": l["status"], "confidence": l.get("confidence", "—"), "reason": l.get("reason", "—"),
                          "evidence": l.get("evidence", "—"), "left": left, "right": right})

    # ---- events
    msg_of_event = {e["entry_id"]: e.get("message_key") for e in active}
    events_out = []
    for e in active:
        key = e.get("message_key")
        src = src_of(key) if key in nodes else \
            {"label": (lambda d: f"{source_kind(d)} · {source_title(d)}")(docs_by_key[e["doc_key"]]),
             "href": f"sources/{slugs[e['doc_key']]}.html", "orig": ""}
        events_out.append({"id": e["entry_id"], "msg": key if key in nodes else "", "type": e["type"],
                           "area": e.get("pmbok_area", ""), "title": e["title"], "imp": e["importance"],
                           "status": e.get("status", "—"), "owner": e.get("owner", "—"), "due": e.get("due", "—"),
                           "thread": e.get("thread_id", "—"), "src": src})

    # ---- areas
    areas_out = []
    for code in AREA_ORDER:
        status, conclusion = read_area_status(code)
        a = areas.get(code, {"name": code, "description": ""})
        count = sum(1 for e in active if e.get("pmbok_area") == code)
        if count == 0:   # an area without events has no summary to show (the file only holds a placeholder)
            status, conclusion = "no data", "No events recorded for this area yet."
        areas_out.append({"code": code, "index": AREA_ORDER.index(code) + 1, "name": a["name"],
                          "description": a["description"], "status": status,
                          "tone": status_tone(status), "conclusion": conclusion, "count": count})

    # ---- list view: one row per source file
    ev_by_doc: dict[str, list[dict]] = {}
    for e in events_out:
        ev_by_doc.setdefault(next((x["doc_key"] for x in active if x["entry_id"] == e["id"]), ""), []).append(e)
    docs_out = []
    for d in docs:
        evs = sorted(ev_by_doc.get(d["doc_key"], []), key=lambda x: x["id"])
        top = max((IMPORTANCE_ORDER[e["imp"]] for e in evs), default=0)
        docs_out.append({
            "label": f"{source_kind(d)} · {source_title(d)}", "kind": source_kind(d),
            "href": f"sources/{slugs[d['doc_key']]}.html", "orig": original_href(d, settings),
            "date": str(d.get("doc_date", "—"))[:16].replace("T", " "), "file": d["source_file"],
            "from": _clean_people(d.get("author", "—")) or ["—"], "to": _clean_people(d.get("recipients", "—")),
            "thread": d.get("thread_id", "—"), "events": evs,
            "maxImp": [k for k, v in IMPORTANCE_ORDER.items() if v == top][0],
            "areas": sorted({e["area"] for e in evs}),
        })
    docs_out.sort(key=lambda d: d["date"])

    open_items = sum(1 for e in active if e.get("status") == "open")
    return {
        "areas": areas_out, "threads": threads_out, "messages": msgs_out, "links": links_out, "events": events_out,
        "docs": docs_out, "statusRules": [{"tone": t, "text": x} for t, x in STATUS_RULES],
        "typeLabel": TYPE_LABEL, "zone": zone_label,
        "asOf": as_of.astimezone(tz).strftime("%a %d %b %Y, %H:%M") if as_of else "—",
        "asOfDay": as_of.astimezone(tz).strftime("%Y-%m-%d") if as_of else "", "asOfMod": (as_of.astimezone(tz).hour * 60 + as_of.astimezone(tz).minute) if as_of else 0,
        "staleAfterDays": settings["stale_after_days"],
        "stats": {"docs": len(docs), "messages": len(messages), "threads": len(thread_rows), "events": len(active),
                  "open": open_items, "awaiting": sum(1 for t in thread_rows if t["state"] == "awaiting"),
                  "stale": sum(1 for t in thread_rows if t["state"] == "awaiting" and t["stale"])},
    }, slugs, nodes, src_of, label_time


# ---------------------------------------------------------------- plain-text report

def build_markdown_report(events, data, src_of, nodes, areas) -> list[str]:
    lines = ["# Project Report — Timeline and Area Dashboard", "", "## Area Dashboard (PMBOK 7)", ""]
    for a in data["areas"]:
        lines += [f"### {a['name']} — {a['status']}", f"_{a['description']}_", "", a["conclusion"], ""]
    lines += ["Status colours: " + " · ".join(f"**{r['tone']}** = {r['text']}" for r in data["statusRules"]), ""]

    lines += [f"## Conversations waiting for a reply (as of {data['asOf']})", ""]
    waiting = [t for t in data["threads"] if t["state"] == "awaiting"]
    if not waiting:
        lines.append("(none)")
    for t in sorted(waiting, key=lambda t: -t["days"]):
        m = data_msg(data, t["messages"][-1])
        flag = " — **overdue**" if t["stale"] else ""
        lines.append(f"- {t['title']} — waiting for {t['awaiting']} for {t['days']} day(s){flag} "
                     f"— [{m['src']['label']}]({m['src']['href']})")

    active = [e for e in events if not e.get("rejected")]
    by_id = {e["id"]: e for e in data["events"]}
    def sort_key(e):
        dt = tg.parse_when(e.get("event_date"), "+02:00")
        return (dt or datetime.max.replace(tzinfo=timezone.utc), e["entry_id"])
    lines += ["", "## Timeline", ""]
    for e in sorted(active, key=sort_key):
        ev = by_id[e["entry_id"]]
        area = areas.get(e.get("pmbok_area", ""), {"name": e.get("pmbok_area", "—")})["name"]
        lines.append(f"- **{str(e.get('event_date', '—'))[:16]}** [{e['type']} · {area}] {e['title']} "
                     f"— [{ev['src']['label']}]({ev['src']['href']})")

    lines += ["", "## Evolution Over Time", ""]
    runs = sorted(p.name for p in paths.KB_RUNS.iterdir() if p.is_dir()) if paths.KB_RUNS.exists() else []
    if not runs:
        lines.append("(no previous runs to compare against yet)")
    else:
        lines.append(f"Archived runs: {', '.join(runs)}; the last value is the state now.")
        for code in AREA_ORDER:
            statuses = []
            for run in runs:
                snap = paths.KB_RUNS / run / f"{code}.md"
                if snap.exists():
                    first = next((l for l in snap.read_text(encoding="utf-8").splitlines() if l.lower().startswith("status:")), "status: —")
                    statuses.append(status_label(first.split(":", 1)[-1].strip()))
            statuses.append(status_label(read_area_status(code)[0]) + " (now)")
            lines.append(f"- {areas.get(code, {'name': code})['name']}: {' → '.join(statuses)}")
    return lines


def status_label(status: str) -> str:
    return {"red": "red", "yellow": "yellow", "green": "green", "gray": "no data"}[status_tone(status)]


def data_msg(data, key):
    return next(m for m in data["messages"] if m["key"] == key)


def archive_run() -> None:
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M%S")
    run_dir = paths.KB_RUNS / stamp
    run_dir.mkdir(parents=True, exist_ok=True)
    if paths.EVENTS_JSONL.exists():
        shutil.copy(paths.EVENTS_JSONL, run_dir / "events.jsonl")
    for code in AREA_ORDER:
        f = paths.AREAS / f"{code}.md"
        if f.exists():
            shutil.copy(f, run_dir / f"{code}.md")


# ---------------------------------------------------------------- extra pages: exec summary, appendix
#
# Both are optional, model-written files next to the eight area files (see CONTEXT.md): `_areas/_summary.md`
# (Executive summary, shown before "Project health") and `_areas/_appendix.md` (Project card, shown last).
# Same discipline as the area files applies: no bare 16-hex ids or three-letter area codes in the running
# text — this is read by people outside the project, not by the tool.

def md_to_html(text: str) -> str:
    """Minimal Markdown -> HTML for the two model-written pages above: paragraphs, "- " bullet lists,
    "## " subheadings and simple "| a | b |" tables (optional "|---|---|" separator row). Everything is
    escaped — this never passes through raw HTML from the source file."""
    lines = text.strip("\n").split("\n")
    out: list[str] = []
    i = 0
    esc = lambda s: html.escape(s.strip())
    while i < len(lines):
        line = lines[i].rstrip()
        if not line:
            i += 1
        elif line.startswith("## "):
            out.append(f"<h3>{esc(line[3:])}</h3>")
            i += 1
        elif line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            if len(rows) >= 2 and all(set(c) <= set("-: ") for c in rows[1]):
                rows.pop(1)
            out.append("<table class='md-table'><tr>" + "".join(f"<th>{esc(c)}</th>" for c in rows[0]) + "</tr>"
                       + "".join("<tr>" + "".join(f"<td>{esc(c)}</td>" for c in r) + "</tr>" for r in rows[1:])
                       + "</table>")
        elif line.lstrip().startswith("- "):
            items = []
            while i < len(lines) and lines[i].lstrip().startswith("- "):
                items.append(lines[i].lstrip()[2:])
                i += 1
            out.append("<ul>" + "".join(f"<li>{esc(x)}</li>" for x in items) + "</ul>")
        else:
            para = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not (lines[i].lstrip().startswith(("- ", "|", "## "))):
                para.append(lines[i].rstrip())
                i += 1
            out.append(f"<p>{esc(' '.join(para))}</p>")
    return "\n".join(out)


def build_optional_section(path: Path, sec_id: str, overline: str, tone_class: str) -> str:
    """Full <section> HTML for an optional model-written page, or "" if the file does not exist yet —
    older instances (or the demo, before this file is adopted) simply show one section fewer."""
    if not path.exists():
        return ""
    lines = path.read_text(encoding="utf-8").split("\n")
    title = lines[0][2:].strip() if lines and lines[0].startswith("# ") else path.stem.strip("_").title()
    body = "\n".join(lines[1:]) if lines and lines[0].startswith("# ") else "\n".join(lines)
    return (f'<section class="sec {tone_class}" id="{sec_id}"><div class="wrap">'
            f'<p class="t-overline muted" style="margin-bottom:4px">{html.escape(overline)}</p>'
            f'<h2 class="h2">{html.escape(title)}</h2>'
            f'<div class="md-block" style="margin-top:var(--s-4)">{md_to_html(body)}</div>'
            f'</div></section>')


# ---------------------------------------------------------------- assembly

def build_dashboard_html(data: dict, project_title: str) -> str:
    template = (ASSETS / "template.html").read_text(encoding="utf-8")
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    css = (ASSETS / "tokens.css").read_text(encoding="utf-8") + "\n" + (ASSETS / "dashboard.css").read_text(encoding="utf-8")
    js = (ASSETS / "dashboard.js").read_text(encoding="utf-8")
    exec_summary = build_optional_section(paths.AREAS / "_summary.md", "summary", "For leadership", "sec-a")
    appendix = build_optional_section(paths.AREAS / "_appendix.md", "appendix", "Appendix", "sec-a")
    return (template.replace("%%TITLE%%", html.escape(project_title))
            .replace("%%RUN_DATE%%", datetime.now(timezone.utc).strftime("%Y-%m-%d"))
            .replace("%%CSS%%", css).replace("%%DATA%%", payload).replace("%%JS%%", js)
            .replace("%%EXEC_SUMMARY%%", exec_summary).replace("%%APPENDIX%%", appendix))


def main() -> int:
    events = io_jsonl.read_all(paths.EVENTS_JSONL)
    documents = io_jsonl.read_all(paths.DOCUMENTS_JSONL)
    messages = io_jsonl.read_all(paths.MESSAGES_JSONL)
    links = io_jsonl.read_all(paths.THREAD_LINKS_JSONL)
    settings = tg.load_settings(paths.SETTINGS_JSON)
    tags = json.loads(paths.TAGS_JSON.read_text(encoding="utf-8")) if paths.TAGS_JSON.exists() else {}
    areas = load_areas()
    if not messages:
        print("UWAGA: brak _kb/messages.jsonl — uruchom 00_prepare/run.py --backfill i etapy 01-05, "
              "żeby oś czasu i widok wątków miały dane.")

    data, slugs, nodes, src_of, label_time = build_data(events, documents, messages, links, tags, settings, areas)
    project_title = paths.ROOT.name

    paths.OUTPUTS.mkdir(parents=True, exist_ok=True)
    (paths.OUTPUTS / "timeline_report.md").write_text("\n".join(build_markdown_report(events, data, src_of, nodes, areas)), encoding="utf-8")
    (paths.OUTPUTS / "dashboard.html").write_text(build_dashboard_html(data, project_title), encoding="utf-8")

    # ---- source pages
    out_dir = paths.OUTPUTS / "sources"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)
    active = [e for e in events if not e.get("rejected")]
    for doc in documents:
        occ = []
        for m in messages:
            for o in m.get("seen_in", []):
                if o["doc_key"] == doc["doc_key"]:
                    occ.append({"n": o["n"], "lines": o["lines"], "row": m})
        label = f"{source_kind(doc)} · {source_title(doc)}"
        page = build_source_page(doc, label, occ, [e for e in active if e["doc_key"] == doc["doc_key"]],
                                 lambda row: label_time(row["message_key"]) + f" ({data['zone']})",
                                 original_href(doc, settings))
        (out_dir / f"{slugs[doc['doc_key']]}.html").write_text(page, encoding="utf-8")

    archive_run()
    s = data["stats"]
    print(f"Report written: _outputs/dashboard.html, _outputs/timeline_report.md, {len(documents)} source pages "
          f"({s['events']} events, {s['messages']} messages, {s['threads']} threads, {s['awaiting']} waiting for a reply).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
