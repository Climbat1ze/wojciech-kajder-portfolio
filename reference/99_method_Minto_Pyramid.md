# Piramida Minto - reguły komunikacji / The Minto Pyramid - communication rules

> **Reference material (Layer 3 - "fabryka", stabilne między uruchomieniami).**
> Metoda: **Barbara Minto, *The Pyramid Principle*** (wypracowana w McKinsey, wyd. 1978, rozszerzone 2009).
> Ten plik nie jest streszczeniem książki - to zestaw reguł operacyjnych, gotowy do wstrzyknięcia w prompt.
>
> **Atrybucja (reguła bezwzględna):** piramida i MECE to koncepcje Minto. My jesteśmy stosującym, nie autorem.
>
> **Plik jest dwujęzyczny.** Część polska: sekcje 0-9. Część angielska: sekcje EN 0-9, lustrzane,
> od nagłówka "PART II - ENGLISH". Numer sekcji znaczy to samo w obu językach.
>
> **Jak się powoływać w prompcie / how to invoke:**
> `Przygotuj [prezentację / mail / notatkę] na temat X, zachowując reguły Minto z _context/99_method_Minto_Pyramid.md`
> `Prepare [a deck / an email / a memo] on X, following the Minto rules in _context/99_method_Minto_Pyramid.md`
>
> **Koszt:** ok. 4 tys. tokenów za cały plik, ok. 2 tys. za jedną wersję językową.

---
---

# PART I - POLSKI

## 0. Reguła nadrzędna

**Najpierw wniosek, potem uzasadnienie. Argumenty na tym samym poziomie muszą być rozłączne i wyczerpujące.**

Jeśli z całego pliku ma zostać jedno zdanie - to jest to zdanie.

---

## 1. Wejście: SCQA (ustawienie wspólnego gruntu)

Otwarcie każdego dłuższego materiału. Cztery kroki, każdy krótki.

| Element | Co to jest | Test poprawności |
|---|---|---|
| **S - Situation** | Bezsporny fakt lub stan znany odbiorcy. Bez ocen. | Odbiorca kiwa głową: "tak, wiem". |
| **C - Complication** | Zmiana lub napięcie, które burzy sytuację i wymusza działanie. | Odbiorca myśli: "faktycznie, to problem". |
| **Q - Question** | Pytanie, na które odbiorca szuka odpowiedzi wobec komplikacji. | Da się je zapisać jednym zdaniem pytającym. |
| **A - Answer** | Główna teza. Wierzchołek piramidy. | Jest bezpośrednią odpowiedzią na Q, nie zapowiedzią odpowiedzi. |

**Proporcje:** S i C razem to maksymalnie 3-4 zdania. Q bywa niewypowiedziane wprost.
A pojawia się natychmiast po nich - nigdy na końcu.

---

## 2. Logika pionowa (mechanizm top-down)

Każdy niższy poziom odpowiada na pytanie, które rodzi poziom wyższy.

| Poziom | Zawartość | Pytanie odbiorcy, na które odpowiada |
|---|---|---|
| **1. Wniosek główny** | Jedno zdanie: rekomendacja lub odpowiedź. | (brak - to jest odpowiedź) |
| **2. Linia argumentacyjna** | 3-5 twierdzeń uzasadniających poziom 1. | "Dlaczego tak twierdzisz?" / "Jak to zrobić?" |
| **3. Baza dowodowa** | Fakty, liczby, przykłady, źródła. | "Skąd to wiesz?" |

**Zakazy na poziomie 1:**
- zdań rozgrzewkowych ("Poniżej przedstawiam analizę...", "Warto zacząć od...");
- odkładania tezy na koniec ("...w związku z powyższym rekomenduję");
- streszczania procesu zamiast wyniku ("Przeanalizowano trzy warianty").

**Niepewność:** jeśli nie ma pewnej odpowiedzi, poziom 1 zawiera **główną hipotezę**
plus jawne oznaczenie stopnia pewności. Brak tezy jest gorszy niż teza opatrzona zastrzeżeniem.

---

## 3. Logika pozioma (rygor MECE)

Walidacja argumentów stojących obok siebie na tym samym poziomie.

| Reguła | Dyrektywa | Typowy błąd |
|---|---|---|
| **Mutually Exclusive** (rozłączne) | Kategorie nie mogą się nakładać ani dublować znaczeniowo. | Osobne punkty "Wzrost przychodów" i "Zwiększenie sprzedaży". |
| **Collectively Exhaustive** (wyczerpujące) | Zbiór wariantów sumuje się do 100% możliwości problemu. | Same warianty oczywiste, bez scenariusza skrajnego i bez kosztu alternatywnego. |

