"""Wątki na poziomie wiadomości: klucz wiadomości, łączenie w wątki, stany odpowiedzi,
kandydaci na powiązania między wątkami, krótkie tytuły.

To jest robota skryptu (deterministyczna) — patrz `_context/00_method.md`, reguła 1. Ocenę „ta
wiadomość czeka na odpowiedź” i „ta wiadomość zamyka wątek” wystawia model w etapie `02_read`;
tutaj tylko z niej liczymy stan. Rozbicie pliku na wiadomości też robi model, nie ten moduł.

Wiadomość (węzeł) to jedna wiadomość, choćby występowała w kilku plikach jako cytat.
Wystąpienie (occurrence) to jej pojawienie się w konkretnym pliku: {doc_key, n}.
"""
from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

DEFAULT_SETTINGS = {
    "our_domains": [],          # domeny "naszej strony", np. ["example.com"]
    "our_names": [],            # imiona i nazwiska "naszej strony", gdy w źródle nie ma adresów
    "stale_after_days": 3,      # po ilu dniach brak odpowiedzi jest "zaległy"
    "default_utc_offset": "+02:00",  # strefa dla dat zapisanych bez strefy
}

EMAIL_KINDS = {"original", "reply", "forward"}
_EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
_PREFIX_RE = re.compile(r"^\s*(re|fw|fwd|odp|pd|r|aw|wg)\s*(?:\(\d+\))?\s*:\s*", re.IGNORECASE)
_TAG_RE = re.compile(r"^\s*[\(\[][^()\[\]]{1,24}[\)\]]\s*")
# w nazwach plików .msg dwukropek z tematu jest zamieniony na "_": "RE_ ", "FW_(3) ", "_Projekt_ "
_FILE_PREFIX_RE = re.compile(r"^\s*(?:re|fw|fwd|odp|pd|r|aw|wg)(?:_+\s*(?:\(\d+\)\s*)?|\(\d+\)_?\s*)", re.IGNORECASE)
_FILE_TAG_RE = re.compile(r"^\s*_[^_]{1,24}_\s+")
_STOP = set("""a an the and or of to in on for with from at by is are was be this that it as we you i
our your not no yes ok re fw fwd hi hello dear thanks thank regards best please kind
w z i o na do to jest się nie że oraz dla po od przez jak czy
proszę żeby teraz dzisiaj dziś dziękuję cześć dzień dobry pozdrawiam jeśli tylko będzie może mam ale bez już tak
będą jestem zostaje okazuje czy który która które tego tej tym mnie nas was wam nam
have has will would could should can also just now today tomorrow please regards sincerely
about after before over under into out up down""".split())


# ---------------------------------------------------------------- ustawienia, daty

def load_settings(path: Path) -> dict:
    settings = dict(DEFAULT_SETTINGS)
    if path.exists():
        settings.update(json.loads(path.read_text(encoding="utf-8")))
    return settings


def parse_when(text, default_offset: str = "+02:00"):
    """Data z tekstu -> data ze strefą albo None. Data bez strefy dostaje `default_offset`."""
    if not text or str(text).strip() in ("—", "-"):
        return None
    s = str(text).strip().replace("Z", "+00:00")
    m = re.match(r"^(\d{4}-\d{2}-\d{2})(?:[ T](\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?))?\s*(?:\(?(?:GMT|UTC)?\s*([+-]\d{1,2})(?::?(\d{2}))?\)?)?$", s)
    try:
        if m and not re.search(r"[+-]\d{2}:\d{2}$", s):
            day, clock, oh, om = m.groups()
            clock = clock or "00:00"
            if clock.count(":") == 2 and "." in clock:
                clock = clock.split(".")[0]
            base = datetime.fromisoformat(f"{day} {clock if len(clock) > 4 else '0' + clock}")
            if oh:
                off = timedelta(hours=int(oh), minutes=int(om or 0) * (1 if int(oh) >= 0 else -1))
                return base.replace(tzinfo=timezone(off))
            return base.replace(tzinfo=_offset(default_offset))
        parsed = datetime.fromisoformat(s)
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=_offset(default_offset))


def _offset(text: str):
    m = re.match(r"^([+-])(\d{2}):?(\d{2})?$", text)
    if not m:
        return timezone.utc
    sign = -1 if m.group(1) == "-" else 1
    return timezone(sign * timedelta(hours=int(m.group(2)), minutes=int(m.group(3) or 0)))


