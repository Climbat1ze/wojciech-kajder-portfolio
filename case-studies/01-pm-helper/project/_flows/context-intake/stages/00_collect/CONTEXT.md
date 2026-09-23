# Etap 00 — Collect

**Warstwa L2 — kontrakt etapu. Wykonawca: skrypt.**

---

## Inputs

| Warstwa | Plik | Po co |
|---|---|---|
| L4 | `_context_sources/*.{md,txt,msg,docx}` | dokumenty opisujące projekt (karta, kontrakt, kick-off) |

## Process

Dla każdego pliku w `_context_sources/` (poza tymi już przetworzonymi — sprawdź `doc_key` w
`output/documents.json` z poprzedniego przebiegu, jeśli istnieje): dekoduj przez
`_scripts/decode_source.py`, policz `doc_key` (suma kontrolna nazwy pliku + treści).

## Outputs

`output/documents.json` — lista `{doc_key, source_file, metadata, text}` dla każdego dokumentu.

## Verify

Liczba wpisów w `output/documents.json` = liczba plików w `_context_sources/`. Żaden dokument
nie ma pustego pola `text`.

## Bramka — zatrzymanie

`_context_sources/` bez żadnego pliku zatrzymuje przebieg. Nie ma z czego zbudować kontekstu —
pusty wynik tego etapu nie jest „spokojnym startem”, jest błędem konfiguracji.

---

**Skrypt:** `run.py` w tym folderze.
