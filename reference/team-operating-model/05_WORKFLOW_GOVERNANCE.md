# Zarządzanie przepływami: katalog etapów (modułów) programu

**Warstwa:** L3, procedura programu. **Utworzono:** 2026-09-13, decyzją właściciela programu (wariant „rejestr programu”, obok rejestru projektów).

---

## Po co

Etapy przepływów to moduły, które da się użyć ponownie. Przykład z praktyki: etap zamiany maili na tekst, dopracowany w raportowaniu tygodniowym, posłużył potem do osi czasu z maili w projekcie LO. Dopóki przepływów jest kilka, ich twórca pamięta, jakie etapy ma. Katalog etapów to jeden spis wszystkich etapów programu. Pozwala je znaleźć, porównać, użyć ponownie i przekazać innym.

## Gdzie to jest w metodzie MWP

Metoda (`_context/99_source_paper_VanClief_2026_EN.md`, §3.2) nie ma osobnej warstwy na zarządzanie przepływami. Katalog łączy dwie istniejące:
- jest spisem „fabryki”, czyli materiałem referencyjnym (warstwa 3), stabilnym między przebiegami;
- służy routingowi całego workspace'u (warstwa 1: który etap obsługuje zadanie, plus zasoby wspólne).

Dlatego leży w `_context/`, obok rejestru projektów (`_project_registry.json`), a nie w `_outputs/`. Do `_outputs/` trafiają wyniki pojedynczych przebiegów.

## Pliki

| Plik | Rola |
|---|---|
| `_context/_stage_catalog.md` | wersja do czytania, pogrupowana według projektów i przepływów |
| `_context/_stage_catalog.jsonl` | wersja maszynowa, jeden etap w jednej linii |
| `_scripts/management/build_stage_catalog.js` | generator |

**Katalogu nie edytuje się ręcznie.** Każda zmiana idzie do opisu etapu (`CONTEXT.md` w katalogu etapu), a katalog odświeża się skryptem. Tak samo działa rejestr projektów.

## Kiedy odświeżać

1. Po dodaniu, zmianie albo usunięciu etapu, w tym samym commicie co zmiana etapu.
2. Przed ponownym użyciem etapu w innym projekcie.
3. Przed promocją projektu do produkcji (`_context/04_DEV_TO_PROD_PROMOTION.md`).

Polecenie: `node _scripts/management/build_stage_catalog.js`

## Co musi mieć opis etapu, żeby katalog dobrze go opisał

| W opisie etapu | Trafia do kolumny katalogu |
|---|---|
| sekcja `## Purpose` / `## Cel` albo linia `**Cel:**` | „Co robi” (bez niej katalog bierze pierwszy krok procesu) |
| sekcja `## Inputs` / `## Wejście` z plikami w znacznikach kodu | „Wejście” |
| sekcja `## Outputs` / `## Wyjście` | „Wyjście” |
| linia `Wykonawca: model`, `Wykonawca: skrypt` albo `Wykonawca: człowiek` | „Wykonawca” (bez niej: przybliżenie z treści) |
| sekcja kontroli: `## Verify`, `## Bramka`, `## Human review points`, `## Error handling` | „Kontrole” |
| linia `**Właściciel:** imię i nazwisko` | „Właściciel / wersja” |
| linia `**Wersja:** 1.2 (2026-09-13)` | „Właściciel / wersja” |
| linia `**Pochodzi z:** projekt / przepływ / etap`, tylko przy etapie przeniesionym z innego przepływu | ślad ponownego użycia (pole `derived_from` w wersji maszynowej) |

## Wersje etapu

Numer wersji w opisie etapu mówi, czy zmiana może zepsuć tych, którzy z etapu korzystają:
- **poprawka** bez zmiany zachowania: 1.2 → 1.2.1;
- **nowa funkcja** zgodna z poprzednią wersją: 1.2 → 1.3;
- **zmiana, która może zepsuć użytkowników etapu** (np. inny format wyjścia, inne nazwy pól): 1.x → 2.0.

Każdą zmianę wersji zapisuje się w opisie etapu jednym wierszem: data, co się zmieniło, kto zatwierdził, dlaczego. To zasada „zmiana, nie podmiana”: poprzedni stan musi dać się odtworzyć.

## Przegląd katalogu (np. raz w miesiącu)

- **Etapy o tej samej nazwie w wielu przepływach:** robią to samo (kandydat na wspólny moduł) czy coś innego (zmienić nazwę, żeby się nie myliły)?
- **Etapy bez opisanej kontroli:** dopisać weryfikację albo bramkę zatrzymania.
- **Etapy bez właściciela i wersji:** uzupełnić w opisie etapu.
- **Wykonawca „nieokreślony”:** dopisać linię `Wykonawca:`.

## Ponowne użycie etapu

1. Sprawdź w katalogu, czy potrzebny etap już istnieje.
2. Przenieś etap razem z opisem. W opisie etapu docelowego dopisz `**Pochodzi z:**`, wskazując źródło.
3. Odśwież katalog.

## Kiedy to przestanie wystarczać

Procedura i skrypt wystarczają, dopóki zarządzanie przepływami to jeden spis. Gdy pojawi się drugi przepływ zarządczy (wersjonowanie, testy na przykładach, backlog modułów) albo gdy etapy zaczną budować inne osoby, warto przenieść zarządzanie przepływami do osobnego projektu w `_projects/`, z własnymi etapami: skan, uzupełnienie, przegląd z udziałem człowieka, publikacja. Opublikowany katalog i tak zostaje w `_context/`, żeby projekty czytały go z jednego miejsca. Dalsze metody: `_outputs/_drafts/2026-09-12_kotwice_narzedzia_PM_AI.md`, sekcja „Kotwica dodatkowa”.