# ---------------------------------------------------------------- klucz wiadomości

def normalize_text(text: str) -> str:
    return re.sub(r"[\W_]+", " ", (text or "").lower(), flags=re.UNICODE).strip()


def message_key(body: str, sender: str = "") -> str:
    """Ta sama wiadomość w dwóch plikach ma ten sam klucz. Podstawa: początek treści (bez
    nagłówka i podpisu daty); bardzo krótkie treści („Dzięki.”) dostają dodatkowo nadawcę."""
    norm = normalize_text(body)[:80]   # dalsza treść bywa obcięta lub uzupełniona w kolejnych cytatach
    if len(norm) < 60:
        norm = f"{norm}|{normalize_text(sender)}"
    return "M-" + hashlib.sha256(norm.encode("utf-8")).hexdigest()[:12]


def sender_parts(sender: str) -> tuple[str, str]:
    """'Katarzyna Lewandowska <k@x.com>' -> ('Katarzyna Lewandowska', 'k@x.com')."""
    sender = (sender or "").replace("\t", " ").strip()
    m = _EMAIL_RE.search(sender)
    email = m.group(0).lower() if m else ""
    name = re.sub(r"<[^>]*>|\([^)]*@[^)]*\)|\"", "", sender).replace(email, "").strip(" ;,'\"")
    return (name or email or "—"), email


def side_of(sender: str, settings: dict) -> str:
    name, email = sender_parts(sender)
    if email:
        domain = email.split("@", 1)[1]
        if any(domain == d or domain.endswith("." + d) for d in settings["our_domains"]):
            return "ours"
    if normalize_text(name) in {normalize_text(n) for n in settings["our_names"]}:
        return "ours"
    return "external" if (email or settings["our_names"]) and name != "—" else "unknown"


# ---------------------------------------------------------------- krótkie tytuły

def short_title(text: str, limit: int = 50) -> str:
    """Temat maila albo nazwa pliku -> czytelny skrót: bez RE:/FW:, bez znaczników w nawiasach,
    bez rozszerzenia, do `limit` znaków (cięcie na granicy słowa)."""
    s = re.sub(r"\.(msg|eml|docx|pptx|xlsx|pdf|md|txt)$", "", (text or "").strip(), flags=re.I)
    prev = None
    while prev != s:
        prev = s
        s = _PREFIX_RE.sub("", s)
        s = _FILE_PREFIX_RE.sub("", s)
        s = _TAG_RE.sub("", s)
        s = _FILE_TAG_RE.sub("", s)
        s = s.strip(" -–")
    s = s.replace("_", " ")
    s = re.sub(r"\s+", " ", s).strip() or (text or "—")
    if len(s) <= limit:
        return s
    cut = s[:limit].rsplit(" ", 1)[0]
    return (cut or s[:limit]).rstrip(" ,.;:-") + "…"


# ---------------------------------------------------------------- łączenie w wątki

