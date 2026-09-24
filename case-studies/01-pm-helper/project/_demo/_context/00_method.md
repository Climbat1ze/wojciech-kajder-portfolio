# Metoda — jak działa ten workspace

**Warstwa L3 — plik sterujący, rzadko się zmienia.**

---

## Skąd ten workspace

Ten folder jest **samodzielnym workspace'em** metody pracy przestrzennej MWP (Model Workspace
Protocol, Van Clief & McDermott — filesystem jako warstwa orkiestracji). Nie zależy od żadnego
innego folderu poza samym sobą. Jeśli go skopiujesz gdziekolwiek — na inny dysk, do innego
repozytorium, na inny komputer — działa tak samo.

## Warstwy

| Warstwa | Gdzie | Pytanie | Zmienna między przebiegami |
|---|---|---|---|
| L0 | `CLAUDE.md` | gdzie jestem? | nie |
| L1 | `CONTEXT.md` | dokąd idę? | nie |
| L2 | `_flows/*/stages/*/CONTEXT.md` | co robię i jakie są reguły? | nie |
| L3 | `_context/`, `_config/`, `_prompts/` | z czym pracuję (stałe)? | rzadko — `_config/project_context.md` zmienia się tylko przez przepływ `context-intake` |
| L4 | `_kb/`, `_areas/`, `_outputs/`, `output/` w każdym etapie | z czym pracuję (ten przebieg)? | tak |

## Dwa przepływy

| Przepływ | Cel | Kiedy uruchamiać |
|---|---|---|
| `context-intake` | zamienia dokumenty opisujące projekt w zatwierdzony przez PM kontekst | na start projektu, i ponownie przy odświeżeniu kontekstu |
| `pm-tracker` | zamienia bieżące dokumenty (korespondencję, notatki) w zdarzenia, relacje i podsumowania obszarów | za każdym razem, gdy pojawi się nowy dokument do przetworzenia |

`pm-tracker` **czyta** `_config/project_context.md`, ale go nie zmienia. Jedyny sposób na
zmianę tego pliku to świadome ponowne uruchomienie `context-intake`.

## Reguły, które wiążą

1. **Granica skrypt/model.** Wyciąganie tekstu z pliku i zapis do bazy to zawsze robota
   skryptu (deterministyczna, powtarzalna). Rozumienie treści — co jest zdarzeniem, do jakiego
   obszaru należy, co znaczy dokument — to zawsze robota modelu. Nie miesza się tych ról.
2. **Treści nie tnie się regexem.** Struktura dokumentów źródłowych jest zmienna. Model czyta
   ze zrozumieniem, jak człowiek, nie dopasowuje wzorców.
3. **Cytat jest nienaruszalny.** Pole `evidence` przepisuje się dosłownie, znak po znaku,
   nigdy się go nie parafrazuje ani nie nadpisuje. Suma kontrolna (`evidence_sha256`) jest
   dowodem, że tego nie zrobiono.
4. **Model proponuje, człowiek zatwierdza.** Dotyczy dwóch miejsc: kontekstu projektu
   (`context-intake` / etap `approve`) i relacji, które zamykają lub anulują coś innego
   (`pm-tracker` / etap `relate`). W obu miejscach propozycja modelu nie wchodzi w życie sama.
5. **Listy kontrolowane są kanonem.** Wartość spoza `10_event_types_relations.md` albo
   `20_pmbok_areas.md` jest błędem walidacji, nie wariantem do zaakceptowania po cichu.
6. **Każdy output to powierzchnia edycji.** Każdy plik, który produkuje etap, człowiek może
   otworzyć i poprawić przed uruchomieniem kolejnego etapu. Żaden etap nie chowa danych
   pośrednich w formacie, którego nie da się przeczytać.
7. **Numeracja folderów koduje kolejność wykonania.** W obrębie jednego przepływu etap `02`
   uruchamia się po etapie `01`. Kolejność między przepływami: `context-intake` przed
   pierwszym uruchomieniem `pm-tracker`.

8. **Plik do decyzji wystarcza do decyzji.** Plik, który człowiek ma tylko przeczytać i zdecydować, niesie
   kontekst obu stron, dosłowne cytaty sprawdzone skryptem względem źródła i skutek każdej odpowiedzi. Nie
   odsyła do źródeł zamiast cytować.
9. **Propozycja modelu jest widoczna, ale odróżnialna.** To, co zaproponował model, a PM jeszcze nie
   zatwierdził, jest pokazywane inaczej niż zatwierdzone (w dashboardzie linią przerywaną) — PM widzi na jednym
   obrazie, co jest ustalone, a co czeka na decyzję.
10. **Dane należą do środowiska, w którym powstały.** Przenoszenie workspace'u przenosi kod i dokumentację;
    dane (`_kb`, `_areas`, `_outputs`, wyniki etapów) są własnością środowiska, w którym pracuje zespół, i nie
    są nadpisywane kopią z innego. Oryginały (`_input/originals/`) nie idą przez git.
11. **Decyzja PM-a wypowiedziana wprost, poza kolejką plików, obowiązuje tak samo — ale ląduje jawnie.**
    Standardowa droga to plik do decyzji (`pending_review.md` i podobne) i `review.py --apply`. Czasem PM
    ocenia sprawę od razu w rozmowie — np. gdy dowód, który uzasadnia decyzję, jest starszy niż bieżący
    przebieg i nie trafił do kolejki proponowanej przez model. Taka decyzja jest tak samo ważna, ale nie
    wolno wprowadzić jej po cichu: zmiana w danych (np. status zdarzenia w `_kb/events.jsonl`, relacja)
    dostaje w tekście, który zobaczy czytelnik (np. w pliku obszaru `_areas/{KOD}.md`), jawną notatkę kto
    zdecydował, kiedy i że decyzja ominęła standardowy plik do decyzji — inaczej czytelnik nie odróżni tego
    od automatycznie zatwierdzonej propozycji modelu.

---

**Źródło metody:** Van Clief, J. & McDermott, D. — Model Workspace Protocol (MWP). Ten plik
jest lokalną, samodzielną kopią zasad — nie odwołuje się do żadnego zewnętrznego repozytorium.