**Procedura:** jeśli podział nie przechodzi testu MECE - przebuduj go **zanim** wygenerujesz tekst.
Nie łataj listy przypisami.

**Porządek wewnątrz grupy** - jeden z czterech, wybrany świadomie:
czasowy (kroki), strukturalny (części całości), ważności (od największego)
lub dedukcyjny (przesłanka A → przesłanka B → wniosek).

**Dedukcja vs indukcja:** w wywodzie dedukcyjnym prowadź linię prostą (A → B → wniosek).
W indukcyjnym grupuj podobne idee i nadaj grupie **wspólny mianownik będący pojęciem wyższego rzędu** -
ten mianownik staje się nagłówkiem.

---

## 4. Nagłówki i zdania kluczowe

Nagłówek niesie tezę, nie etykietę tematu.

| Zamiast | Napisz |
|---|---|
| "Analiza marży" | "Marża spadła w trzech krajach, w każdym z innego powodu" |
| "Wnioski" | "Rekomendujemy wariant B - jest tańszy i szybszy do wdrożenia" |
| "Kolejne kroki" | "Decyzja do 15.10, start wdrożenia w listopadzie" |

Test: **czy z samych nagłówków da się przeczytać cały wywód?** Jeśli tak - piramida stoi.

---

## 5. Zastosowanie w formatach

### 5.1 E-mail
- Temat = wniosek lub decyzja do podjęcia, nie kategoria sprawy.
- Pierwsze zdanie = odpowiedź. Drugie = co jest potrzebne od odbiorcy i do kiedy.
- Dalej 3-5 punktów uzasadnienia, każdy jednym zdaniem.
- Szczegóły i dane w załączniku lub na końcu, pod wyraźnym nagłówkiem.
- Długość: mail czytany na telefonie ma mieścić tezę i prośbę na jednym ekranie.

### 5.2 Prezentacja
- Slajd 1: SCQA sprowadzone do tytułu i tezy.
- Slajd 2: linia argumentacyjna - 3-5 punktów, MECE. To jest spis treści reszty.
- Każdy kolejny slajd rozwija dokładnie jeden punkt z linii argumentacyjnej.
- Tytuł slajdu = zdanie twierdzące (teza slajdu), nie hasło.
- Materiał dowodowy poza główną narracją idzie do aneksu.

### 5.3 Wypowiedź ustna (spotkanie, telefon, stand-up)
- Zacznij od zdania: wniosek + czego potrzebujesz.
- Zapowiedz liczbę argumentów ("z trzech powodów"), potem je wylicz.
- Szczegóły podawaj dopiero na pytanie - poziom 3 trzymaj w rezerwie.

### 5.4 Notatka lub dokument
- Streszczenie zarządcze = poziomy 1 i 2, maksymalnie pół strony.
- Reszta dokumentu = poziom 3 w kolejności linii argumentacyjnej.
- Spis treści zbudowany z nagłówków-tez, nie z etykiet.

---

## 6. Dyrektywy operacyjne (do wklejenia w system prompt)

1. Zawsze zaczynaj od najważniejszej konkluzji. Żadnych zdań wprowadzających.
2. Jeśli nie masz pewnej odpowiedzi, podaj główną hipotezę i natychmiast oznacz stopień niepewności.
3. Każda lista argumentów lub opcji musi przejść test MECE. Podział nierozłączny lub niewyczerpujący przebuduj przed wygenerowaniem odpowiedzi.
4. Ogranicz linię argumentacyjną do 3-5 pozycji. Więcej znaczy, że brakuje poziomu pośredniego.
5. Nagłówki formułuj jako zdania twierdzące niosące tezę.
6. Dowody trzymaj na poziomie 3 - nie mieszaj ich z argumentami.
7. W wywodzie dedukcyjnym prowadź linię prostą; w indukcyjnym grupuj i nazwij wspólny mianownik.
8. Nie streszczaj procesu dochodzenia do wniosku, jeśli odbiorca prosił o wniosek.

---

## 7. Checklista przed oddaniem materiału

