# Etap 03 — Validate

**Warstwa L2 — kontrakt etapu. Wykonawca: skrypt.**

---

## Inputs

| Warstwa | Plik | Po co |
|---|---|---|
| L4 | `../02_read/output/entries.json` | rozbicie na wiadomości i propozycje zdarzeń od modelu |
| L4 | `../01_extract/output/raw_text.json` | tekst źródłowy, do wycięcia dowodu po numerach linii |
| L4 | `../00_prepare/output/documents.json` | które dokumenty są w trybie `--backfill` |
| L3 | `../../../../_context/10_event_types_relations.md` | kanon typów, wagi, statusu |
| L3 | `../../../../_context/20_pmbok_areas.md` | kanon obszarów |
| L3 | `../../../../_config/pm_settings.json` | domeny „naszej strony”, strefa dla dat bez strefy |

## Process

**Wiadomości.** Dla każdego dokumentu sprawdź rozbicie od modelu: zakresy linii mieszczą się w
tekście, rosną i nie zachodzą na siebie. Najwyższa wiadomość pliku bierze nadawcę, odbiorców, temat i
datę z metadanych (model wpisuje `"metadata"`). Wylicz `message_key` z początku treści (bez nagłówka),
stronę nadawcy (`ours` / `external` / `unknown`) i podgląd. Dokument Word / prezentacja / arkusz /
PDF dostaje jedną wiadomość rodzaju `file` — zakłada ją skrypt, model nie musi. Błąd zakresu zatrzymuje
przebieg; uwaga miękka (nadawca nieobecny w tekście, nieczytelna data) trafia do `issues` wiadomości.

**Zdarzenia.** Dla każdego wpisu: wytnij `evidence` dosłownie z tekstu źródłowego po
`evidence_lines`, policz `evidence_sha256`. Przypisz zdarzenie do wiadomości, w której leży jego
pierwsza linia dowodu (`message_key`, `message_no`); data zdarzenia to data tej wiadomości, chyba że
model podał inną; autor to nadawca tej wiadomości. Sprawdź `type` i `pmbok_area` względem kanonu —
wartość spoza kanonu trafia do `issues[]`, nie jest po cichu poprawiana. Zbuduj
`entry_id = {doc_key}-{KOD}-{NN}`.

## Outputs

- `output/validated.json` — zdarzenia gotowe do zapisu w bazie, z polami zgodnymi z
  `_context/30_row_schema.md`.
- `output/messages.json` — wiadomości tego przebiegu (także dokumentów w trybie `--backfill`).

## Verify

Liczba wpisów per dokument zgadza się z `entries.json`. Żaden `entry_id` się nie powtarza.
Każdy `evidence_sha256` faktycznie odpowiada treści `evidence`. Każde zdarzenie ma wiadomość.

## Bramka — zatrzymanie

- Dokument, którego sekcja dała zero wpisów w etapie `read` bez wyjaśnienia w bloku kontroli
  jakości, zatrzymuje przebieg tutaj najpóźniej — to ostatnia okazja, żeby złapać pustą
  ekstrakcję, zanim trafi do bazy. (Nie dotyczy dokumentów w trybie `--backfill`.)
- Plik z e-mailem bez rozbicia na wiadomości albo z zakresami, które zachodzą na siebie.

---

**Skrypt:** `run.py` w tym folderze.
