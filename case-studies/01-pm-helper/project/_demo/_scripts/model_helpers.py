"""Pomocnik dla kroku modelu w etapie `02_read`: wyznaczanie zakresów linii wiadomości w pliku.

Model czyta plik ze zrozumieniem i decyduje, gdzie zaczyna się każda wiadomość, kto ją napisał i czy
czeka na odpowiedź (reguła metody nr 2: treści nie tnie się wyrażeniami regularnymi). Ten pomocnik
robi tylko rzecz mechaniczną: zamienia wskazane przez model **znaczniki nagłówków** w numery linii,
żeby nie liczyć ich ręcznie. Wynik trafia do `output/entries.json` w polu `messages`; etap `validate`
sprawdza go i tak.

Przykład (plik z trzema wiadomościami, najnowsza na górze):

    from model_helpers import msg, message_ranges
    specs = [
        msg(None, "reply", "metadata", "metadata", None, "yes", "Anna Kowalska"),
        msg(r"^From: Jan", "reply", "Jan Nowak <jan@x.pl>", "2026-03-10 09:00", r"^Cześć", "no"),
        msg(r"^-{5,}\\s*Original Message", "original", "Anna Kowalska <anna@y.pl>", "2026-03-09 15:30", r"^Dzień dobry", "yes", "Jan Nowak"),
    ]
    messages = message_ranges(text.splitlines(), specs)

`start=None` oznacza pierwszą wiadomość pliku (zaczyna się od linii 1, nadawca i data z metadanych: wpisz
"metadata"). `body` to wzorzec pierwszej linii treści; przedrostek `AFTER:` bierze linię po pierwszej
pasującej (np. po ostrzeżeniu o zewnętrznym nadawcy).
"""
from __future__ import annotations

import re


def msg(start, kind, sender, sent, body=None, expects="no", awaiting="—", closes=False) -> dict:
    return {"start": start, "kind": kind, "sender": sender, "sent": sent, "body": body,
            "expects": expects, "awaiting": awaiting, "closes": closes}


def find_line(lines: list[str], pattern: str, start: int = 1) -> int:
    """Numer (od 1) pierwszej linii od `start`, która pasuje do wzorca; ValueError, gdy brak."""
    rx = re.compile(pattern)
    for i in range(start, len(lines) + 1):
        if rx.search(lines[i - 1]):
            return i
    raise ValueError(f"nie znaleziono {pattern!r} od linii {start}")


def message_ranges(lines: list[str], specs: list[dict]) -> list[dict]:
    """Wiadomości w formacie pola `messages` z `entries.json`. Nagłówki szukane są kolejno: każda
    następna wiadomość zaczyna się po początku poprzedniej."""
    starts = [1]
    for s in specs[1:]:
        starts.append(find_line(lines, s["start"], starts[-1] + 1))
    out = []
    for i, s in enumerate(specs):
        end = (starts[i + 1] - 1) if i + 1 < len(specs) else len(lines)
        while end > starts[i] and not lines[end - 1].strip():
            end -= 1
        body = starts[i]
        if s["body"]:
            after = s["body"].startswith("AFTER:")
            body = find_line(lines, s["body"][6:] if after else s["body"], starts[i])
            if after:
                body += 1
                while body < len(lines) and not lines[body - 1].strip():
                    body += 1
            if body > end:
                raise ValueError(f"wiadomość {i + 1}: początek treści {body} leży za jej końcem {end}")
        first = i == 0
        out.append({"n": i + 1, "kind": s["kind"], "from": s["sender"], "to": "metadata" if first else "—",
                    "sent_at": s["sent"], "lines": {"start": starts[i], "end": end}, "body_from": body,
                    "expects_reply": s["expects"], "closes_thread": s["closes"], "awaiting": s["awaiting"]})
    return out


if __name__ == "__main__":   # samosprawdzenie: python model_helpers.py
    text = ["Ok, dzięki.", "", "Od: Jan", "Wysłano: wtorek", "", "Cześć, sprawdź plik.", "", "Jan"]
    got = message_ranges(text, [msg(None, "reply", "metadata", "metadata", None, "no", closes=True),
                                msg(r"^Od:", "original", "Jan", "2026-03-10 09:00", r"^Cześć", "yes", "Anna")])
    assert got[0]["lines"] == {"start": 1, "end": 1} and got[1]["lines"] == {"start": 3, "end": 8}
    assert got[1]["body_from"] == 6
    print("model_helpers OK")
