# Kanon zdarzeń — typy, waga, status, relacje

**Warstwa L3 — plik sterujący.** Czytany przez `_scripts/io_jsonl.py` i `_scripts/check_canon.py`,
nigdy kopiowany do kodu. Zmiana listy typów, wag, statusów lub relacji = zmiana **tego pliku**,
nie skryptów.

Zasada parsowania: wartością jest **wytłuszczona pierwsza kolumna** tabeli pod danym nagłówkiem
`##`. Wartość spoza tych tabel w propozycji modelu trafia do `issues[]` (etap `validate`) albo
zatrzymuje etap `approve`/`relate`.

Pusta wartość w każdym polu tekstowym: `—` (półpauza), nie `null`, nie `""`.

---

## Typy zdarzeń

Kod (2 litery) wchodzi do `entry_id = {doc_key}-{KOD}-{NN}`. Kolumna „Ma status” mówi, czy pole
`status` ma sens dla typu (dla pozostałych `status = —`).

| Typ | Kod | Znaczenie | Ma status |
|---|---|---|---|
| **decision** | DE | Ustalenie wiążące projekt: zgoda, wybór wariantu, zatwierdzenie. | tak |
| **action** | AC | Konkretne zadanie — ktoś ma coś zrobić. Właściciel i termin, jeśli tekst je podaje. | tak |
| **risk** | RI | Coś, co **może** się wydarzyć i zaszkodzić (termin, zakres, relacja z klientem). | tak |
| **issue** | IS | Problem, który **już** występuje: blocker, eskalacja, brak odpowiedzi. | tak |
| **change** | CH | Zmiana zakresu, harmonogramu, zespołu lub sposobu pracy — stwierdzony fakt. | nie |
| **milestone** | MI | Osiągnięty etap: kick-off, podpis, dostawa, go-live, zamknięcie cyklu. | nie |
| **meeting** | MT | Spotkanie odbyte lub zaplanowane — tylko gdy samo spotkanie jest punktem na osi czasu. | nie |
| **note** | NO | Informacja lub status bez decyzji i akcji, warty zapamiętania. | nie |

## Waga

Kolejność w tabeli = kolejność ważności (pierwsza najwyższa). Model **proponuje**, PM
**zatwierdza** (etap `relate` / adnotacja).

| Waga | Kiedy |
|---|---|
| **critical** | Zmienia sposób prowadzenia projektu, zakres, termin, budżet albo relację z klientem. Stosować oszczędnie — zwykle 0, najwyżej 1–2 na dokument. |
| **high** | Istotne dla bieżącej realizacji: ma właściciela lub termin, ryzyko z realnym wpływem, decyzja operacyjna. |
| **normal** | Kontekst, status, logistyka. |

## Status

Dotyczy typów z „Ma status = tak”. Znaczenie zależy od typu:

| Status | decision | action | risk / issue |
|---|---|---|---|
| **open** | zaproponowana, czeka na akceptację | do zrobienia | aktywne |
| **closed** | przyjęta, obowiązuje | wykonana | zażegnane / rozwiązane |
| **superseded** | zastąpiona lub anulowana | anulowana / zbędna | nieaktualne |

## Relacje

Kierunek zawsze **A → B**: zdarzenie (albo dokument) A jest w relacji z B. `target` to
`entry_id`, `doc_key` albo `#N` (N-te zdarzenie z tego samego dokumentu, liczone od 1).

| Relacja | Znaczenie (A → B) | Kto zwykle ustala |
|---|---|---|
| **replies_to** | A odpowiada na B | skrypt (nagłówek `In-Reply-To`); model tylko, gdy nagłówka brak |
| **cancels** | A anuluje lub wycofuje B | model |
| **supersedes** | A zastępuje B (nowa wersja ustalenia) | model |
| **implements** | A realizuje B (akcja wynikająca z decyzji) | model |
| **follows_up** | A kontynuuje temat B (przypomnienie, dalszy ciąg) | model |
| **closes** | A zamyka B (akcję, ryzyko, issue) | model |
| **relates** | luźny związek, gdy żadna z powyższych nie pasuje | model |

`closes` i `cancels` **nie zmieniają** statusu B automatycznie — pojawiają się w kolejce
zatwierdzenia jako propozycja, a status zmienia PM. Przebieg źródłowy pozostaje nietknięty.

## Powiązania wątków i stany odpowiedzi

Dotyczą **wątków i wiadomości**, nie zdarzeń — osobna tabela, osobny plik w bazie
(`_kb/thread_links.jsonl`). Powiązanie zawsze proponuje model i zawsze zatwierdza PM.

| Rodzaj powiązania | Znaczenie (A → B) |
|---|---|
| **continuation** | wątek A jest dalszym ciągiem wątku B, choć nagłówki i temat tego nie łączą |
| **attachment_of** | plik A (Word, prezentacja) jest załącznikiem do maila z wątku B |
| **related** | wątki dotyczą tej samej sprawy, ale żaden nie jest ciągiem drugiego |

| Stan wiadomości | Znaczenie |
|---|---|
| **answered** | prosiła o odpowiedź i późniejsza wiadomość kogoś innego istnieje |
| **no_reply** | prosi o odpowiedź, a późniejszej wiadomości nie ma |
| **info** | nic nie prosi o odpowiedź |

| Stan wątku | Znaczenie |
|---|---|
| **awaiting** | ostatnia wiadomość czeka na odpowiedź |
| **closed** | ostatnia wiadomość zamyka rozmowę |
| **ended** | nic nie czeka na odpowiedź |
| **continued** | rozmowa toczy się dalej w innym wątku (zatwierdzone powiązanie `continuation`) |
| **unclear** | model nie potrafił ocenić |

---

**Wersja:** 1.0 · **Wzorowane na:** kanonie typów zdarzeń projektu EL (uogólnione, bez
przykładów specyficznych dla jednego projektu) · **Data:** 2026-09-18
