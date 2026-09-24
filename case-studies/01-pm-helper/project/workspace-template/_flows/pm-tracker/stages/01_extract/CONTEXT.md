# Etap 01 — Extract

**Warstwa L2 — kontrakt etapu. Wykonawca: skrypt.**

---

## Inputs

| Warstwa | Plik | Po co |
|---|---|---|
| L4 | `../00_prepare/output/documents.json` | lista dokumentów do zdekodowania w tym przebiegu |
| L4 | `_input/originals/*` | same pliki źródłowe |

## Process

Dla każdego dokumentu z listy: dekoduj przez `_scripts/decode_source.py` do czystego tekstu +
metadanych (nadawca, odbiorca, temat, data, nagłówki wątku). Zachowaj tekst w formie gotowej do
ponumerowania — nie przycinaj, nie normalizuj białych znaków ponad to, co robi dekoder.

## Outputs

`output/raw_text.json` — lista `{doc_key, metadata, text}`.

## Verify

Żaden dokument nie ma pustego pola `text`. Metadane nadawcy/tematu są wypełnione tam, gdzie
źródło je zawierało (nie `—` bez powodu).

---

**Skrypt:** `run.py` w tym folderze.
