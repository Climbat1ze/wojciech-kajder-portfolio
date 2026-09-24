# Wpis do raportu tygodniowego Fieldcraft - standard / Fieldcraft weekly report entry - the standard

> **Reference material (Layer 3 - "fabryka", stabilne między uruchomieniami).**
> **Metoda:** Piramida Minto (Barbara Minto) zastosowana do jednego wpisu raportu tygodniowego Fieldcraft.
> Minto jest autorem piramidy i MECE - my je stosujemy. Standard wpisu to własne opracowanie na podstawie korpusu raportów 2025-2026.
> Ten plik nie jest opisem raportu - to zestaw reguł operacyjnych, gotowy do wstrzyknięcia w prompt.
>
> **Dla kogo:** Fieldcraft-owcy (Pre-Sales, PM, Architekci) i LLM, który buduje wpis z surowego inputu pracownika.
>
> **Plik jest dwujęzyczny.** Część polska: sekcje 0-9. Część angielska: sekcje EN 0-9, lustrzane,
> od nagłówka "PART II - ENGLISH". Numer sekcji znaczy to samo w obu językach. **Sam wpis jest zawsze po angielsku.**
>
> **Jak się powoływać w prompcie / how to invoke:**
> `Zbuduj wpis do raportu tygodniowego z poniższego inputu, zachowując standard z _context/99_method_Fieldcraft_Weekly_Entry.md`
> `Build a weekly report entry from the input below, following the standard in _context/99_method_Fieldcraft_Weekly_Entry.md`
>
> **Działa razem z:** `_context/99_method_Minto_Pyramid.md` (logika) i `_context/99_method_C-Level_KR_Communication.md` (styl, lista pustosłowia).
>
> **Koszt:** ok. 8 tys. tokenów za cały plik, ok. 4 tys. za jedną wersję językową.

---
---

# PART I - POLSKI

## 0. Reguła nadrzędna

**Najpierw wartość dla odbiorcy, potem dowód. Wpis, który nie niesie wartości dla odbiorcy, nie jest highlightem.**

Jeśli z całego pliku ma zostać jedno zdanie - to jest to zdanie.

---

## 1. Odbiorca i pięć wymiarów wartości

Raport tygodniowy sygnalizuje highlighty VLE (zespołu Fieldcraft), które przynoszą wartość odbiorcy.
Odbiorcy: sponsor z Aurora HQ (HQ), PM-owie, HQ leadership. Czytają kilkadziesiąt wpisów naraz i decydują po pierwszej linii.

| Kod | Wymiar | Pytanie odbiorcy | Twardy konkret we wpisie |
|---|---|---|---|
| **V1** | Wielkość sprzedaży | "Ile to jest warte?" | deal ID + kwota $ lub liczba urządzeń |
| **V2** | Potencjał sprzedaży | "Co to otwiera?" | nowa lub rozszerzona szansa, skala docelowa |
| **V3** | Rozwiązanie technologiczne | "Co nowego zbudowaliśmy albo pokazaliśmy?" | pierwsze wdrożenie, integracja, PoC, demo nowego produktu |
| **V4** | Poziom supportu | "Czy klient dostał pomoc na czas?" | problem rozwiązany, eskalacja zamknięta, numer ticket |
| **V5** | Support ustrukturyzowany | "Czy to się powtarza i skaluje?" | wertykał z kanonu, oferta powtarzalna, wsparcie całej jednostki |

**Test highlightu** - dwa pytania przed napisaniem wpisu:
1. Który wymiar V1-V5 niesie ten wpis? Jeśli żaden - wpis nie trafia do raportu albo dostaje jedną linię.
2. Czy konkret tego wymiaru stoi w tytule lub w `Deal:`? Jeśli jest dopiero w trzecim punkcie - przebuduj.

**Oznaczenia wewnętrzne VLE zostają poza wpisem.** Raport czyta Aurora HQ, więc w treści wpisu nie ma core KPI,
numerów deliverables (Dxx) ani kodów V1-V5 i typów A-E. Zamiast oznaczenia pisz fakt biznesowy: "new CarePlus customer",
nie "new CarePlus customer, core KPI 7". Mapowanie na core KPI (`_projects/Fieldcraft Weekly Reports/_config/kpiDefinitions.md`)
może trafić do metadanych roboczych pod wpisem.

