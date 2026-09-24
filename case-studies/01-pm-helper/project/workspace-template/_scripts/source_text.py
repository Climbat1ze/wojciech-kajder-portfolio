"""Tekst źródeł i sprawdzanie cytatów — dla plików, które człowiek ma czytać bez otwierania źródeł
(kolejka decyzji `pending_review.md`).

Cytat pokazywany człowiekowi musi być dosłownym fragmentem tekstu źródłowego (reguła metody nr 3:
cytat jest nienaruszalny). Tu tekst źródła jest odtwarzany z `_kb/md/` (bez linii-kotwic), a cytat
jest sprawdzany z dokładnością do białych znaków, wielkości liter i typograficznych cudzysłowów.
"""
from __future__ import annotations

import re
from pathlib import Path

import paths

_ANCHOR_LINE = re.compile(r'^<a id="[^"]+"></a>$')
_SUBST = str.maketrans({"’": "'", "‘": "'", "“": '"', "”": '"', "–": "-", "—": "-", " ": " "})
_cache: dict[str, list[str]] = {}


def doc_lines(doc_key: str) -> list[str]:
    """Dosłowne linie pliku źródłowego (numeracja jak w zakresach wiadomości)."""
    if doc_key not in _cache:
        path = paths.KB_MD / f"{doc_key}.md"
        if not path.exists():
            _cache[doc_key] = []
        else:
            text = path.read_text(encoding="utf-8")
            body = text.split("\n---\n", 1)[1] if "\n---\n" in text else text
            body = body[1:] if body.startswith("\n") else body
            _cache[doc_key] = [l for l in body.split("\n") if not _ANCHOR_LINE.match(l)]
    return _cache[doc_key]


_NOISE = re.compile(
    r"^\s*(?:you don't often get email|learn why this is important|warning: external email|non ricevi spesso|scopri perch).*$"
    r"|^\s*(?:_{5,}|-{5,}.*|\*?\s*)$"
    r"|mailto:"
    r"|^\s*(?:sent|inviato|subject|oggetto|wysłano|temat)\s*:"
    r"|^\s*(?:from|to|cc|bcc|da|a|od|do)\s*:.*@", re.IGNORECASE)


def clean_body(text: str) -> str:
    """Treść bez nagłówków zacytowanych maili, ostrzeżeń o zewnętrznym nadawcy i linii-separatorów."""
    return "\n".join(l for l in text.split("\n") if not _NOISE.search(l))


def message_text(row: dict) -> str:
    """Treść jednej wiadomości: od `body_from` (po nagłówku) do końca jej zakresu w pliku głównym,
    oczyszczona z szumu. To jest tekst, do którego porównujemy cytaty."""
    lines = doc_lines(row.get("primary_doc_key", ""))
    rng = row.get("primary_lines") or {}
    if not lines or not rng:
        return clean_body(row.get("sample") or row.get("preview") or "")
    start = max(rng["start"], row.get("body_from") or rng["start"])
    if row.get("kind") == "file":
        start = rng["start"]
    return clean_body("\n".join(lines[start - 1:rng["end"]]))


def norm(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").translate(_SUBST)).strip().lower()


def verify_quote(quote: str, text: str) -> bool:
    q = norm(quote.strip("“”\"'… "))
    return bool(q) and q in norm(text)


def excerpt(text: str, keywords: list[str], width: int = 240) -> str | None:
    """Dosłowny fragment tekstu wokół pierwszego trafienia słowa kluczowego (do ~`width` znaków, cięcie
    na granicy słowa). Zwraca None, gdy żadne słowo nie występuje."""
    flat = re.sub(r"\s+", " ", text)
    low = flat.lower()
    hits = [low.find(k.lower()) for k in keywords if low.find(k.lower()) >= 0]
    if not hits:
        return None
    i = min(hits)
    start = max(0, i - width // 3)
    if start > 0:
        start = flat.rfind(" ", 0, start) + 1
    end = min(len(flat), start + width)
    if end < len(flat):
        cut = flat.rfind(" ", start, end)
        end = cut if cut > start else end
    return flat[start:end].strip()


def clip(text: str, n: int = 320) -> str:
    """Początek tekstu do ~n znaków, ucięty na granicy słowa, z wielokropkiem."""
    flat = re.sub(r"\s+", " ", text or "").strip()
    if len(flat) <= n:
        return flat
    cut = flat.rfind(" ", 0, n)
    return flat[: cut if cut > 0 else n].rstrip(" ,.;:-") + "…"
