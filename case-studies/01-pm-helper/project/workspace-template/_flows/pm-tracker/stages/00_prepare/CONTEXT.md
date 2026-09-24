# Etap 00 — Prepare

**Warstwa L2 — kontrakt etapu. Wykonawca: skrypt.**

---

## Inputs

| Warstwa | Plik | Po co |
|---|---|---|
| L4 | `_input/originals/*` | bieżące dokumenty do przetworzenia (korespondencja, notatki) |
| L4 | `../../../../_kb/documents.jsonl` | już przetworzone dokumenty — żeby nie liczyć drugi raz |
| L4 | `../../../../_kb/messages.jsonl` | dokumenty, które mają już rozbicie na wiadomości (dla trybu `--backfill`) |

## Process

Dla każdego pliku w `_input/originals/` policz sumę kontrolną bajtów (`content_sha256`). Plik jest
**już znany**, gdy ta suma jest w `_kb/documents.jsonl` — niezależnie od nazwy (ten sam mail zapisany
przez dwie osoby ma dwie nazwy). Taki plik trafia do `output/skipped.json` jako `duplicate`, z nazwą
pliku, któremu jest równy. Plik o **znanej nazwie, ale innej treści** trafia tam jako `changed` i
nie jest przetwarzany po cichu od nowa (zmień nazwę pliku, jeśli to nowa wersja). Pozostałe pliki:
policz `doc_key`, ustal `source_type` po rozszerzeniu, załóż szkielet wpisu dokumentu (bez pól,
które wypełnią dalsze etapy). Duplikat na poziomie wiadomości (ten sam mail w innym pliku) łapie
dopiero etap `validate`.

`--record-hashes` dopisuje sumę kontrolną do dokumentów przetworzonych, zanim ją zapisywano.

Tryb `--backfill` (uruchamiany świadomie, raz po wprowadzeniu wiadomości do istniejącej bazy):
zamiast nowych plików bierze pliki znane bazie, których `doc_key` nie występuje w
`_kb/messages.jsonl`, i oznacza je `"backfill": true`. Dalsze etapy rozbijają je na wiadomości,
nie ruszając ich zdarzeń.

## Outputs

`output/skipped.json` — pliki pominięte jako `duplicate` albo `changed` (z powodem).
`output/documents.json` — lista nowych dokumentów do przetworzenia w tym przebiegu:
`{doc_key, source_file, source_type}` (w trybie `--backfill` dodatkowo `backfill: true`).

## Verify

Każdy plik z `_input/originals/` albo trafił do `output/documents.json`, albo ma już `doc_key`
w `_kb/documents.jsonl` — żaden plik nie jest po cichu pominięty. Skrypt wypisuje, ile plików
pominął.

---

**Skrypt:** `run.py` w tym folderze.