---

## 2. Piramida wpisu (Subsidiary Support)

Każdy poziom odpowiada na pytanie, które rodzi poziom wyższy (Minto §2).

| Poziom Minto | Etykieta | Zawartość | Limit |
|---|---|---|---|
| **1 - teza** | tytuł (1. linia, bez etykiety) | `[Klient/Event] – [co się stało] – [wartość]`, data `MM/DD` | 1 zdanie |
| **1 - wartość** | `Deal:` | deal ID albo `to be registered`; kwota $ albo liczba urządzeń; `[TBC]` gdy brak | 1 linia |
| **2 - kontekst** | `Use case:` | czego klient potrzebuje i dlaczego teraz | 1-2 zdania |
| **2 - wkład VLE** | `VLE support:` | co zrobił VLE, punkty MECE | 3-5 punktów |
| **2 - wynik** | `Outcome:` | decyzja albo zmiana stanu u klienta | 1-3 punkty |
| **3 - kroki** | `Next steps:` | czynność – właściciel – termin | 1-3 punkty |

**Szablon:**

```
[Client/Event] – [what happened] – [value for the reader] (MM/DD)
Deal: [deal ID | to be registered] – [$ amount | number of devices | [TBC]]
Use case: [what the customer needs and why now]
VLE support:
• [what VLE did]
Outcome:
• [decision or change of state at the customer]
Next steps:
• [action] – [owner] – [MM/DD]
```

**Kolejność etykiet jest twarda.** Parser raportu (`_projects/Fieldcraft Weekly Reports/_flows/msg_to_md/stages/02_stage_02/_scripts/parse_sections.py`)
tnie wpis w kolejności tytuł → `Deal:` → `Use case:` → `VLE support:`, a wszystko po `VLE support:` trafia do tego pola. Z tego wynika:
- `Outcome:` i `Next steps:` zawsze stoją po `VLE support:`;
- żadna z etykiet nie pojawia się w tytule;
- wpis bez etykiet ląduje w całości w tytule (raport W36, rekordy 6 i 10) i traci pola deal i Use case.

**Metadane robocze** (Subs, PIC, Vertical, Typ, Value) ustala się przy budowie wpisu. Subs i PIC idą do kolumn tabeli raportu;
Vertical, Typ i Value służą autorowi do samokontroli i nie są drukowane w treści wpisu.

---

## 3. Typy wpisów i sekcja raportu

Typologia pochodzi z `_projects/Fieldcraft Weekly Reports/_prompts/2026-07-15_Fieldcraft_Weekly_Report_Prompt_v0.3.md`.
Typ decyduje o sekcji raportu i o tym, które pole jest twarde.

| Typ | Kiedy | Sekcja | Pole twarde |
|---|---|---|---|
| **A** Sales support / deal | wsparcie konkretnej szansy u klienta, także event, z którego wyszły szanse | Subsidiary Support | `Deal:` z kwotą lub liczbą urządzeń |
| **B** Recurring project update | stały projekt serwisowy (np. Lumina Optics) | Product Management | `Update:` z decyzjami i datami |
| **C** Product / PoC alignment | koordynacja, zakres roli VLE (np. the Rugged line) | Product Management | zakres roli VLE w `Update:` |
| **D** Product development | rozwój lub prezentacja produktu (np. AI Assist) | Product Management | `Status:` = etap (closed beta, GA, release) |
| **E** Integration support | utrzymanie lub rozwój integracji (np. the SSO link) | Product Management | `Status:` + numer ticket w `Update:` |

**Szablon Product Management (typy B-E).** Parser tej sekcji zna etykiety `Status:`, `Description:`, `Update:`, `Next steps:`,
a znak `—` (em dash) oddziela tytuł od zakresu. To jedyne miejsce wpisu, gdzie em dash jest wymagany; w tytule używaj `–` (en dash).

```
[Product/Project] – [what changed this week] – [value for the reader] — [Scope]
Status: [stage | status | release]
Description: [why it matters for the reader]
Update:
• [what VLE did or what was decided]
Next steps: [action] – [owner] – [MM/DD]
```

W sekcji Product Management nie ma etykiety `Outcome:` - wynik wpisuje się jako punkt w `Update:`.