- [ ] Pierwsze zdanie zawiera tezę, nie zapowiedź.
- [ ] Teza odpowiada na pytanie (Q), które faktycznie stawia odbiorca.
- [ ] Linia argumentacyjna ma 3-5 pozycji.
- [ ] Pozycje nie nakładają się znaczeniowo (ME).
- [ ] Pozycje wyczerpują problem, łącznie z wariantem skrajnym i kosztem alternatywnym (CE).
- [ ] Z samych nagłówków da się odtworzyć wywód.
- [ ] Każdy argument ma pod sobą dowód, a nie kolejny argument.
- [ ] Niepewność jest oznaczona tam, gdzie występuje.

---

## 8. Antywzorce

| Objaw | Poprawka |
|---|---|
| Materiał kończy się rekomendacją | Przenieś rekomendację na początek, resztę przebuduj jako uzasadnienie |
| 8 punktów na jednym poziomie | Zgrupuj w 3-4 kategorie i nazwij je pojęciem wyższego rzędu |
| Punkty "Sprzedaż" i "Przychody" obok siebie | Scal lub przetnij inaczej - naruszenie ME |
| Same warianty wygodne, brak wariantu "nie robimy nic" | Dopisz scenariusz zerowy i koszt alternatywny - naruszenie CE |
| Nagłówki typu "Wprowadzenie", "Analiza", "Podsumowanie" | Zamień na zdania niosące tezę |
| Argument uzasadniony innym argumentem | Zejdź do poziomu 3: liczba, fakt, źródło |
| Teza schowana w zdaniu warunkowym | Napisz ją twierdząco i osobno oznacz zastrzeżenia |

---

## 9. Powiązania w tym workspace

- `CONTEXT.md` - reguła routingu decyzyjnego: **propozycje jednowariantowe nie są przyjmowane**,
  minimum dwa warianty z analizą wpływu. To praktyczne zastosowanie reguły CE.
- `_context/99_source_paper_VanClief_2026_EN.md` - metoda organizacji kontekstu (MWP/ICM).
  Minto porządkuje **treść** komunikatu, MWP porządkuje **pliki i etapy** pracy. Warstwy są niezależne.

---
---

# PART II - ENGLISH

## EN 0. The governing rule

**Conclusion first, justification second. Arguments sitting at the same level must be mutually exclusive and collectively exhaustive.**

If only one sentence survives from this file, it is that one.

---

## EN 1. The opening: SCQA (establishing common ground)

How every longer piece begins. Four steps, each of them short.

| Element | What it is | Validity test |
|---|---|---|
| **S - Situation** | An undisputed fact or state the reader already knows. No judgements. | The reader nods: "yes, I know". |
| **C - Complication** | A change or tension that disturbs the situation and forces action. | The reader thinks: "true, that is a problem". |
| **Q - Question** | The question the reader now needs answered. | It can be written as a single interrogative sentence. |
| **A - Answer** | The governing thought. The top of the pyramid. | It answers Q directly, rather than announcing an answer. |

**Proportions:** S and C together take at most 3-4 sentences. Q is often left implicit.
A follows immediately after them - never at the end.

---

## EN 2. Vertical logic (the top-down mechanism)

Each lower level answers the question raised by the level above it.

| Level | Content | Reader question it answers |
|---|---|---|
| **1. Governing conclusion** | One sentence: the recommendation or the answer. | (none - this is the answer) |
| **2. Line of argument** | 3-5 claims supporting level 1. | "Why do you say that?" / "How do we do it?" |
| **3. Evidence base** | Facts, figures, examples, sources. | "How do you know?" |

**Forbidden at level 1:**
- warm-up sentences ("Below is an analysis of...", "It is worth starting with...");
- deferring the thesis to the end ("...therefore I recommend");
- summarising the process instead of the result ("Three options were analysed").

**Uncertainty:** where no confident answer exists, level 1 carries the **leading hypothesis**
plus an explicit confidence flag. No thesis is worse than a thesis carrying a caveat.

---

## EN 3. Horizontal logic (the MECE discipline)

Validation of arguments standing side by side at the same level.

| Rule | Directive | Typical failure |
|---|---|---|
| **Mutually Exclusive** | Categories must not overlap or duplicate each other semantically. | Separate bullets for "Revenue growth" and "Increased sales". |
| **Collectively Exhaustive** | The set of options must add up to 100% of the problem space. | Only the obvious options, with no edge case and no opportunity cost. |

**Procedure:** if a breakdown fails the MECE test, rebuild it **before** generating any text.
Do not patch the list with footnotes.