class _UF:
    def __init__(self):
        self.p: dict[str, str] = {}

    def find(self, x):
        self.p.setdefault(x, x)
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]
            x = self.p[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.p[ra] = rb


def _subject_norm(subject: str) -> str:
    s = short_title(subject or "", limit=10_000).lower()
    return "" if s in ("", "—") else s


def group_messages(occurrences: list[dict], docs: dict[str, dict]) -> tuple[dict, dict]:
    """Zwraca (node_group, replies_to).

    occurrences: [{doc_key, n, message_key, kind}] — wystąpienia wiadomości w plikach.
    docs: {doc_key: {message_id, in_reply_to, subject, source_type}}.
    node_group: {klucz węzła: tymczasowy identyfikator grupy}; węzłem jest `message_key`
    (dla plików bez maili — `F-<doc_key>`). replies_to: {klucz wiadomości: klucz wiadomości,
    na którą odpowiada}. Reguły łączenia: ta sama wiadomość w dwóch plikach; sąsiednie
    wiadomości łańcucha w jednym pliku; nagłówek In-Reply-To pierwszej wiadomości pliku;
    znormalizowany temat (zapasowo).
    """
    uf = _UF()
    replies_to: dict[str, str] = {}
    by_doc: dict[str, list[dict]] = {}
    for occ in occurrences:
        by_doc.setdefault(occ["doc_key"], []).append(occ)
    for doc_key in by_doc:
        by_doc[doc_key].sort(key=lambda o: o["n"])

    def node(occ):
        return occ["message_key"] if occ["kind"] in EMAIL_KINDS else f"F-{occ['doc_key']}"

    top_node: dict[str, str] = {}
    for doc_key, occs in by_doc.items():
        for occ in occs:
            uf.find(node(occ))
        top_node[doc_key] = node(occs[0])
        for a, b in zip(occs, occs[1:]):
            if a["kind"] in EMAIL_KINDS and b["kind"] in EMAIL_KINDS:
                uf.union(node(a), node(b))
                replies_to.setdefault(node(a), node(b))   # a (nowsza) odpowiada na b (starszą)

    by_msgid = {d["message_id"]: k for k, d in docs.items()
                if d.get("message_id") and d["message_id"] != "—" and k in top_node}
    for doc_key, d in docs.items():
        parent = by_msgid.get(d.get("in_reply_to"))
        if parent and doc_key in top_node and parent != doc_key:
            uf.union(top_node[doc_key], top_node[parent])
            replies_to.setdefault(top_node[doc_key], top_node[parent])

    by_subject: dict[str, list[str]] = {}
    for doc_key in by_doc:
        subj = _subject_norm(docs.get(doc_key, {}).get("subject", ""))
        if subj:
            by_subject.setdefault(subj, []).append(top_node[doc_key])
    for nodes in by_subject.values():
        for other in nodes[1:]:
            uf.union(nodes[0], other)

    return {n: uf.find(n) for n in list(uf.p)}, replies_to


def stable_thread_ids(node_group: dict, doc_nodes: dict, stored_docs: dict, stored_nodes: dict,
                      first_at: dict, run_docs: set | None = None) -> tuple[dict, list]:
    """Numery wątków się nie zmieniają. Grupa dziedziczy najniższy numer zapisany już przy jej
    dokumentach lub wiadomościach; nowa grupa dostaje kolejny wolny numer (najstarsza pierwsza).

    doc_nodes: {doc_key: [węzły]}, stored_docs: {doc_key: THR-…}, stored_nodes: {węzeł: THR-…},
    first_at: {grupa: datetime}. Zwraca ({węzeł: THR-…}, [ostrzeżenia o scaleniach]).
    """
    groups: dict[str, list[str]] = {}
    for n, g in node_group.items():
        groups.setdefault(g, []).append(n)
    node_doc = {n: d for d, ns in doc_nodes.items() for n in ns}

    used = [t for t in list(stored_docs.values()) + list(stored_nodes.values()) if re.fullmatch(r"THR-\d+", t or "")]
    next_number = max([int(t[4:]) for t in used], default=0) + 1
    result: dict[str, str] = {}
    warnings: list[str] = []
    fresh = []
    for g, members in groups.items():
        known = {stored_nodes[n] for n in members if stored_nodes.get(n, "—") != "—"}
        known |= {stored_docs[node_doc[n]] for n in members if n in node_doc and stored_docs.get(node_doc[n], "—") != "—"}
        known = sorted(k for k in known if re.fullmatch(r"THR-\d+", k or ""))
        if known:
            if len(known) > 1:
                warnings.append(f"wątki {', '.join(known)} są jednym wątkiem — zostaje {known[0]}")
            for n in members:
                result[n] = known[0]
        else:
            fresh.append(g)
    far = datetime.max.replace(tzinfo=timezone.utc)
    for g in sorted(fresh, key=lambda g: (first_at.get(g) or far, g)):
        for n in groups[g]:
            result[n] = f"THR-{next_number:03d}"
        next_number += 1
    return result, warnings


# ---------------------------------------------------------------- stany odpowiedzi

def _sid(m: dict) -> str:
    """Tożsamość nadawcy: adres, a gdy go brak — znormalizowane imię i nazwisko."""
    email = m.get("sender_email")
    if email and email != "—":
        return email.lower()
    return normalize_text(m.get("sender_name") or m.get("sender") or "")


def compute_states(messages: list[dict], settings: dict, continued_threads: set | None = None) -> dict:
    """messages: wiersze wiadomości jednego wątku: message_key, sender, sender_name, sent_dt
    (datetime), expects_reply, closes_thread, awaiting.
    Zwraca {"messages": {klucz: {state, answered_by}}, "state": ..., "awaiting", "days_waiting"}.

    Stan wiadomości: answered (późniejsza wiadomość kogoś innego) · no_reply · info.
    Stan wątku: awaiting (jakaś prośba nie ma odpowiedzi) · closed · ended (nic nie czeka)
    · continued (wątek ma zatwierdzoną kontynuację w innym wątku) · unclear.
    """
    ordered = sorted(messages, key=lambda m: m["sent_dt"])
    out: dict = {"messages": {}}
    for i, m in enumerate(ordered):
        if m.get("expects_reply") == "yes":
            later = [x for x in ordered[i + 1:] if _sid(x) != _sid(m)]
            if later:
                out["messages"][m["message_key"]] = {"state": "answered", "answered_by": later[0]["message_key"]}
            else:
                out["messages"][m["message_key"]] = {"state": "no_reply", "answered_by": None}
        else:
            out["messages"][m["message_key"]] = {"state": "info", "answered_by": None}
    last = ordered[-1] if ordered else None
    out.update({"state": "unclear", "awaiting": "—", "days_waiting": 0, "stale": False, "since": None})
    if not last:
        return out
    open_requests = [m for m in ordered if out["messages"][m["message_key"]]["state"] == "no_reply"]
    if last.get("closes_thread"):
        out["state"] = "closed"
    elif open_requests:
        # najnowsza prośba bez odpowiedzi — także wtedy, gdy po niej ktoś z tej samej strony dopisał
        # jeszcze coś informacyjnego (np. wewnętrzną notatkę)
        pending = open_requests[-1]
        out.update({"state": "awaiting", "awaiting": pending.get("awaiting") or "—", "since": pending["message_key"]})
    elif last.get("expects_reply") == "no":
        out["state"] = "ended"
    return out


def apply_days(state: dict, last_dt, as_of, settings: dict, continued: bool = False) -> None:
    """Dopisuje liczbę dni oczekiwania (od ostatniej wiadomości do daty stanu danych) i
    zaległość; wątek z zatwierdzoną kontynuacją nie jest „bez odpowiedzi”."""
    if continued and state["state"] in ("awaiting", "unclear"):
        state["state"] = "continued"
    if state["state"] == "awaiting" and last_dt and as_of:
        state["days_waiting"] = max(0, (as_of - last_dt).days)
        state["stale"] = state["days_waiting"] >= settings["stale_after_days"]


# ---------------------------------------------------------------- kandydaci na powiązania

def _proper_tokens(text: str) -> set[str]:
    """Nazwy własne i skróty (KCS, SMBS, Ciao, Munich): słowa pisane wielką literą, ale nie na
    początku zdania. Zwykłe słowa („available”, „additional”) łączą przypadkowe wątki — te nie."""
    out: set[str] = set()
    words = (text or "").split()
    for i, w in enumerate(words):
        core = re.sub(r"^[^\w]+|[^\w-]+$", "", w)
        if len(core) < 3 or not core[0].isupper() or core.isdigit():
            continue
        if i == 0 or re.search(r"[.!?:;]$", words[i - 1]) or words[i - 1] in ("*", "-", "•", "1)", "2)", "3)"):
            continue
        if core.lower() not in _STOP:
            out.add(core.lower())
    return out


def _tokens(text: str) -> set[str]:
    return {t for t in normalize_text(text).split() if len(t) > 2 and t not in _STOP and not t.isdigit()}


_MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september",
           "october", "november", "december"]