---

## 4. Formaty pól

| Pole | Reguła | Przykład |
|---|---|---|
| Data | `MM/DD`, dwucyfrowo; tylko przy spotkaniu, warsztacie, evencie | 8 września → `09/08` |
| `Deal:` | deal ID z systemu albo `to be registered`; wartość w $ albo w urządzeniach | `Deal: DEAL-2026-0190 – 7,000 tablets` |
| Brak danych | `[TBC]` dokładnie w miejscu braku; nigdy puste pole i nigdy liczba zgadnięta | `Deal: to be registered – [TBC]` |
| Subs | kod z `_context/2026-08-29_Fieldcraft_subsidiary_codes.md` | `VL-PL`, nie `Poland` |
| Vertical | wartość z `_context/2026-08-29_Fieldcraft_verticals.md`; wątpliwość = `TBD` | `Finance` |
| Język | wpis zawsze po angielsku; input może być w dowolnym języku | - |
| Punkty | znak `•`; jeden punkt = jedno zdanie | - |

---

## 5. Dyrektywy operacyjne (do wklejenia w system prompt)

1. Pierwsza linia wpisu to teza: klient lub event, co się stało, jaka wartość. Nigdy sama nazwa spotkania.
2. Zanim napiszesz wpis, ustal wymiar wartości V1-V5. Jeśli nie ma żadnego, powiedz to autorowi zamiast pompować wpis.
3. Liczby, deal ID, nazwiska i daty bierz wyłącznie z inputu. Brak oznacz `[TBC]` w miejscu braku.
4. Trzymaj kolejność etykiet parsera: tytuł → `Deal:` → `Use case:` → `VLE support:` → `Outcome:` → `Next steps:`.
5. `VLE support:` ma 3-5 punktów MECE i opisuje wkład VLE, nie agendę spotkania. Więcej punktów zgrupuj pod pojęciem wyższego rzędu (Minto §3).
6. Wycinaj poziom 3: agendę eventu, innych prelegentów, pełne listy use case'ów, pustosłowie z C-Level KR §2.
7. Wpis pisz po angielsku, niezależnie od języka inputu.
8. Kod jednostki i wertykał bierz z kanonów; przy wątpliwości wpisz `TBD`, nie zgaduj.
9. Pod wpisem, poza jego treścią, wypisz metadane robocze (Subs, PIC, Vertical, Typ, Value) i listę braków `⚠` do uzupełnienia przez autora.
10. W treści wpisu nie używaj oznaczeń wewnętrznych VLE (core KPI, Dxx, V1-V5, typy A-E) - raport czyta Aurora HQ. Pisz fakt biznesowy.

---

## 6. Checklista przed wysłaniem

- [ ] Tytuł niesie tezę i da się go zrozumieć bez reszty wpisu.
- [ ] Wpis ma co najmniej jeden wymiar V1-V5, a jego konkret stoi w tytule lub w `Deal:`.
- [ ] `Deal:` jest wypełnione: ID, `to be registered` albo `[TBC]`.
- [ ] Etykiety stoją w kolejności parsera i żadna nie pojawia się w tytule.
- [ ] `VLE support:` ma 3-5 punktów MECE o wkładzie VLE.
- [ ] `Outcome:` opisuje zmianę u klienta, nie przebieg spotkania.
- [ ] Każdy next step ma czynność, właściciela i termin (albo `[TBC]`).
- [ ] Nie ma zmyślonej liczby, nazwiska ani deal ID.
- [ ] Wycięta agenda, inni prelegenci, listy dłuższe niż 5 punktów.
- [ ] Wpis po angielsku, data `MM/DD`, kod jednostki z kanonu.
- [ ] W treści nie ma oznaczeń wewnętrznych VLE (core KPI, Dxx, V1-V5, typy A-E).

---

## 7. Antywzorce