**Ordering within a group** - pick one deliberately: time (steps), structure (parts of a whole),
importance (largest first), or deduction (premise A → premise B → conclusion).

**Deduction vs induction:** in a deductive argument run a straight line (A → B → conclusion).
In an inductive one, group similar ideas and give the group a **common denominator that is a
higher-order concept** - that denominator becomes the heading.

---

## EN 4. Headings and key sentences

A heading carries a claim, not a topic label.

| Instead of | Write |
|---|---|
| "Margin analysis" | "Margin fell in three countries, each for a different reason" |
| "Conclusions" | "We recommend option B - cheaper and faster to deploy" |
| "Next steps" | "Decision by 15 Oct, rollout starts in November" |

Test: **can the whole argument be read from the headings alone?** If yes, the pyramid stands.

---

## EN 5. Applying it by format

### EN 5.1 Email
- Subject line = the conclusion or the decision needed, not the category of the matter.
- First sentence = the answer. Second = what you need from the reader, and by when.
- Then 3-5 supporting points, one sentence each.
- Detail and data go into an attachment or to the end, under a clear heading.
- Length: read on a phone, the thesis and the ask must fit on one screen.

### EN 5.2 Presentation
- Slide 1: SCQA compressed into the title and the governing thought.
- Slide 2: the line of argument - 3-5 MECE points. This is the table of contents for the rest.
- Every following slide develops exactly one point from that line.
- Slide title = a declarative sentence (the slide's claim), not a label.
- Evidence outside the main narrative goes to the appendix.

### EN 5.3 Spoken delivery (meeting, call, stand-up)
- Open with one sentence: the conclusion plus what you need.
- Announce the number of reasons ("for three reasons"), then list them.
- Give detail only when asked - keep level 3 in reserve.

### EN 5.4 Memo or document
- Executive summary = levels 1 and 2, half a page at most.
- The body = level 3, in the order of the line of argument.
- The table of contents is built from claim-bearing headings, not labels.

---

## EN 6. Operational directives (to paste into a system prompt)

1. Always open with the most important conclusion. No introductory sentences.
2. Where you are not certain, state the leading hypothesis and flag the degree of uncertainty immediately.
3. Every list of arguments or options must pass the MECE test. Rebuild any overlapping or incomplete breakdown before generating the answer.
4. Keep the line of argument to 3-5 items. More means an intermediate level is missing.
5. Phrase headings as declarative sentences carrying a claim.
6. Keep evidence at level 3 - do not mix it into the arguments.
7. In deductive reasoning run a straight line; in inductive reasoning group and name the common denominator.
8. Do not narrate how you reached the conclusion when the reader asked for the conclusion.

---

## EN 7. Pre-delivery checklist

- [ ] The first sentence states the thesis, not an announcement of it.
- [ ] The thesis answers the question (Q) the reader is actually asking.
- [ ] The line of argument has 3-5 items.
- [ ] The items do not overlap semantically (ME).
- [ ] The items exhaust the problem, edge case and opportunity cost included (CE).
- [ ] The argument can be reconstructed from the headings alone.
- [ ] Every argument sits on evidence, not on another argument.
- [ ] Uncertainty is flagged wherever it exists.

---

## EN 8. Anti-patterns

| Symptom | Fix |
|---|---|
| The piece ends with the recommendation | Move the recommendation to the top, rebuild the rest as justification |
| 8 bullets at one level | Group them into 3-4 categories named by a higher-order concept |
| "Sales" and "Revenue" as sibling bullets | Merge them or cut the problem differently - an ME violation |
| Only convenient options, no "do nothing" | Add the zero scenario and the opportunity cost - a CE violation |
| Headings like "Introduction", "Analysis", "Summary" | Replace with claim-bearing sentences |
| An argument supported by another argument | Drop to level 3: a number, a fact, a source |
| The thesis buried in a conditional clause | State it affirmatively and flag the caveats separately |

---

## EN 9. Related material in this workspace

- `CONTEXT.md` - the decision routing rule: **single-option proposals are not accepted**,
  a minimum of two options with impact analysis. That is the CE rule applied in practice.
- `_context/99_source_paper_VanClief_2026_EN.md` - the context-organisation method (MWP/ICM).
  Minto orders the **content** of a message; MWP orders the **files and stages** of the work.
  The two layers are independent.

---

**Last updated:** 2026-09-07
**Metoda / Method:** Piramida Minto (Barbara Minto). Stosujemy, nie jesteśmy autorem. We apply it; we are not its author.
