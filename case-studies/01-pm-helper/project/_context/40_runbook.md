# Runbook — kolejność uruchamiania

**Warstwa L3 — stabilny opis. Wszystkie polecenia uruchamiasz z głównego folderu workspace'u.**

Legenda: **[skrypt]** robi się sam i daje ten sam wynik; **[model]** wymaga czytania ze zrozumieniem
(asystent AI); **[PM]** to decyzja człowieka. Rozdzielenie ról to reguła metody nr 1.

---

## 1. Pierwsze uruchomienie nowego projektu

1. Dokumenty opisujące projekt wrzuć do `_context_sources/`.
2. `context-intake` — `00_collect` **[skrypt]** → `01_propose` **[model]** → `02_approve` **[PM]** (render.py,
   wypełnienie decyzji, commit.py). Bez zatwierdzonego `_config/project_context.md` nie ruszaj `pm-tracker`.
3. Uzupełnij `_config/pm_settings.json` **[PM]**: `our_domains` / `our_names` (kto jest naszą stroną),
   `stale_after_days`, `default_utc_offset`, opcjonalnie `originals_base_url`.
4. Przejdź do przebiegu rutynowego (punkt 2).

## 2. Przebieg rutynowy — nowe pliki w `_input/originals/`

| Etap | Polecenie | Kto | Wynik |
|---|---|---|---|
| 00 prepare | `python _flows/pm-tracker/stages/00_prepare/run.py` | skrypt | `output/documents.json` (nowe), `output/skipped.json` (duplikaty i zmienione — przeczytaj!) |
| 01 extract | `python _flows/pm-tracker/stages/01_extract/run.py` | skrypt | `output/raw_text.json` |
| 02 read | według `_prompts/message_split.md` i `event_extraction.md` | model | `output/entries.json`: `messages` (rozbicie na wiadomości z oceną „czeka na odpowiedź”) i `entries` (zdarzenia). Pomocnik: `_scripts/model_helpers.py` |
| 03 validate | `python _flows/pm-tracker/stages/03_validate/run.py` | skrypt | `validated.json`, `messages.json`; bramka zatrzymuje przebieg przy błędnym rozbiciu |
| 04 relate | `python _flows/pm-tracker/stages/04_relate/run.py` | skrypt | wątki, `link_candidates.json` |
| 04 relate | zapisz `link_proposals.json`, `tag_suggestions.json`, relacje zdarzeń w `related.json` | model | propozycje z **dosłownymi cytatami** (pola `quotes`, `quote`); cytaty wycinaj mechanicznie (`_scripts/source_text.py: excerpt`) |
| 05 index | `python _flows/pm-tracker/stages/05_index/run.py` | skrypt | baza `_kb/` |
| 04 review | `python _flows/pm-tracker/stages/04_relate/review.py` | skrypt | `output/pending_review.md` |
| 04 review | wypełnij `yes` / `no`, potem `python review.py --apply` | PM | powiązania, tagi, zamknięcia zdarzeń |
| 06 summarize | według kontraktu etapu | model | `_areas/*.md` (nagłówek to pełna nazwa obszaru) |
| 07 report | `python _flows/pm-tracker/stages/07_report/run.py` | skrypt | `_outputs/dashboard.html`, `_outputs/sources/`, `timeline_report.md` |

Po każdym przebiegu: `python _scripts/check_kb.py` i `python _scripts/check_canon.py` (zero błędów).
Po zatwierdzeniu decyzji w `pending_review.md` uruchom ponownie 05 i 07, żeby przerywane linie stały się ciągłe.

## 3. Baza sprzed wprowadzenia wiadomości

`00_prepare/run.py --backfill` → 01 → model rozbija pliki na wiadomości (`entries: []`, same `messages`) → 03 → 04 → 05.
Zdarzenia zostają nietknięte; dostają tylko przypisanie do wiadomości. Sumy kontrolne plików dopisuje
`00_prepare/run.py --record-hashes` (tylko tam, gdzie leżą oryginały).

## 4. Zasady, o których łatwo zapomnieć

- **Cytat jest nienaruszalny.** Zdarzenie z pustym `evidence` albo z sumą, która się nie zgadza, wychwytuje
  `check_canon.py`; napraw je od źródła (wiersze pliku), nie ręcznie w tekście.