| Objaw | Poprawka |
|---|---|
| Tytuł to nazwa spotkania ("FleetPulse Workshop for Larkspur") | Dopisz wynik i wartość: "... – path to 120,000 devices" |
| Skala dealu schowana w drugim punkcie | Przenieś do tytułu i do `Deal:` |
| 10 punktów use case'ów przed wynikiem | Zgrupuj w 3-4 obszary, wynik przenieś wyżej |
| Puste `VLE support:` (5 z 10 rekordów W36) | Napisz, co zrobił VLE; bez tego wpis nie pokazuje wkładu zespołu |
| Cała treść w tytule, `Deal status: [no data]` | Użyj etykiet w kolejności parsera |
| Kwota w tytule, puste `Deal:` (Sentinel Home, W36) | Kwota idzie do `Deal:`; w tytule zostaje skala słownie lub w skrócie |
| "Discussed", "presented", "held a meeting" bez wyniku | Dopisz `Outcome:` - co się zmieniło u klienta |
| Agenda eventu i lista innych prelegentów | Wytnij - to nie jest wartość VLE |
| Szacunek bez oznaczenia | Oznacz `[TBC]` albo `est.` |
| Oznaczenie wewnętrzne w treści ("core KPI 7", "D7") | Napisz fakt biznesowy ("new CarePlus customer"); mapowanie przenieś do metadanych |

---

## 8. Przykłady Before/After

### 8.1 Warsztat - Larkspur (typ A)

**Before (skrót struktury):** tytuł = nazwa warsztatu; trzy punkty kontekstu, skala 30 000 → 120 000 urządzeń w drugim;
dziesięć punktów use case'ów; `Workshop Outcome` i `Next Steps` na końcu.

**After:**

```
Larkspur – FleetPulse Dynamic Data Export workshop (09/08) – path to scale FleetPulse from 30,000 to 120,000 devices
Deal: to be registered – expansion to 30,000 devices, organisational target 120,000 [deal ID TBC]
Use case: Larkspur runs FleetPulse and CarePlus in production, a success story in the government sector, and needs fleet-level analytics before scaling further.
VLE support:
• Remote workshop on FleetPulse Dynamic Data Export, mapped to Larkspur's production use cases
• Device health and battery degradation, compared by model, OS and firmware
• Impact of software, firmware and security updates on device behaviour
• Application stability and connectivity anomalies across the fleet
• Security indicators that require preventive or corrective action
Outcome:
• Larkspur expressed high satisfaction and scheduled a second workshop on 09/16 to implement selected scenarios on its production tenant
• Further device activations and Field Engineering Reports (FERs) to follow as needed
Next steps:
• Prepare the scenarios for Larkspur's production tenant – [owner TBC] – 09/16
• Support Larkspur in scaling the FleetPulse deployment – [owner TBC] – [TBC]
```

Metadane: Subs `[TBC]` · Vertical `Government` · Typ A · Value V2, V3, V5.

### 8.2 Event - Vela Business Summit 2026 (typ A)

**Before (skrót struktury):** narracja ok. 400 słów w sekcjach Event profile / Session delivered / Follow-up meetings / Assessment / Next steps;
ocena wartości dopiero w czwartej sekcji; lista innych prelegentów i hasło eventu na początku.

**After:**

```
Vela Business Summit 2026 (Warsaw, 09/10) – VLE presented the Pro Edition + GuardSuite + CarePlus offering to ~200 key Polish enterprise accounts; 3 follow-up opportunities opened
Deal: 3 opportunities to be registered – Nordbank (HerdManager migration), Granite Services (CarePlus), Vermillion (F23 → F26 fleet refresh); sizes [TBC]
Use case: Vela's flagship annual B2B event in Poland, opened by Iga Malinowska, President of Vela Poland, gathered decision-makers from the largest enterprise accounts in one room.
VLE support:
• Speaker session for ~200 enterprise decision-makers on the Vela B2B mobility portfolio
• Pro Edition, GuardSuite and CarePlus positioned as one offering: certified devices with extended lifecycle, centralised management and security, dedicated technical support
• Three follow-up business meetings on site with Nordbank, Granite Services and Vermillion, each closed with a defined next step
Outcome:
• Nordbank – evaluating a move from Contoso Manage to HerdManager, driven by dissatisfaction with Contoso Manage in their environment; strongest strategic case, as it would anchor HerdManager in a high-profile public institution
• Granite Services – concrete interest in buying CarePlus, scope and commercial terms discussed; nearest-term deal and a new CarePlus customer if closed
• Vermillion – fleet refresh from Vela F23 to F26, upgrade path and commercial framework discussed; volume hardware opportunity tied to the F26 cycle
Next steps:
• Granite Services – CarePlus proposal and pricing – [owner TBC] – [TBC]
• Nordbank – HerdManager migration assessment, incl. comparison with the current Contoso Manage setup – [owner TBC] – [TBC]
• Vermillion – fleet refresh quote F23 → F26, incl. trade-in and rollout options – [owner TBC] – [TBC]
```

