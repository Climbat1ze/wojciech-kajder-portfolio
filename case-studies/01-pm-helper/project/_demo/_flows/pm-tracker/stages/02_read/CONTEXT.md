# Etap 02 — Read

**Warstwa L2 — kontrakt etapu. Wykonawca: model.**

---

## Inputs

| Warstwa | Plik | Po co |
|---|---|---|
| L4 | `../01_extract/output/raw_text.json` | tekst dokumentów, ponumerowany |
| L3 | `_prompts/message_split.md` | instrukcja rozbicia pliku na wiadomości (pierwsza część etapu) |
| L3 | `_prompts/event_extraction.md` | instrukcja ekstrakcji — treść promptu jest tam, nie tutaj |
| L3 | `../../../../_context/10_event_types_relations.md` | typy zdarzeń, waga, status |
| L3 | `../../../../_context/20_pmbok_areas.md` | osiem obszarów PMBOK 7 |
| L3 | `../../../../_config/project_context.md` | zatwierdzony kontekst projektu — ludzie, klienci, słownik |

Nic więcej. Model nie sięga po plik źródłowy poza tym, co już jest w `raw_text.json`.

## Process

Najpierw rozbij każdy plik na wiadomości (`_prompts/message_split.md`): łańcuch e-maili to wiele
wiadomości, a nie jeden dokument. Potem wykonaj prompt z `_prompts/event_extraction.md` na polu
`text` każdego dokumentu. Model
**czyta ze zrozumieniem**, nie dopasowuje wzorców. Produkuje dla każdego zdarzenia: `type`,
`pmbok_area`, `title`, `evidence_lines` (numery linii, nie treść), `owner`, `due`, `importance`,
`status` (gdy dotyczy).

## Outputs

`output/entries.json` — dla każdego dokumentu: `messages` (rozbicie na wiadomości), `entries`
(zdarzenia w kolejności występowania) i blok `quality_control` (liczba wpisów, ewentualne
niejednoznaczności). Dokument Word/prezentacja/arkusz ma `messages` puste — jedną wiadomość
rodzaju `file` zakłada skrypt w `validate`. Dokument z `"backfill": true` w
`00_prepare/output/documents.json` (baza zna go już bez rozbicia na wiadomości) dostaje tylko
`messages`, a `entries` zostaje puste.

## Verify

- Dokument, który wygląda na treściwy, a dał zero wpisów — sprawdź jeszcze raz, to sygnał
  błędu w czytaniu, nie spokojny dokument.
- Wyrywkowo: porównaj `evidence_lines` trzech wpisów ze źródłem znak po znaku po wycięciu w
  etapie `validate`.
- Żaden wpis nie ma pola `pmbok_area` spoza kanonu ośmiu obszarów.
- Każdy plik z e-mailem ma co najmniej jedną wiadomość; zakresy `lines` nie zachodzą na siebie;
  liczba wiadomości zgadza się z liczbą nagłówków w tekście (przelicz na oko).

## Bramka — zatrzymanie

Dokument, który po przeczytaniu dał zero zdarzeń, zatrzymuje przebieg, chyba że w bloku
kontroli jakości jest jawne wyjaśnienie (np. „dokument czysto informacyjny, bez decyzji ani
akcji”). Milcząca pustka nie przechodzi dalej.

## Dobór modelu

| Kiedy | Model | Dlaczego |
|---|---|---|
| Pierwszy dokument nowego projektu, ustalanie kontraktu | Opus 5 | wychwycenie edge case'ów układu dokumentu |
| Kolejne dokumenty tego samego projektu | Sonnet 5 | kontrakt już ustalony, zadanie to wierne czytanie |

Nie schodzić niżej — wierność cytatu i trafność przypisania obszaru to cała wartość tej bazy.

---

**Prompt:** `_prompts/event_extraction.md` (L3, edytowalny bez dotykania kodu)
