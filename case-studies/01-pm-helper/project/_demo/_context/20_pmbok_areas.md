# Kanon obszarów — osiem domen wg PMBOK 7

**Warstwa L3 — plik sterujący.** Jedyne źródło prawdy o tym, do jakiego obszaru zarządzania
projektem może trafić zdarzenie. Wartość spoza tej tabeli jest błędem walidacji.

Podział pochodzi z wydania siódmego standardu „Project Management Body of Knowledge” (PMBOK 7,
2021) — osiem domen wykonania (performance domains). Wybrany zamiast własnej taksonomii, żeby
nie wymyślać podziału od zera i móc się powoływać na uznany standard.

Kod (3 litery) wchodzi do pliku w `_areas/{KOD}.md` i do pola `pmbok_area` w schemacie wiersza — to
**klucz techniczny**. Czytelnikowi (dashboard, raport, podsumowania) pokazujemy zawsze pełną nazwę
z kolumny „Nazwa oryginalna” i opis z ostatniej kolumny, nigdy sam kod.

---

| Obszar (PL) | Nazwa oryginalna | Kod | Co tu trafia — sygnały rozpoznania | Opis dla zarządu (EN) |
|---|---|---|---|---|
| **Interesariusze** | Stakeholders | STK | kto jest zaangażowany, czego oczekuje, zmiana roli/kontaktu po stronie klienta lub własnej organizacji, eskalacja do kogoś nowego | Who has a stake in the project and whether they are aligned: the customer, your own organisation's units and executives. |
| **Zespół** | Team | TEA | skład zespołu, zmiana PM-a lub architekta, obciążenie, sposób współpracy wewnątrz zespołu | Who does the work and whether the team has what it needs: roles, capacity and collaboration. |
| **Podejście do realizacji i cykl życia** | Development Approach and Life Cycle | DAL | wybór modelu dostawy (np. T&M, etapy: analiza/pilotaż/wdrożenie), zmiana metodyki pracy | How the work is delivered: the chosen approach and its stages, such as analysis, pilot and roll-out. |
| **Planowanie** | Planning | PLN | harmonogram, zakres na starcie, budżet planowany, założenia przyjęte na wejściu | What is planned: scope, schedule, budget and the assumptions the project started with. |
| **Praca projektowa** | Project Work | PWK | bieżące zadania, blokery operacyjne, zarządzanie zasobami dzień po dniu | Day-to-day execution: open tasks, blockers and who is responsible for what. |
| **Dostarczanie** | Delivery | DEL | co faktycznie powstało i zostało przekazane, jakość dostarczonego rezultatu, akceptacja przez klienta | What has actually been handed over to the customer, its quality and whether the customer accepted it. |
| **Pomiar** | Measurement | MEA | wskaźniki, raportowanie postępu, odchylenie od planu, wnioski z pomiaru | How progress is measured: indicators, reporting and deviations from the plan. |
| **Niepewność** | Uncertainty | UNC | ryzyka, założenia, które mogą się nie sprawdzić, brak informacji wymagany do decyzji | What could go wrong or is not yet known: risks, doubtful assumptions and information still missing for decisions. |

## Zasada przypisania

Jedno zdarzenie trafia do **jednego** obszaru — tego, którego dotyczy najbardziej bezpośrednio,
nie każdego, z którym da się je luźno skojarzyć. Zdarzenie, które nie pasuje wyraźnie do
żadnego obszaru, zostaje w `issues[]` etapu `validate` do ręcznego rozstrzygnięcia, zamiast
trafić do najbliższego z brzegu.

---

**Wersja:** 1.0 · **Źródło podziału:** Project Management Institute, „A Guide to the Project
Management Body of Knowledge (PMBOK Guide)”, wydanie siódme, 2021 · **Data:** 2026-09-18