Metadane: Subs `VL-PL` · PIC `[TBC]` · Vertical `Finance` (Nordbank, Vermillion), `TBD` (Granite Services) · Typ A · Value V2 (V1 po rejestracji deal) · core KPI 7 (Granite Services, jeśli deal się zamknie).
Braki `⚠`: PIC, deal ID ×3, wielkość floty Vermillion, kwoty, właściciele i terminy next steps.
Wycięte jako poziom 3: hasło eventu, venue, lista innych prelegentów (Rivera Bank, Aldridge, Orion, Beacon Solutions).

---

## 9. Powiązania w tym workspace

- `_context/99_method_Minto_Pyramid.md` - fundament: teza najpierw, MECE, grupowanie pod pojęciem wyższego rzędu.
- `_context/99_method_C-Level_KR_Communication.md` - styl i lista pustosłowia; odbiorca raportu to C-level z Aurora HQ.
- `_projects/Fieldcraft Weekly Reports/_prompts/2026-07-15_Fieldcraft_Weekly_Report_Prompt_v0.3.md` - interaktywny prompt zbierający dane; typy A-E.
- `_projects/Fieldcraft Weekly Reports/_flows/msg_to_md/stages/02_stage_02/_scripts/parse_sections.py` - parser, który wymusza kolejność etykiet.
- `_projects/Fieldcraft Weekly Reports/_context/10_schemat_wiersza.md` - wpis trafia do bazy wiedzy; pole `activity` jest przepisywane 1:1, więc jakość wpisu to jakość bazy.
- `_context/2026-08-29_Fieldcraft_subsidiary_codes.md`, `_context/2026-08-29_Fieldcraft_verticals.md` - kanony kodów jednostek i wertykałów.

---
---

# PART II - ENGLISH

## EN 0. The governing rule

**Value for the reader first, evidence second. An entry that carries no value for the reader is not a highlight.**

If only one sentence survives from this file, it is that one.

---

## EN 1. The reader and the five value dimensions

The weekly report signals VLE (Fieldcraft team) highlights that bring value to the reader.
Readers: the sponsor in Aurora HQ (HQ), the PMs, HQ leadership. They read dozens of entries at once and decide on the first line.

| Code | Dimension | Reader question | Hard fact in the entry |
|---|---|---|---|
| **V1** | Sales volume | "What is it worth?" | deal ID + $ amount or number of devices |
| **V2** | Sales potential | "What does it open?" | new or expanded opportunity, target scale |
| **V3** | Technology | "What new did we build or show?" | first deployment, integration, PoC, demo of a new product |
| **V4** | Support level | "Did the customer get help in time?" | issue resolved, escalation closed, ticket number |
| **V5** | Structured support | "Does it repeat and scale?" | vertical from the canon, repeatable offering, support for a whole subsidiary |

**Highlight test** - two questions before writing an entry:
1. Which dimension V1-V5 does this entry carry? If none, the entry stays out of the report or gets one line.
2. Does the hard fact for that dimension sit in the title or in `Deal:`? If it only appears in the third bullet, rebuild.

**VLE-internal labels stay out of the entry.** The report is read in Aurora HQ, so the entry text carries no core KPIs,
deliverable numbers (Dxx), V1-V5 codes or A-E types. Instead of a label, state the business fact: "new CarePlus customer",
not "new CarePlus customer, core KPI 7". A core KPI mapping (`_projects/Fieldcraft Weekly Reports/_config/kpiDefinitions.md`)
may go into the working metadata below the entry.

---

## EN 2. The entry pyramid (Subsidiary Support)

Each level answers the question raised by the level above it (Minto §2).

