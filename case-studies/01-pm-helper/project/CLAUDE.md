# PM Tracker — Uniwersalny workspace śledzenia projektu

**Warstwa L0 — tożsamość workspace'u. Odpowiada na pytanie: gdzie jestem?**

---

## Czym jest ten workspace

Samodzielny workspace metody pracy przestrzennej MWP (Model Workspace Protocol). Czyta
dokumenty projektowe (korespondencję, notatki, dokumenty źródłowe), rozbija łańcuchy maili na
pojedyncze wiadomości, wyciąga z nich zdarzenia i relacje, pokazuje, które wiadomości czekają na
odpowiedź i które rozmowy są ciągiem dalszym innych, i na bieżąco buduje status oraz podsumowanie
dla ośmiu obszarów zarządzania projektem wg PMBOK 7. Nie jest to archiwum — to narzędzie analizy.

**Ten folder jest w pełni samodzielny.** Nie odwołuje się do żadnego folderu poza samym sobą.
Można go skopiować w dowolne miejsce i uruchomić od nowa.

<!-- INSTANCE:BEGIN — sekcje specyficzne dla tej kopii workspace'u (język, zasady zespołu, produkcja). Synchronizacja z produktu ich nie nadpisuje. -->
<!-- INSTANCE:END -->

## Zanim zaczniesz pracę w tym projekcie

1. Jeśli `_config/project_context.md` jest pusty — uruchom najpierw przepływ `context-intake`
   (patrz niżej). Bez zatwierdzonego kontekstu etap `read` przepływu `pm-tracker` nie ma na
   czym się oprzeć.
2. Ustaw `_config/pm_settings.json`: kto jest „naszą stroną” (`our_domains`, `our_names`), po ilu dniach
   brak odpowiedzi jest zaległy, strefa dat bez strefy, opcjonalnie `originals_base_url`.
3. Przeczytaj `_context/00_method.md` — reguły, które wiążą każdy etap.
4. Przeczytaj `_context/10_event_types_relations.md` i `_context/20_pmbok_areas.md` — kanon,
   z którego korzysta etap `read`.
5. Kolejność uruchamiania i kto co robi (skrypt, model, PM): `_context/40_runbook.md`.

## Struktura

```
workspace-template/
├── CLAUDE.md                       ← L0: ten plik
├── CONTEXT.md                      ← L1: routing
├── _context/                       ← L3: kanon (metoda, typy zdarzeń, obszary PMBOK 7, schemat wiersza) i runbook
├── _config/
│   ├── project_context.md          ← kontekst projektu, NIEMUTOWALNY poza przepływem context-intake
│   ├── context_proposals/          ← propozycje kontekstu czekające na decyzję PM
│   ├── pm_settings.json            ← nasza strona, próg zaległości, strefa dat, adres oryginałów
│   └── tags.json                   ← tagi wątków i plików (ręcznie + po decyzji PM)
├── _prompts/                       ← prompty dla etapów wykonywanych przez model
├── _scripts/                       ← wspólna biblioteka Python: threading_graph.py (wątki, stany odpowiedzi),
│                                     source_text.py (tekst źródeł i sprawdzanie cytatów), model_helpers.py
│                                     (pomocnik do rozbicia plików na wiadomości), check_canon.py i check_kb.py (kontrole)
├── _flows/
│   ├── context-intake/stages/      ← napełnienie kontekstu (00_collect, 01_propose, 02_approve)
│   └── pm-tracker/stages/          ← śledzenie zdarzeń (00_prepare … 07_report)
├── _context_sources/               ← WEJŚCIE: dokumenty OPISUJĄCE projekt (karta, kontrakt, kick-off)
├── _input/originals/               ← WEJŚCIE: BIEŻĄCE dokumenty do śledzenia (korespondencja, notatki); poza gitem
├── _kb/                            ← baza: events, documents, messages (jedna wiadomość = jeden wiersz), threads (przeliczane),
│                                     thread_links (powiązania wątków), review_decisions, md/ (treść źródłowa dosłownie)
├── _areas/                         ← osiem plików — status i podsumowanie metodą Minto, po jednym na obszar
└── _outputs/                       ← dashboard.html, strony podglądu źródeł (sources/), raport tekstowy
```

## Jak zacząć pracę nad nowym projektem

1. Wrzuć dokumenty opisujące projekt do `_context_sources/` (karta projektu, kontrakt, notatki
   z kick-offu — cokolwiek jest dostępne).
2. Uruchom przepływ `context-intake` (etapy `00_collect` → `01_propose` → `02_approve`).
   Etap `02_approve` wymaga Twojej decyzji — bez niej nic nie trafia do kontekstu.
