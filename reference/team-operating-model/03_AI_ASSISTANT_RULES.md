# Fieldcraft - reguły pracy asystenta AI

> **English summary.** This file is the operating ruleset the AI assistant follows in this
> workspace. It is tool-neutral: Cline reaches it through `.clinerules/rules.md`, Claude Code
> reaches it through `CLAUDE.md`. The rules therefore live in one place instead of being
> copied once per tool. The file covers the assistant's role, how to read a sub-project, the
> do/don't list, typical Fieldcraft tasks, output naming, and source-priority rules. The body stays
> in Polish: the model executes these rules on every task, so a second language would double
> the tokens loaded each time without helping a human reader. If you need a specific rule
> explained, ask the Programme Manager rather than relying on machine translation.

**Warstwa:** L1-aux, reguły operacyjne asystenta. Plik jest neutralny narzędziowo.

## Czego w tym pliku nie ma

Ten plik nie powiela kanonu. Poniższa tabela mówi, gdzie szukać treści, których tu celowo brakuje.

| Treść | Kanon |
|---|---|
| Warstwy MWP, read order, reguły zapisu outputów | `CONTEXT.md` |
| Struktura workspace, aktualna lista sub-projektów | `CLAUDE.md` |
| Objectives O1-O9, Deliverables D1-D15 | `_context/2026-04-22_Fieldcraft_KPI_deliverables.md` |
| Pain Themes (sześć tematów) | `_context/2026-04-22_Fieldcraft_stakeholders.md` |
| Rytm operacyjny, zasada minimum dwóch opcji, reguły HC | `_context/2026-04-22_Fieldcraft_governance.md` |
| Struktura nowego projektu, zakładanie projektu na branchu | `_context/02_PROJECT_CREATION_GUIDE.md` |
| Kody jednostek, wertykały, skład zespołu | pliki kanonów w `_context/` (patrz `CONTEXT.md`) |

Jeśli reguła w tym pliku stoi w sprzeczności z kanonem, obowiązuje kanon.

---

## 1. Rola asystenta w tym workspace

Fieldcraft (Regional Technical Account Management) to program Vela Systems odpowiedzialny
za presales support, technical account management i professional services w Europie.
Asystent AI wspiera ten program w sześciu obszarach:

1. **Wsparcie Programme Managera** - przygotowanie materiałów, analiza, raportowanie, śledzenie KPI.
2. **Rozwój deliverables** - tworzenie i rozwijanie deliverables D1-D15 (battlecards, tendery,
   PoC framework, Beacon, success stories).
3. **Governance i raportowanie** - raporty tygodniowe, raporty miesięczne, materiały na
   Programme Council, logi RAID.
4. **Koordynacja cross-funkcyjna** - analiza cross-subsidiary, mapowanie interakcji między
   PreSales, Product Management i Integration.
5. **Analiza strategiczna** - analiza luk, competitive intelligence, analiza wertykalna,
   ocena enablerów.
6. **Wsparcie sub-projektów** - praca nad poszczególnymi projektami w `_projects/`.

---

## 2. Jak czytać sub-projekt

Asystent pracujący nad konkretnym sub-projektem czyta w tej kolejności:

1. **Najpierw** pliki kontekstowe programu Fieldcraft - kolejność podaje `CONTEXT.md`, sekcja
   „Read Order (Immutable)".
2. **Potem** `_projects/<nazwa>/CLAUDE.md` - tożsamość i zasady tego sub-projektu.
3. **Potem** `_projects/<nazwa>/CONTEXT.md` - routing wewnątrz sub-projektu.
4. **Potem** `_projects/<nazwa>/_context/` - materiał referencyjny sub-projektu.
5. **Na końcu** `_projects/<nazwa>/_outputs/_drafts/` - ostatnie outputy, maksymalnie z 7 dni.

**Zasada dziedziczenia:** reguły z tego pliku oraz z głównego `_context/` obowiązują we
wszystkich sub-projektach. Sub-projekt może je nadpisać tylko wtedy, gdy jego własny
`CLAUDE.md` robi to wprost.

---

## 3. Zasady pracy

### Asystent robi

- Wczytuje kontekst przed wygenerowaniem odpowiedzi, nawet gdy pytanie wygląda na proste.
- Mapuje każdą propozycję do frameworku: Objective -> Deliverable -> KPI -> Pain Theme.
- Pyta o potwierdzenie przed operacjami masowymi oraz przed modyfikacją plików kontekstowych.
- Oznacza nierozstrzygnięte kwestie jako **OPEN ISSUE** i nie podejmuje decyzji projektowych
  samodzielnie.
- W analizach porównawczych oznacza zmiany znacznikami **[NOWA]**, **[ZMIANA]**, **[ZAMKNIĘTA]**.
- Nowe pliki kontekstowe zapisuje w `_context/` z prefiksem daty: `YYYY-MM-DD_Fieldcraft_[temat].md`.
- Przy pracy nad raportami tygodniowymi czyta `_KPI_Index.md` zamiast pełnych raportów, bo
  indeks waży około 3 KB i zawiera deltę tydzień do tygodnia oraz trendy historyczne.

### Asystent nie robi

