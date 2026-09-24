# Etap 04 — Relate

**Warstwa L2 — kontrakt etapu. Wykonawca: skrypt (wątki) + model (relacje i propozycje) + PM (decyzje).**

---

## Inputs

| Warstwa | Plik | Po co |
|---|---|---|
| L4 | `../03_validate/output/validated.json`, `messages.json` | zdarzenia i wiadomości tego przebiegu |
| L4 | `../../../../_kb/documents.jsonl`, `messages.jsonl`, `thread_links.jsonl` | dotychczasowa baza — wątki mogą łączyć się z wcześniejszymi |
| L3 | `../../../../_context/10_event_types_relations.md` | kanon relacji zdarzeń, rodzajów powiązań wątków i stanów odpowiedzi |
| L3 | `../../../../_config/pm_settings.json`, `tags.json` | domeny „naszej strony”, próg zaległości, tagi i własne tytuły wątków |

## Process

1. **Skrypt (`run.py`): wątki na poziomie wiadomości.** Ta sama wiadomość w kilku plikach to jeden
   węzeł; sąsiednie wiadomości łańcucha są połączone jako „odpowiedź na”; nagłówek `In-Reply-To`
   pierwszej wiadomości pliku i znormalizowany temat są zapasowe (`_scripts/threading_graph.py`).
   Numery wątków zapisane już w bazie się nie zmieniają, nowy wątek dostaje kolejny wolny numer, a
   dwa wątki, które okażą się jednym, dostają niższy z numerów. Dokumenty bez tematu (`—`) nie łączą
   się w jeden wątek. Wynik: `thread_id` przy każdym zdarzeniu i `output/thread_map.json`.
2. **Skrypt: kandydaci na powiązania wątków** (`output/link_candidates.json`): pary, które łączą
   rzadkie wspólne słowa, słowa z tytułu pliku w treści maila, wspólni uczestnicy i bliskość dat —
   choć nagłówki ani temat ich nie łączą. Pary już zaproponowane lub rozstrzygnięte są pomijane.
3. **Model: relacje semantyczne między zdarzeniami** tego przebiegu w kontekście tego samego wątku
   (`cancels`, `supersedes`, `implements`, `follows_up`, `closes`, `relates`; `replies_to` ustala
   skrypt).
4. **Model: ocena kandydatów.** Dla każdej pary czyta oba wątki i zapisuje do
   `output/link_proposals.json` tylko te powiązania, które uznaje za prawdziwe: rodzaj
   (`continuation` — od późniejszego wątku do wcześniejszego, `attachment_of` — od pliku do maila,
   `related`), pewność, jedno zdanie powodu i cytaty z obu stron. Pozostałe pary odrzuca.
5. **Model: podpowiedzi tagów** do `output/tag_suggestions.json` (najpierw z istniejącego słownika
   w `_config/tags.json`; nowy tag ma jednozdaniowy opis).
6. **PM: decyzje.** `python review.py` buduje `output/pending_review.md` z trzech list: powiązania
   wątków, tagi, propozycje zamknięcia zdarzenia (`closes` / `cancels`). PM wpisuje `yes` / `no`
   przy każdej pozycji i uruchamia `python review.py --apply`. Bez decyzji nic się nie zmienia.
   Odrzucone pary i tagi nie wracają. Decyzje trafiają do `_kb/review_decisions.jsonl`.
   **Plik musi wystarczyć do decyzji** (reguła trwała): każda pozycja niesie kontekst obu stron
   (tytuł, okres, uczestnicy, stan, początek i koniec treści), dosłowne cytaty ze źródeł —
   sprawdzone skryptem względem tekstu źródła, z ostrzeżeniem, gdy się nie zgadzają — i opis skutku
   „yes” i „no”. PM nie otwiera źródeł. Cytaty w propozycjach model podaje w polach `quotes`
   (powiązania) i `quote` (tagi); najlepiej wycinać je mechanicznie (`_scripts/source_text.py`).
   **Zamknięcie na podstawie dowodu spoza tego przebiegu.** `link_candidates.json` łączy tylko
   pary z bieżącego przebiegu, więc dowód zamknięcia starszy niż ten przebieg (np. notatka ze
   spotkania sprzed tygodni, o której PM przypomina wprost w rozmowie) nigdy nie trafi do
   `pending_review.md` sam z siebie. Wtedy decyzja PM-a wypowiedziana w rozmowie obowiązuje tak
   samo (reguła metody nr 11) — zmiana w `_kb/events.jsonl` i w pliku obszaru dostaje jawną notatkę,
   kto zdecydował, kiedy, i że ominęła `review.py --apply`.

## Outputs

- `output/related.json` — zdarzenia z `thread_id` i `relations`.
- `output/thread_map.json`, `output/link_candidates.json`, `output/link_proposals.json`,
  `output/tag_suggestions.json`, `output/pending_review.md`.

## Verify

Każda relacja ma istniejący `target`. Żadna relacja `closes` / `cancels` nie zmieniła statusu B
automatycznie. Żaden numer wątku nie oznacza dwóch różnych rozmów (`python ../../../../_scripts/check_kb.py`
po etapie 05). Żadne powiązanie wątków nie jest `confirmed` bez decyzji PM (`by: pm`).

---

**Skrypty:** `run.py` (wątki, kandydaci), `review.py` (kolejka decyzji) w tym folderze.