def _mentions_date(text: str, dt) -> bool:
    """Czy tekst wspomina dzień `dt` (np. „September 21st”, „21 Sep”, „2026-09-21”)? Wątek, który
    zaczyna się dokładnie w dniu wskazanym w innym wątku (spotkanie, termin), to typowy ciąg dalszy."""
    if not dt:
        return False
    low = text.lower()
    month, day = _MONTHS[dt.month - 1], dt.day
    return bool(
        re.search(rf"\b{month[:3]}[a-z]*\.?\s+{day}(?:st|nd|rd|th)?\b", low)
        or re.search(rf"\b{day}(?:st|nd|rd|th)?\s+(?:of\s+)?{month[:3]}[a-z]*\b", low)
        or dt.strftime("%Y-%m-%d") in low
    )


def link_candidates(threads: list[dict], decided_pairs: set, max_gap_days: int = 14, limit: int = 25) -> list[dict]:
    """threads: [{thread_id, title, participants(list), text(str), first_dt, last_dt, has_file}].
    Podpowiada pary wątków, które mogą być powiązane, choć nagłówki i tematy tego nie łączą.
    Waży treść (rzadkie wspólne słowa, słowa z tytułów, nazwa pliku w mailu) wyżej niż bliskość
    dat; imiona uczestników i słowa grzecznościowe nie liczą się. Ocenia je model, nie ten skrypt."""
    far = datetime.max.replace(tzinfo=timezone.utc)
    people_toks = {t["thread_id"]: set().union(*[_tokens(p) for p in t["participants"]] or [set()]) for t in threads}
    toks = {t["thread_id"]: (_proper_tokens(t["text"]) | _tokens(t["title"])) - people_toks[t["thread_id"]] for t in threads}
    full_toks = {t["thread_id"]: _tokens(t["title"] + " " + t["text"]) for t in threads}
    title_toks = {t["thread_id"]: _tokens(t["title"]) - people_toks[t["thread_id"]] for t in threads}
    df: dict[str, int] = {}
    for ts in toks.values():
        for tok in ts:
            df[tok] = df.get(tok, 0) + 1
    out = []
    rare_limit = max(3, (len(threads) + 3) // 4)   # „rzadkie” = w nie więcej niż ~ćwierci wątków
    for i, x in enumerate(threads):
        for y in threads[i + 1:]:
            pair = tuple(sorted((x["thread_id"], y["thread_id"])))
            if pair in decided_pairs:
                continue
            a, b = (x, y) if (x["first_dt"] or far) <= (y["first_dt"] or far) else (y, x)   # a = wcześniejszy
            ta, tb = a["thread_id"], b["thread_id"]
            signals, score = [], 0.0
            rare = sorted(t for t in toks[ta] & toks[tb] - people_toks[tb] if df[t] <= rare_limit)
            in_titles = sorted(title_toks[ta] & title_toks[tb])
            if len(rare) >= 3:
                signals.append(f"shared names and terms: {', '.join(rare[:8])}")
                score += min(len(rare), 8) / 2 + 2 * len(in_titles)
            people = set(a["participants"]) & set(b["participants"])
            if len(people) >= 2 and rare:
                signals.append(f"shared people: {', '.join(sorted(people)[:4])}")
                score += 0.5
            if a["has_file"] != b["has_file"]:
                f, o = (ta, tb) if a["has_file"] else (tb, ta)
                overlap = title_toks[f] & full_toks[o]
                if len(overlap) >= 3:
                    signals.append(f"file name words appear in the other thread (possible attachment): {', '.join(sorted(overlap)[:6])}")
                    score += 3 + len(overlap)
            if a["has_file"] == b["has_file"] and _mentions_date(a["text"], b["first_dt"]) and \
               (b["first_dt"] or far) > (a["first_dt"] or far) and (rare or people):
                signals.append(f"the earlier thread mentions the day this one starts ({b['first_dt']:%Y-%m-%d})")
                score += 3
            if signals and a["last_dt"] and b["first_dt"]:
                gap = (b["first_dt"] - a["last_dt"]).total_seconds() / 86400
                if -1 <= gap <= max_gap_days:
                    signals.append(f"starts {max(gap, 0):.1f} days after the other one ends")
                    score += 1
            if not signals:
                continue
            out.append({"from": ta, "to": tb, "signals": signals, "score": round(score, 1)})
    out.sort(key=lambda c: -c["score"])
    return out[:limit]


# ---------------------------------------------------------------- wiersze wątków

def _enforce_chain_order(nodes: dict, replies_to: dict) -> None:
    """Godziny w nagłówkach cytowanych wiadomości są zapisane w strefach różnych skrzynek, więc
    odpowiedź bywa „wcześniejsza” od wiadomości, na którą odpowiada. Kolejność łańcucha ma
    pierwszeństwo: odpowiedź dostaje co najmniej godzinę oryginału plus minutę (`sent_dt` jest
    wtedy skorygowane, `sent_at` — tekst ze źródła — zostaje bez zmian)."""
    done: dict[str, datetime | None] = {}

    def resolve(key: str, trail: tuple = ()):
        if key in done:
            return done[key]
        info = nodes.get(key)
        if info is None or key in trail:
            return None
        parent = replies_to.get(key)
        dt = info["sent_dt"]
        parent_dt = resolve(parent, trail + (key,)) if parent else None
        if parent_dt and (dt is None or dt <= parent_dt):
            dt = parent_dt + timedelta(minutes=1)
        info["sent_dt"] = done[key] = dt
        return dt

    for key in list(nodes):
        resolve(key)


def build_thread_rows(nodes: dict, node_thread: dict, links: list[dict], tags: dict, settings: dict,
                      replies_to: dict | None = None):
    """Liczy wiersze wątków i stany wiadomości ze wszystkich wiadomości w bazie.

    nodes: {klucz: {sent_at, sender, sender_name, expects_reply, closes_thread, awaiting, kind,
           subject, doc_key, source_file, preview}}; node_thread: {klucz: THR-…};
    links: wiersze `_kb/thread_links.jsonl`; tags: zawartość `_config/tags.json`.
    Zwraca (wątki, {klucz: {state, answered_by}}, as_of).
    """
    offset = settings["default_utc_offset"]
    for info in nodes.values():
        info["sent_dt"] = parse_when(info.get("sent_at"), offset)
    _enforce_chain_order(nodes, replies_to or {})
    dates = [i["sent_dt"] for i in nodes.values() if i["sent_dt"]]
    as_of = max(dates) if dates else None
    floor = datetime.min.replace(tzinfo=timezone.utc)

    by_thread: dict[str, list[str]] = {}
    for key, thr in node_thread.items():
        if key in nodes:
            by_thread.setdefault(thr, []).append(key)

    confirmed = [l for l in links if l.get("status") == "confirmed"]
    continued = {l["to_thread"] for l in confirmed if l["kind"] == "continuation"}
    titles = tags.get("thread_titles", {})
    thread_tags = tags.get("threads", {})
    source_tags = tags.get("sources", {})

    rows, msg_states = [], {}
    for thr, keys in sorted(by_thread.items()):
        keys.sort(key=lambda k: (nodes[k]["sent_dt"] or floor, nodes[k].get("n", 0) * -1))
        infos = [{"message_key": k, **nodes[k], "sent_dt": nodes[k]["sent_dt"] or floor} for k in keys]
        state = compute_states(infos, settings)
        last = infos[-1]
        since = nodes.get(state["since"], {}).get("sent_dt") if state.get("since") else nodes[last["message_key"]]["sent_dt"]
        apply_days(state, since, as_of, settings, continued=thr in continued)
        msg_states.update(state["messages"])

        first_mail = next((i for i in infos if i["kind"] in EMAIL_KINDS and i.get("subject", "—") != "—"), infos[0])
        title = titles.get(thr) or short_title(first_mail.get("subject") if first_mail["kind"] in EMAIL_KINDS else infos[0]["source_file"])
        docs = list(dict.fromkeys(i["doc_key"] for i in infos))
        files = list(dict.fromkeys(i["source_file"] for i in infos))
        tag_list = list(dict.fromkeys(list(thread_tags.get(thr, [])) + [t for f in files for t in source_tags.get(f, [])]))
        rows.append({
            "thread_id": thr, "title": title, "message_keys": keys, "doc_keys": docs,
            "first_at": nodes[keys[0]].get("sent_at", "—"), "last_at": nodes[keys[-1]].get("sent_at", "—"),
            "participants": list(dict.fromkeys(i["sender_name"] for i in infos if i.get("sender_name", "—") != "—")),
            "state": state["state"], "awaiting": state["awaiting"], "days_waiting": state["days_waiting"],
            "stale": state["stale"], "last_message_key": last["message_key"],
            "links": [{"kind": l["kind"], "from": l["from_thread"], "to": l["to_thread"]} for l in confirmed
                      if thr in (l["from_thread"], l["to_thread"])],
            "tags": tag_list,
        })
    return rows, msg_states, as_of


def thread_summaries_for_candidates(rows: list[dict], nodes: dict) -> list[dict]:
    """Wiersze wątków -> wejście dla `link_candidates`."""
    out = []
    for r in rows:
        infos = [nodes[k] for k in r["message_keys"]]
        dts = [i["sent_dt"] for i in infos if i.get("sent_dt")]
        emails = {i.get("sender_email") for i in infos if i.get("sender_email") not in (None, "—")}
        out.append({
            "thread_id": r["thread_id"], "title": r["title"],
            "participants": sorted(emails | set(r["participants"])),
            "text": " ".join((i.get("sample") or i.get("preview", "")) for i in infos[:8]),
            "first_dt": min(dts) if dts else None, "last_dt": max(dts) if dts else None,
            "has_file": any(i["kind"] == "file" for i in infos),
        })
    return out