| Minto level | Label | Content | Limit |
|---|---|---|---|
| **1 - thesis** | title (first line, no label) | `[Client/Event] – [what happened] – [value]`, date `MM/DD` | 1 sentence |
| **1 - value** | `Deal:` | deal ID or `to be registered`; $ amount or number of devices; `[TBC]` when missing | 1 line |
| **2 - context** | `Use case:` | what the customer needs and why now | 1-2 sentences |
| **2 - VLE contribution** | `VLE support:` | what VLE did, MECE bullets | 3-5 bullets |
| **2 - result** | `Outcome:` | decision or change of state at the customer | 1-3 bullets |
| **3 - steps** | `Next steps:` | action – owner – date | 1-3 bullets |

**Template:**

```
[Client/Event] – [what happened] – [value for the reader] (MM/DD)
Deal: [deal ID | to be registered] – [$ amount | number of devices | [TBC]]
Use case: [what the customer needs and why now]
VLE support:
• [what VLE did]
Outcome:
• [decision or change of state at the customer]
Next steps:
• [action] – [owner] – [MM/DD]
```

**The label order is fixed.** The report parser (`_projects/Fieldcraft Weekly Reports/_flows/msg_to_md/stages/02_stage_02/_scripts/parse_sections.py`)
splits the entry in the order title → `Deal:` → `Use case:` → `VLE support:`, and everything after `VLE support:` lands in that field. Therefore:
- `Outcome:` and `Next steps:` always come after `VLE support:`;
- none of the labels appears in the title;
- an entry without labels lands in the title as a whole (report W36, records 6 and 10) and loses its deal and Use case fields.

**Working metadata** (Subs, PIC, Vertical, Type, Value) is settled while building the entry. Subs and PIC go into the report table columns;
Vertical, Type and Value are for the author's self-check and are not printed in the entry text.

---

## EN 3. Entry types and report section

The typology comes from `_projects/Fieldcraft Weekly Reports/_prompts/2026-07-15_Fieldcraft_Weekly_Report_Prompt_v0.3.md`.
The type decides the report section and which field is mandatory.

| Type | When | Section | Mandatory field |
|---|---|---|---|
| **A** Sales support / deal | support for a specific customer opportunity, including an event that produced opportunities | Subsidiary Support | `Deal:` with amount or device count |
| **B** Recurring project update | ongoing service project (e.g. Lumina Optics) | Product Management | `Update:` with decisions and dates |
| **C** Product / PoC alignment | coordination, scope of VLE's role (e.g. the Rugged line) | Product Management | VLE role scope in `Update:` |
| **D** Product development | product development or presentation (e.g. AI Assist) | Product Management | `Status:` = stage (closed beta, GA, release) |
| **E** Integration support | integration maintenance or development (e.g. the SSO link) | Product Management | `Status:` + ticket number in `Update:` |

**Product Management template (types B-E).** The parser for this section knows the labels `Status:`, `Description:`, `Update:`, `Next steps:`,
and the `—` character (em dash) separates the title from the scope. That is the only place in an entry where an em dash is required; inside the title use `–` (en dash).

```
[Product/Project] – [what changed this week] – [value for the reader] — [Scope]
Status: [stage | status | release]
Description: [why it matters for the reader]
Update:
• [what VLE did or what was decided]
Next steps: [action] – [owner] – [MM/DD]
```

The Product Management section has no `Outcome:` label - the result goes in as a bullet under `Update:`.

---

## EN 4. Field formats

| Field | Rule | Example |
|---|---|---|
| Date | `MM/DD`, two digits; only for a meeting, workshop or event | 8 September → `09/08` |
| `Deal:` | deal ID from the system or `to be registered`; value in $ or in devices | `Deal: DEAL-2026-0190 – 7,000 tablets` |
| Missing data | `[TBC]` exactly where the gap is; never an empty field and never a guessed number | `Deal: to be registered – [TBC]` |
| Subs | code from `_context/2026-08-29_Fieldcraft_subsidiary_codes.md` | `VL-PL`, not `Poland` |
| Vertical | value from `_context/2026-08-29_Fieldcraft_verticals.md`; when in doubt `TBD` | `Finance` |
| Language | the entry is always in English; the input may be in any language | - |
| Bullets | the `•` character; one bullet = one sentence | - |

---

## EN 5. Operational directives (to paste into a system prompt)