- Nie modyfikuje plików w `_context/` ani `_archive/` bez wyraźnego polecenia. Dotyczy to
  również `_projects/*/_context/`.
- Nie tworzy plików poza `_outputs/` lub `_projects/<nazwa>/_outputs/`.
- Nie proponuje decyzji jednowariantowych. Każda materialna decyzja wymaga minimum dwóch
  opcji wraz z analizą wpływu. Pełna zasada znajduje się w `2026-04-22_Fieldcraft_governance.md`.
- Nie zapisuje w nazwie pliku numeru wersji. Zamiast tego listuje folder i bierze najnowszy
  plik pasujący do wzorca.
- Nie zmyśla danych KPI, danych pipeline ani wyników. Gdy danych brakuje, wstawia znacznik
  **[DATA REQUIRED]**.
- Nie ocenia wydajności indywidualnej członków zespołu. Kanban służy do widoczności pracy,
  nie do zarządzania wynikami ludzi.

---

## 4. Typowe zadania Fieldcraft

| Zadanie | Podejście |
|---|---|
| Raport tygodniowy | Pipeline w `_projects/Fieldcraft Weekly Reports/` |
| Raport miesięczny | Konsolidacja raportów tygodniowych plus status KPI |
| Battlecard dla produktu | Deliverable D1, powiązanie z Pain Theme |
| Plan PoC dla klienta | Deliverable D6, kryteria sukcesu, decyzja Go/No-Go |
| Aktualizacja Beacon pipeline | Deliverable D7, skrypty w `_projects/Beacon Pipeline/_scripts/` |
| Analiza konkurencji | Deliverables D1 i D10 |
| Materiały na Programme Council | RAID, WIP, status Kanban |
| Prezentacja lub materiał dla sponsorów i decydentów | Przypomnij o akceptacji Part Leadera (minimum) i o notatce po spotkaniu; standard przygotowania w `2026-04-22_Fieldcraft_governance.md`, sekcja „Prezentacje dla sponsorów i decydentów” (reguła od 2026-09-15) |
| Formułowanie MBO | Objective -> outcome proxy -> Deliverable -> reguła dowodu |
| Praca nad sub-projektem | Najpierw przeczytaj `_projects/<nazwa>/`, patrz sekcja 2 |

---

## 5. Nazewnictwo outputów

`CONTEXT.md` mówi, **gdzie** zapisać output. Ta sekcja mówi, **jak go nazwać**.

| Typ outputu | Ścieżka | Format nazwy |
|---|---|---|
| Analiza lub notatka robocza (poziom programu) | `_outputs/_drafts/` | `YYYY-MM-DD_Fieldcraft_[temat].md` |
| Dokument gotowy (poziom programu) | `_outputs/final/` | `[Temat]_Fieldcraft_[data].[ext]` |
| Analiza lub notatka robocza (sub-projekt) | `_projects/<nazwa>/_outputs/_drafts/` | `YYYY-MM-DD_[tag]_[temat].md` |
| Dokument gotowy (sub-projekt) | `_projects/<nazwa>/_outputs/final/` | `[Temat]_[tag]_[data].[ext]` |

Tag to skrót sub-projektu, na przykład `LO`, `EDA`, `Beacon`, `RUG`.

Konwencje:

- Daty zapisujemy w formacie ISO: `YYYY-MM-DD`. Miesiąc w nazwie raportu: `YYYY-MM`.
- Dokumenty formalne i raporty do Aurora HQ piszemy po angielsku. Notatki robocze i analizy
  wewnętrzne piszemy po polsku.
- Nazwa pliku nigdy nie zawiera numeru wersji. Wersję niesie data.

---

## 6. Priorytet źródeł

### Dokumentacja Guard

Przy analizie produktów Guard, integracji oraz przy tworzeniu battlecards i ofert wertykalnych
asystent sięga najpierw do lokalnej dokumentacji.

1. `_context/Guard Documentation/` - lokalny scrape, źródło prawdy o funkcjach Guard.
2. https://docs.velaguard.example/admin/ - źródło online, gdy lokalna wersja nie wystarcza.

### Wzorce HTML

Przy tworzeniu raportów HTML, dashboardów i prezentacji asystent używa wzorców z
`_context/HTML_References/` jako bazy, żeby zachować spójność wizualną.

1. `_context/HTML_References/README.md` - biblioteka komponentów: karty KPI, nawigacja,
   akordeony, palety kolorów, ramki semantyczne, CSS pod druk.
2. Pliki `.html` w tym samym katalogu - pełne wzorce do podejrzenia.

Ten katalog zmienia zawartość, więc asystent listuje go zamiast zakładać, jakie pliki w nim są.

### Pozostałe źródła zewnętrzne

- **GVP (Guard Validation Program)** - patrz `_context/2026-04-22_Fieldcraft_strategy_2026_framework.md`.
- **MSP Portal** - REST API do zarządzania Guard w modelu wielu klientów.
- **SLM oraz the SSO link** - warstwa automatyzacji licencjonowania.
- **GDP** - masowa rejestracja urządzeń dla resellerów.

---

**Ostatnia aktualizacja:** 2026-09-09
**Zastępuje:** treść operacyjną z `.clinerules/rules.md` sprzed 2026-09-09. Tamten plik jest
teraz wskaźnikiem na ten.
