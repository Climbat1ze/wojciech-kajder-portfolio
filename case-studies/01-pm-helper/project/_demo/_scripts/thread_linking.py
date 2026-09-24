"""Wątkowanie dokumentów: nagłówek In-Reply-To (dokładny) + znormalizowany temat (zapasowy).

Robota skryptu, nie modelu — patrz `_context/00_method.md`, reguła 1. Nazwane `thread_linking`,
nie `threading`, żeby nie przesłaniać modułu biblioteki standardowej Pythona o tej samej nazwie.
"""
from __future__ import annotations
import re

_PREFIX_RE = re.compile(r"^\s*(re|fw|fwd|odp|pd|r)\s*:\s*", re.IGNORECASE)
_TAG_RE = re.compile(r"^\s*[\(\[][^()\[\]]{1,24}[\)\]]\s*")


def normalize_subject(subject: str) -> str:
    """Zdejmuje na przemian prefiksy odpowiedzi (RE/FW/R — także włoskie "R:") i tagi w
    nawiasach ("(Internal)", "[EXTERNAL]") — w dowolnej kolejności i dowolnej liczbie, aż
    temat się ustabilizuje. Bez pętli "(Internal) RE: temat" i "RE: (Internal) RE: temat"
    normalizują się do dwóch różnych wątków zamiast jednego.
    """
    subject = subject or ""
    if subject.strip() == "—":
        # znacznik "brak tematu" z _kb/documents.jsonl (docx, pptx) - nie łączymy po nim dokumentów
        return ""
    prev = None
    while prev != subject:
        prev = subject
        subject = _PREFIX_RE.sub("", subject)
        subject = _TAG_RE.sub("", subject)
        subject = subject.strip()
    return subject.lower()


class _UnionFind:
    def __init__(self) -> None:
        self.parent: dict[str, str] = {}

    def find(self, x: str) -> str:
        self.parent.setdefault(x, x)
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a: str, b: str) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[ra] = rb


def build_threads(documents: list[dict]) -> dict[str, str]:
    """documents: [{doc_key, message_id, in_reply_to, subject}, ...] -> {doc_key: thread_id}."""
    uf = _UnionFind()
    by_message_id = {
        d["message_id"]: d["doc_key"]
        for d in documents
        if d.get("message_id") and d["message_id"] != "—"
    }
    by_subject: dict[str, list[str]] = {}

    for doc in documents:
        uf.find(doc["doc_key"])
        in_reply_to = doc.get("in_reply_to")
        if in_reply_to and in_reply_to != "—" and in_reply_to in by_message_id:
            uf.union(doc["doc_key"], by_message_id[in_reply_to])
        subject_key = normalize_subject(doc.get("subject", ""))
        if subject_key:
            by_subject.setdefault(subject_key, []).append(doc["doc_key"])

    for keys in by_subject.values():
        for k in keys[1:]:
            uf.union(keys[0], k)

    roots = {doc["doc_key"]: uf.find(doc["doc_key"]) for doc in documents}
    root_to_thread_id = {
        root: f"THR-{i:03d}" for i, root in enumerate(sorted(set(roots.values())), start=1)
    }
    return {doc_key: root_to_thread_id[root] for doc_key, root in roots.items()}