3. Uzupełnij `_config/pm_settings.json` (patrz wyżej).
4. Wrzucaj bieżące dokumenty (korespondencję, notatki ze spotkań) do `_input/originals/` i
   uruchamiaj przepływ `pm-tracker` (etapy `00_prepare` → `07_report`) za każdym razem, gdy
   pojawi się coś nowego do przetworzenia.
5. Czytaj `_outputs/dashboard.html` (obszary, kolejka „czeka na odpowiedź”, oś czasu, rozmowy) i
   `_areas/*.md`; decyzje PM zbieraj w `pending_review.md`.

## Wątki, powiązania i tagi

Plik `.msg` to zwykle cały łańcuch wiadomości. Etap `read` rozbija go na pojedyncze wiadomości i
ocenia, czy każda czeka na odpowiedź albo zamyka rozmowę; ta sama wiadomość w kilku plikach to jeden
wiersz w `_kb/messages.jsonl`. Z tego skrypt liczy wątki i stan każdego z nich: czeka na odpowiedź
(od kogo i od ilu dni), zakończony, kontynuowany w innym wątku. Model podpowiada powiązania między
wątkami (ciąg dalszy, załącznik do, powiązany) i tagi; **wchodzą w życie dopiero po decyzji PM**
w `_flows/pm-tracker/stages/04_relate/output/pending_review.md` (`python review.py --apply`). Tagi
i własne tytuły wątków edytujesz też ręcznie w `_config/tags.json`. Baza sprzed wprowadzenia
wiadomości: `00_prepare/run.py --backfill` dopisuje je bez ruszania zdarzeń.

**Reguła wyglądu (trwała):** dashboard rysuje powiązania zatwierdzone przez PM linią ciągłą, a
zaproponowane przez model i czekające na decyzję — przerywaną, z dopiskiem „to decide”, żeby PM mógł
porównać je na jednym obrazie. Źródła są linkami „Email · temat” / „Word · nazwa pliku”, nigdy
identyfikatorami; obszary PMBOK 7 mają pełne nazwy i opisy dla zarządu, nigdy same kody. Szczegóły:
`_flows/pm-tracker/stages/07_report/CONTEXT.md`.

## Plik decyzji musi wystarczyć do decyzji

`pending_review.md` (i każdy plik, który człowiek ma tylko przeczytać i zdecydować) niesie w każdej pozycji
kontekst obu stron, **dosłowne cytaty** ze źródeł i skutek odpowiedzi „yes” i „no”. Cytaty sprawdza skrypt
względem tekstu źródła (`_scripts/source_text.py`); cytat, którego nie ma w źródle, dostaje wyraźne
ostrzeżenie. PM nie otwiera źródeł, żeby zdecydować.

## Oryginały, duplikaty i praca zespołowa

- **Oryginały nie idą przez git.** `_input/originals/`, `.msg`, `.docx` itd. są w `.gitignore`. Kto ma pliki,
  trzyma je lokalnie albo w osobnym miejscu współdzielonym (np. SharePoint); w `_config/pm_settings.json`
  można wtedy ustawić `originals_base_url`. Link „original” w dashboardzie pojawia się tylko tam, gdzie
  plik istnieje lub jest ten adres; zawsze jest dosłowny tekst źródła w `_outputs/sources/`.
- **Duplikaty poznajemy po treści pliku (`content_sha256`), nie po nazwie.** Ten sam mail zapisany pod inną
  nazwą jest pomijany; plik o znanej nazwie, ale zmienionej treści, dostaje ostrzeżenie w
  `00_prepare/output/skipped.json`. Ta sama wiadomość w innym pliku łączy się w jedną wiadomość, a
  zdarzenia wyciągnięte z niej drugi raz dostają ostrzeżenie w `issues`.
- **Dane należą do środowiska, w którym powstały.** Gdy zespół pracuje na wspólnym repozytorium, dane
  (`_kb`, `_areas`, `_outputs`, wyniki etapów) są wspólne i nigdy nie są nadpisywane kopią z innego
  środowiska; kopiuje się kod i dokumentację.

## Język

Wygląd dashboardu, plik decyzji i raport tekstowy są po angielsku (ustalone w kodzie etapów 04 i 07).
Teksty pisane przez model (tytuły zdarzeń, podsumowania obszarów) mają język z promptów — domyślnie polski;
kopia workspace'u może to nadpisać w bloku `INSTANCE` na górze tego pliku.

---

**Metoda:** ICM/MWP — Van Clief & McDermott.
**Wersja workspace'u:** 1.1 · **Data utworzenia:** 2026-09-18 · **Ostatnia zmiana:** 2026-09-21 (wiadomości, wątki, powiązania, tagi, nowy dashboard, plik decyzji z cytatami, duplikaty po treści)