1. The first line of the entry is the thesis: client or event, what happened, what value. Never the meeting name alone.
2. Before writing, settle the value dimension V1-V5. If there is none, tell the author instead of inflating the entry.
3. Take numbers, deal IDs, names and dates only from the input. Mark any gap with `[TBC]` where it occurs.
4. Keep the parser's label order: title → `Deal:` → `Use case:` → `VLE support:` → `Outcome:` → `Next steps:`.
5. `VLE support:` has 3-5 MECE bullets describing VLE's contribution, not the meeting agenda. Group any more under a higher-order concept (Minto §3).
6. Cut level 3: event agenda, other speakers, full use-case lists, the filler words from C-Level KR §2.
7. Write the entry in English, whatever the input language.
8. Take the unit code and vertical from the canons; when in doubt write `TBD`, do not guess.
9. Below the entry, outside its text, list the working metadata (Subs, PIC, Vertical, Type, Value) and the `⚠` gaps the author must fill.
10. Do not use VLE-internal labels in the entry text (core KPI, Dxx, V1-V5, types A-E) - the report is read in Aurora HQ. State the business fact.

---

## EN 6. Pre-send checklist

- [ ] The title carries the thesis and can be understood without the rest of the entry.
- [ ] The entry has at least one dimension V1-V5, and its hard fact sits in the title or in `Deal:`.
- [ ] `Deal:` is filled in: ID, `to be registered` or `[TBC]`.
- [ ] The labels follow the parser's order and none appears in the title.
- [ ] `VLE support:` has 3-5 MECE bullets about VLE's contribution.
- [ ] `Outcome:` describes a change at the customer, not the course of the meeting.
- [ ] Every next step has an action, an owner and a date (or `[TBC]`).
- [ ] No invented number, name or deal ID.
- [ ] Agenda, other speakers and lists longer than 5 bullets are cut.
- [ ] Entry in English, date `MM/DD`, unit code from the canon.
- [ ] The entry text has no VLE-internal labels (core KPI, Dxx, V1-V5, types A-E).

---

## EN 7. Anti-patterns

| Symptom | Fix |
|---|---|
| The title is the meeting name ("FleetPulse Workshop for Larkspur") | Add result and value: "... – path to 120,000 devices" |
| Deal scale hidden in the second bullet | Move it to the title and to `Deal:` |
| 10 use-case bullets before the result | Group into 3-4 areas, move the result up |
| Empty `VLE support:` (5 of 10 records in W36) | State what VLE did; without it the entry shows no team contribution |
| Everything in the title, `Deal status: [no data]` | Use the labels in the parser's order |
| Amount in the title, `Deal:` empty (Sentinel Home, W36) | The amount goes to `Deal:`; the title keeps the scale in words or short form |
| "Discussed", "presented", "held a meeting" with no result | Add `Outcome:` - what changed at the customer |
| Event agenda and list of other speakers | Cut - it is not VLE value |
| Estimate without a flag | Mark it `[TBC]` or `est.` |
| Internal label in the text ("core KPI 7", "D7") | State the business fact ("new CarePlus customer"); move the mapping to the metadata |

---

## EN 8. Before/After examples

### EN 8.1 Workshop - Larkspur (type A)

**Before (structure summary):** title = workshop name; three context bullets, with the 30,000 → 120,000 device scale in the second;
ten use-case bullets; `Workshop Outcome` and `Next Steps` at the end.

**After:**

```
Larkspur – FleetPulse Dynamic Data Export workshop (09/08) – path to scale FleetPulse from 30,000 to 120,000 devices
Deal: to be registered – expansion to 30,000 devices, organisational target 120,000 [deal ID TBC]
Use case: Larkspur runs FleetPulse and CarePlus in production, a success story in the government sector, and needs fleet-level analytics before scaling further.
VLE support:
• Remote workshop on FleetPulse Dynamic Data Export, mapped to Larkspur's production use cases
• Device health and battery degradation, compared by model, OS and firmware
• Impact of software, firmware and security updates on device behaviour
• Application stability and connectivity anomalies across the fleet
• Security indicators that require preventive or corrective action
Outcome:
• Larkspur expressed high satisfaction and scheduled a second workshop on 09/16 to implement selected scenarios on its production tenant
• Further device activations and Field Engineering Reports (FERs) to follow as needed
Next steps:
• Prepare the scenarios for Larkspur's production tenant – [owner TBC] – 09/16
• Support Larkspur in scaling the FleetPulse deployment – [owner TBC] – [TBC]
```

