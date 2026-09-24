# Etap 06 — Summarize

**Warstwa L2 — kontrakt etapu. Wykonawca: model.**

---

## Inputs

| Warstwa | Plik | Po co |
|---|---|---|
| L4 | `../../../../_kb/events.jsonl` | wszystkie zdarzenia, filtrowane po `pmbok_area` dotkniętym w tym przebiegu |
| L3 | `../../../../_context/20_pmbok_areas.md` | definicja obszaru, do którego pisze podsumowanie |
| L3 | `<root-lokalny>/_context/99_method_Minto_Pyramid.md` — **NIE ISTNIEJE w tym workspace; patrz uwaga niżej** | reguły podsumowań |

**Uwaga o przenośności:** ten workspace jest samodzielny i nie odwołuje się do korzenia żadnego
repozytorium. Reguły metody Minto, w skrócie wystarczającym do tego etapu, są tu:
**wniosek najpierw, jednym zdaniem; potem 3–5 twierdzeń uzasadniających; każde poparte
konkretnym zdarzeniem (`entry_id`); nagłówki niosą tezę, nie temat.** Kto chce pełnej metody z
przykładami per format, dokłada sobie do `_context/` tego workspace'u własną kopię takiego
pliku — to jedyne miejsce, gdzie świadomie zostawiamy odstępstwo od pełnej samodzielności, bo
metoda Minto to osobny, uznany standard komunikacji, a nie kanon specyficzny dla tego narzędzia.

## Process

Dla każdego z ośmiu obszarów, który ma choć jedno nowe lub zmienione zdarzenie w tym
przebiegu: przeczytaj wszystkie zdarzenia tego obszaru (nie tylko nowe — podsumowanie musi
uwzględniać całość, nie tylko przyrost), zbuduj podsumowanie metodą Minto i ustal status.

Status obszaru: **na czerwono**, jeśli jest otwarte zdarzenie typu `risk`/`issue` o wadze
`critical` bez terminu rozwiązania; **na żółto**, jeśli jest otwarte `risk`/`issue` o wadze
`high`; **na zielono** w pozostałych przypadkach.

**Wyjątek — cudza odpowiedzialność.** Kolor tej strony ma pokazywać, za co odpowiada zespół
prowadzący ten workspace, nie za wszystko, co dotyczy klienta w ogóle. Otwarte ryzyko/problem,
które jawnie należy do innej jednostki organizacji klienta (nie do zespołu prowadzącego ten
workspace) — nie liczy się do koloru tej strony, mimo że zostaje w tekście, bo dalej jest ważny
dla obrazu całości. Takie zdarzenie opisz wprost jako „nie po naszej stronie — [nazwa jednostki]”,
żeby czytelnik nie pomylił go z czymś, co ten zespół ma naprawić. Kiedy ryzyko/problem jest
aktywnie adresowane (nie leży bezczynnie), a jego waga to `high`, opisz to jako „w trakcie” —
żółty, nie czerwony, jest wtedy uczciwym obrazem stanu, nie ustępstwem.

Po zaktualizowaniu wszystkich dotkniętych obszarów, jeśli plik `_areas/_summary.md` już istnieje
(patrz niżej), przejrzyj go i uaktualnij — to samo podsumowanie z punktu widzenia zarządu, oparte
na najnowszym stanie wszystkich ośmiu obszarów, nie tylko tych zmienionych w tym przebiegu.

## Outputs

`_areas/{KOD}.md` — dla każdego przebudowanego obszaru: status, podsumowanie metodą Minto,
chronologiczna lista zdarzeń z odnośnikami do `entry_id`. Nagłówek pliku to **pełna nazwa obszaru**
(kolumna „Nazwa oryginalna” w `_context/20_pmbok_areas.md`), bez kodu — kod jest tylko nazwą pliku.

Opcjonalnie, `_areas/_summary.md` (podsumowanie dla zarządu, pokazywane w dashboardzie przed
„Project health”) i `_areas/_appendix.md` (karta projektu: role, ścieżka eskalacji, cechy
kontraktu — na końcu strony). Oba piszesz tą samą metodą Minto, ale **bez `entry_id` w tekście** —
te dwa pliki są pokazywane w całości, nie tylko pierwszym akapitem jak pliki obszarów, więc
identyfikator w nich od razu byłby widoczny czytelnikowi (reguła repozytorium: żadnych gołych
identyfikatorów ani trzyliterowych kodów w tekście, który widzi odbiorca). Format:
`_context/30_row_schema.md` nie opisuje tych dwóch plików osobno — trzymaj się struktury już
istniejącej u siebie w `_areas/_summary.md` / `_areas/_appendix.md`, jeśli już powstały.

## Verify

Wniosek jest w pierwszym zdaniu pliku, nie na końcu. Każde twierdzenie uzasadniające wskazuje
co najmniej jeden `entry_id`. Status wynika z reguł wyżej, nie z ogólnego wrażenia.

## Dobór modelu

Sonnet 5 wystarcza — to zestawienie już zwalidowanych danych w ustaloną strukturę, nie
odkrywanie nowego kontraktu.

---

**Prompt:** brak osobnego pliku — reguły są w tym kontrakcie, bo to krótkie zestawienie, nie
złożona ekstrakcja.
