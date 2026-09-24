# PM Tracker — Routing

**Warstwa L1 — dokąd idę?**

---

## Kolejność czytania

| # | Dokument | Po co |
|---|---|---|
| 1 | `CLAUDE.md` | tożsamość workspace'u |
| 2 | `_context/00_method.md` | reguły, które wiążą każdy etap |
| 3 | `_context/10_event_types_relations.md` | kanon typów zdarzeń, wagi, statusu, relacji |
| 4 | `_context/20_pmbok_areas.md` | kanon ośmiu obszarów PMBOK 7 |
| 5 | `_context/30_row_schema.md` | schemat wiersza bazy |
| 6 | `_config/project_context.md` | kontekst tego konkretnego projektu (jeśli już zatwierdzony) |
| 7 | `_context/40_runbook.md` | kolejność uruchamiania: kto co robi (skrypt, model, PM) |

## Routing zadań

| Sytuacja | Zrób to |
|---|---|
| `_config/project_context.md` jest pusty | uruchom `_flows/context-intake/` |
| Nowy dokument do przetworzenia (korespondencja, notatka) | wrzuć do `_input/originals/`, uruchom `_flows/pm-tracker/` |
| Chcę zobaczyć status projektu | `_areas/*.md` (podsumowania) albo `_outputs/` (raport zbiorczy) |
| Kontekst projektu się zmienił (nowi ludzie, nowy klient) | ponownie uruchom `_flows/context-intake/` |
| Zmiana kanonu (typ zdarzenia, obszar, schemat, opis obszaru dla zarządu) | edytuj plik w `_context/`, nie kod w `_scripts/` |
| Nie wiem, co uruchomić i w jakiej kolejności | `_context/40_runbook.md` |
| Dostałem plik od klienta albo od kolegi | wrzuć do `_input/originals/` (poza gitem); duplikat i zmieniony plik zgłosi `00_prepare/output/skipped.json` |
| Chcę sprawdzić cytaty i sumy kontrolne zdarzeń | `python _scripts/check_canon.py` |
| Chcę zatwierdzić powiązania wątków, tagi albo zamknięcia zdarzeń | wypełnij `_flows/pm-tracker/stages/04_relate/output/pending_review.md`, potem `python review.py --apply` |
| Baza jest sprzed wprowadzenia wiadomości | `python _flows/pm-tracker/stages/00_prepare/run.py --backfill`, dalej etapy 01–05 |
| Sprawdzam spójność bazy wiadomości i wątków | `python _scripts/check_kb.py` |

## Reguły wyjścia

| Typ wyjścia | Lokalizacja |
|---|---|
| Wynik pośredni etapu | `_flows/<nazwa>/stages/NN_*/output/` |
| Baza zdarzeń i dokumentów | `_kb/` |
| Status i podsumowanie obszaru | `_areas/{KOD}.md` |
| Raport końcowy | `_outputs/` |

## Sekcje tej kopii workspace'u

<!-- INSTANCE:BEGIN — routing specyficzny dla tej kopii. Synchronizacja z produktu go nie nadpisuje. -->
<!-- INSTANCE:END -->

---

**Aktualizacja:** 2026-09-21