Metadata: Subs `[TBC]` · Vertical `Government` · Type A · Value V2, V3, V5.

### EN 8.2 Event - Vela Business Summit 2026 (type A)

**Before (structure summary):** ~400-word narrative in sections Event profile / Session delivered / Follow-up meetings / Assessment / Next steps;
the value assessment only in the fourth section; the list of other speakers and the event slogan up front.

**After:**

```
Vela Business Summit 2026 (Warsaw, 09/10) – VLE presented the Pro Edition + GuardSuite + CarePlus offering to ~200 key Polish enterprise accounts; 3 follow-up opportunities opened
Deal: 3 opportunities to be registered – Nordbank (HerdManager migration), Granite Services (CarePlus), Vermillion (F23 → F26 fleet refresh); sizes [TBC]
Use case: Vela's flagship annual B2B event in Poland, opened by Iga Malinowska, President of Vela Poland, gathered decision-makers from the largest enterprise accounts in one room.
VLE support:
• Speaker session for ~200 enterprise decision-makers on the Vela B2B mobility portfolio
• Pro Edition, GuardSuite and CarePlus positioned as one offering: certified devices with extended lifecycle, centralised management and security, dedicated technical support
• Three follow-up business meetings on site with Nordbank, Granite Services and Vermillion, each closed with a defined next step
Outcome:
• Nordbank – evaluating a move from Contoso Manage to HerdManager, driven by dissatisfaction with Contoso Manage in their environment; strongest strategic case, as it would anchor HerdManager in a high-profile public institution
• Granite Services – concrete interest in buying CarePlus, scope and commercial terms discussed; nearest-term deal and a new CarePlus customer if closed
• Vermillion – fleet refresh from Vela F23 to F26, upgrade path and commercial framework discussed; volume hardware opportunity tied to the F26 cycle
Next steps:
• Granite Services – CarePlus proposal and pricing – [owner TBC] – [TBC]
• Nordbank – HerdManager migration assessment, incl. comparison with the current Contoso Manage setup – [owner TBC] – [TBC]
• Vermillion – fleet refresh quote F23 → F26, incl. trade-in and rollout options – [owner TBC] – [TBC]
```

Metadata: Subs `VL-PL` · PIC `[TBC]` · Vertical `Finance` (Nordbank, Vermillion), `TBD` (Granite Services) · Type A · Value V2 (V1 once deals are registered) · core KPI 7 (Granite Services, if the deal closes).
Gaps `⚠`: PIC, deal ID ×3, Vermillion fleet size, amounts, next-step owners and dates.
Cut as level 3: event slogan, venue, list of other speakers (Rivera Bank, Aldridge, Orion, Beacon Solutions).

---

## EN 9. Related material in this workspace

- `_context/99_method_Minto_Pyramid.md` - the foundation: thesis first, MECE, grouping under a higher-order concept.
- `_context/99_method_C-Level_KR_Communication.md` - style and the filler-word list; the report's reader is C-level in Aurora HQ.
- `_projects/Fieldcraft Weekly Reports/_prompts/2026-07-15_Fieldcraft_Weekly_Report_Prompt_v0.3.md` - interactive prompt that collects the data; types A-E.
- `_projects/Fieldcraft Weekly Reports/_flows/msg_to_md/stages/02_stage_02/_scripts/parse_sections.py` - the parser that enforces the label order.
- `_projects/Fieldcraft Weekly Reports/_context/10_schemat_wiersza.md` - the entry lands in the knowledge base; the `activity` field is copied 1:1, so entry quality is knowledge-base quality.
- `_context/2026-08-29_Fieldcraft_subsidiary_codes.md`, `_context/2026-08-29_Fieldcraft_verticals.md` - the unit-code and vertical canons.

---

**Last updated:** 2026-09-11
**Metoda / Method:** Piramida Minto (Barbara Minto) zastosowana do wpisu raportu tygodniowego Fieldcraft. Minto is the author of the pyramid; we apply it. Standard wpisu: własne opracowanie / entry standard: original compilation.