- **Godziny w nagłówkach cytowanych maili są niewiarygodne** (zapisane w strefach różnych skrzynek); kolejność
  łańcucha ma pierwszeństwo przed zapisaną godziną.
- **Plik z decyzją musi wystarczyć do decyzji** (kontekst obu stron, cytaty, skutek „yes” i „no”).
- **Oryginały nie idą przez git**; duplikaty poznajemy po treści. Patrz `CLAUDE.md`, „Oryginały, duplikaty i praca zespołowa”.
- **Praca zespołowa:** dane są wspólne w repozytorium zespołu i nie są nadpisywane kopią z innego środowiska.
- Zmiana kanonu (typy, obszary, schemat, opisy obszarów) = edycja plików w `_context/`, nie kodu.

## 5. Typowe problemy

| Objaw | Co robić |
|---|---|
| `skipped.json` zawiera `changed` | plik o znanej nazwie ma nową treść; jeśli to nowa wersja, zmień jego nazwę i uruchom od 00 |
| `skipped.json` zawiera `duplicate` | ten sam plik pod inną nazwą — nic nie rób; usuń kopię, jeśli przeszkadza |
| `03_validate` przerywa: „nie rozbił pliku na wiadomości” | model musi wypełnić `messages` dla plików e-mail |
| Wątek „czeka na odpowiedź”, choć rozmowa toczy się w innym pliku | zaproponuj i zatwierdź powiązanie „ciąg dalszy” (04 review) |
| Brak linku „original” | pliku nie ma lokalnie i nie ustawiono `originals_base_url`; tekst jest na stronie podglądu |
| Dashboard się nie otwiera w przeglądarce bez okna | kontrola: dane i linki sprawdź skryptem, wygląd oglądnij ręcznie w zwykłej przeglądarce |

## 6. Plik pytań dla członka zespołu — nie tylko dla PM

`pending_review.md` (punkt 2, etap 04 review) jest zawsze zaadresowany do PM i tylko on go stosuje
(`review.py --apply`). Czasem to jednak **inna osoba** — zwykle ta, która faktycznie pisała i
odbierała maile — jest w stanie potwierdzić coś, czego ani model, ani PM nie rozstrzygnie: czy dwie
rozmowy dotyczą naprawdę tej samej sprawy, czy dwie osoby o tym samym imieniu to ta sama osoba, czy
pytanie zadane w mailu doczekało się odpowiedzi poza tym, co jest w bazie. Dla takiej osoby rób
osobny plik w `_outputs/questions_for_{imię}_{data}.md`, tą samą metodą **[model]**:

1. **Część 1 — hipotezy o powiązaniach między mailami.** Skopiuj z `pending_review.md` sekcję
   „Links between conversations” w całości (jest już zbudowana z dosłownymi, sprawdzonymi cytatami —
   nie przepisuj jej ręcznie). Zmień tylko nagłówek i wstęp na zaadresowany do tej osoby.
2. **Część 2 — wszystko inne niejasne.** Przejrzyj bazę pod kątem: pytań zadanych w mailu, na które
   nie ma odpowiedzi w danych; osób, które mogą być tą samą osobą pod różnym zapisem imienia; ról i
   skrótów bez pełnego rozwinięcia. Dla każdej pozycji: jedno pytanie zwykłym językiem, dosłowny cytat
   z pola `evidence` już istniejącego zdarzenia (nie wymyślaj nowego cytatu — jeśli nic nie masz w
   bazie, napisz to wprost zamiast zgadywać) i pole „Answer:” do wypełnienia.
3. Po odesłaniu pliku PM przenosi odpowiedzi do `pending_review.md` (część 1) i do decyzji projektowych
   (część 2) — sam plik pytań nie zmienia bazy.

Reguła jak w `pending_review.md`: **plik musi wystarczyć do odpowiedzi**, adresat nie ma szukać w
skrzynce. Żadnego żargonu tego narzędzia w tekście widocznym dla adresata („wątek”, „entry_id”,
„PMBOK” zamiast pełnej nazwy) — pisz jak do kolegi z zespołu, nie jak do siebie.
