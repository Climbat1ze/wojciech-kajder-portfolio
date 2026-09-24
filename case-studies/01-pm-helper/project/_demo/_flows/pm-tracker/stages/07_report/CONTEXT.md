# Etap 07 — Report

**Warstwa L2 — kontrakt etapu. Wykonawca: skrypt (bez kroku modelu).**

---

## Inputs

| Warstwa | Plik | Po co |
|---|---|---|
| L4 | `../../../../_kb/events.jsonl`, `documents.jsonl`, `messages.jsonl`, `thread_links.jsonl` | zdarzenia, pliki, wiadomości i powiązania wątków |
| L4 | `../../../../_areas/*.md` | status i podsumowanie każdego obszaru |
| L4 | `../../../../_areas/_summary.md` (opcjonalny) | podsumowanie dla zarządu (metodą Minto), pokazane przed „Project health” |
| L4 | `../../../../_areas/_appendix.md` (opcjonalny) | karta projektu na koniec strony: role, ścieżka eskalacji, cechy kontraktu |
| L4 | `../../../../_kb/md/` | dosłowny tekst źródeł do stron podglądu |
| L4 | `../../../../_kb/_runs/` | archiwum poprzednich przebiegów — widok rozwoju w czasie |
| L3 | `../../../../_context/20_pmbok_areas.md` | pełne nazwy obszarów i ich opisy dla zarządu |
| L3 | `../../../../_config/pm_settings.json`, `tags.json` | strefa wyświetlania, próg zaległości, tagi |

## Process

Zbuduj z bazy trzy rzeczy: `_outputs/dashboard.html` (obszary z opisami, kolejka „czeka na odpowiedź”,
otwarte ryzyka, oś czasu z torami wątków, widok rozmów, lista plików), `_outputs/sources/*.html`
(dosłowny tekst każdego pliku rozbity na wiadomości, z podświetlonymi cytatami zdarzeń) i
`_outputs/timeline_report.md` (ta sama treść tekstem). Wygląd i logika przeglądarkowa są w
`assets/`; `run.py` przygotowuje dane i skleja je w jeden plik, który działa po otwarciu z dysku.
Po zbudowaniu raportu zarchiwizuj bieżący stan do `_kb/_runs/{znacznik-czasu}/`.

## Reguły trwałe (zmiana tylko za zgodą właściciela programu)

1. **Zatwierdzone ciągłą linią, zaproponowane przerywaną.** Powiązanie wątków, które potwierdził PM
   (`status: confirmed`), jest rysowane linią ciągłą; to, które zaproponował tylko model
   (`suggested`), linią przerywaną z dopiskiem „to decide” — żeby PM mógł je porównać na jednym
   obrazie. Odrzucone (`rejected`) nie są rysowane. To samo dotyczy każdej przyszłej propozycji
   modelu, która czeka na decyzję.
2. **Źródła to czytelne hiperłącza**, nigdy identyfikatory: „Email · <skrócony temat>”,
   „Word · <skrócona nazwa pliku>”; obok mały link „original”. Plik Word / prezentacja / arkusz jest
   nazywany po nazwie pliku, nie po temacie z metadanych (bywa nazwą narzędzia).
3. **Obszary PMBOK 7 zawsze pod pełną nazwą i z opisem dla zarządu**, nigdy jako trzyliterowy kod.
   Kod jest tylko kluczem technicznym w bazie i nazwą pliku w `_areas/`.
   Osiem kafelków jest numerowanych 1-8 (kolejność `AREA_ORDER` w `run.py`) i wewnątrz każdego opis
   obszaru (kursywa, z kanonu) jest oddzielony linią od wniosku napisanego przez model — te dwa
   teksty inaczej się zlewają.
3a. **Podsumowanie dla zarządu i karta projektu piszesz tak samo ostrożnie jak pliki `_areas/*.md`**:
   `_areas/_summary.md` (wniosek najpierw, metodą Minto, bez identyfikatorów zdarzeń w tekście —
   trafiają one wprost na stronę) i `_areas/_appendix.md` (role, ścieżka eskalacji, cechy
   kontraktu — tabelami, nie wklejonym `_config/project_context.md`, bo ten plik bywa roboczy i
   dwujęzyczny). Oba pliki są opcjonalne — brak pliku po prostu pomija sekcję na stronie. Reguła
   koloru z obszaru dotyczy też tych stron: żadnych gołych identyfikatorów, żadnych trzyliterowych
   kodów.
4. **Kolor nie niesie sam tożsamości.** Typ zdarzenia to kształt plus kolor, status ma ikonę i podpis,
   jest legenda i podpowiedzi po najechaniu; motyw jasny i ciemny wybrane osobno.
5. **Godziny są pokazywane w jednej strefie** (`default_utc_offset`); kolejność odpowiedzi w łańcuchu ma
   pierwszeństwo przed godziną zapisaną w cytowanym nagłówku.

## Outputs

`_outputs/dashboard.html`, `_outputs/sources/`, `_outputs/timeline_report.md`.

## Verify

- Liczba zdarzeń w raporcie = liczba wierszy w `_kb/events.jsonl` z `rejected != true`.
- Każdy z ośmiu obszarów jest na pulpicie, nawet bez zdarzeń (wtedy „No data”).
- W widocznym tekście nie ma szesnastoznakowych identyfikatorów ani trzyliterowych kodów obszarów.
- Każdy `href` wskazuje istniejący plik (strony podglądu, `_input/originals/`).
- Oś czasu obejrzana w przeglądarce (szeroki ekran i telefon, motyw jasny i ciemny) przed uznaniem za gotową.

---

**Skrypt:** `run.py` w tym folderze; wygląd: `assets/tokens.css`, `dashboard.css`, `dashboard.js`, `template.html`, `source.css`.
