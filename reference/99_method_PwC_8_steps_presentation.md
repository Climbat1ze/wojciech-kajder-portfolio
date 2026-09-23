# Osiem kroków przygotowania prezentacji (PwC) / The eight-step approach to prepare for a presentation (PwC)

> **Reference material (Layer 3 - "fabryka", stabilne między uruchomieniami).**
> Metoda: **PwC, *The eight-step approach to prepare for a presentation*** oraz *Effective Business
> Presentations in PowerPoint* (materiały szkoleniowe PricewaterhouseCoopers LLP, 2017).
> Ten plik nie jest kopią tych materiałów - to zestaw reguł operacyjnych wyprowadzonych z ośmiu kroków,
> gotowy do wstrzyknięcia w prompt.
>
> **Atrybucja (reguła bezwzględna):** ośmiokrokowe podejście to metoda PwC. My jesteśmy stosującym, nie autorem.
> **Materiały źródłowe PwC nie znajdują się w tym repozytorium** - to materiały szkoleniowe objęte prawami
> autorskimi PwC, a repozytorium i tak wyklucza pliki `*.pdf` (`.gitignore`). Kopie źródłowe trzyma
> właściciel programu poza repo (SharePoint/OneDrive), zgodnie z zasadą z `01_GITHUB_WORKFLOW_GUIDE.md`:
> w Git trzymamy artefakty tekstowe, źródła binarne poza nim.
>
> **Attribution (absolute rule):** the eight-step approach is PwC's method. We apply it, we did not author it.
> **The PwC source materials are not in this repository** - they are copyrighted PwC training materials,
> and the repository excludes `*.pdf` files anyway. Source copies are held by the programme owner outside
> the repo (SharePoint/OneDrive).
>
> **Plik jest dwujęzyczny.** Część polska: sekcje 0-13. Część angielska: sekcje EN 0-13, lustrzane,
> od nagłówka "PART II - ENGLISH". Numer sekcji znaczy to samo w obu językach.
>
> **Jak się powoływać w prompcie / how to invoke:**
> `Przygotuj prezentację na temat X, prowadząc mnie przez osiem kroków PwC z _context/99_method_PwC_8_steps_presentation.md`
> `Prepare a deck on X, following the PwC eight-step approach in _context/99_method_PwC_8_steps_presentation.md`
>
> **Relacja do Minto:** osiem kroków porządkuje **proces przygotowania**, piramida Minto porządkuje
> **treść i logikę** komunikatu. Kroki 3, 4 i 5 wykonuje się regułami Minto - patrz sekcja 13.
>
> **Koszt:** ok. 5 tys. tokenów za cały plik, ok. 2,5 tys. za jedną wersję językową.

---
---

# PART I - POLSKI

## 0. Reguła nadrzędna

**Prezentację projektuje się od odbiorcy i celu, a nie od slajdów. Slajdy powstają jako ostatnie.**

Jeśli z całego pliku ma zostać jedno zdanie - to jest to zdanie.
Krok 1 (odbiorca) jest najczęściej pomijany i jednocześnie najbardziej krytyczny, bo zasila wszystkie pozostałe.

---

## 1. Mapa ośmiu kroków

Kolejność jest obowiązkowa. Wolno wracać do kroków wcześniejszych, nie wolno ich wyprzedzać.

| # | Krok | Pytanie sterujące | Rezultat kroku |
|---|---|---|---|
| 1 | **Odbiorca** (Audience) | Kto siedzi na sali i czego potrzebuje? | Profil odbiorcy: role, oczekiwania, nastawienie |
| 2 | **Cel** (Purpose) | Jaką zmianę zachowania lub postawy chcę wywołać? | Cel w jednym zdaniu |
| 3 | **Struktura** (Structure) | Jak ułożyć myśli, żeby prowadziły do celu? | Outline, a z niego wireframe slajdów |
| 4 | **Otwarcie** (Introduction) | Czym przykuję uwagę i ustawię odbiorcę? | Zaplanowany hook i ustawienie |
| 5 | **Zamknięcie** (Conclusion) | Z czym odbiorca ma wyjść i co ma zrobić? | Podsumowanie + wezwanie do działania |
| 6 | **Materiały wizualne** (Visual aids) | Co wymaga pokazania, a nie opowiedzenia? | Lista wizualizacji przypisanych do tez |
| 7 | **Pytania** (Handling questions) | O co mnie zapytają i co odpowiem? | Antycypowane pytania z odpowiedziami |
| 8 | **Próba** (Practice) | Czy to działa na głos, w czasie, z materiałami? | Przećwiczona prezentacja + poprawki |

Kroki 1-3 to fundament merytoryczny. Kroki 4-5 to klamra narracyjna. Kroki 6-8 to wykonanie i odporność.

---

## 2. Krok 1 - Odbiorca

Zrozumienie odbiorcy pozwala dobrać treść i technikę tak, żeby przykuć uwagę i przekazać tezę.
Ten krok ustawia ramy całej prezentacji.

**Ustal:**

| Wymiar | Co konkretnie ustalić |
|---|---|
| Skład | Kto to jest, ile osób, jakie role i szczeble, jakie organizacje reprezentują |
| Wiedza | Jak dobrze znają temat, jaki jest ich poziom wejścia |
| Potrzeby | Czego oczekują, jakie mają punkty bólu, co dla nich jest korzyścią |
| Nastawienie | Jaki jest ich nastrój wobec tematu i wobec mnie |
| Ograniczenia | Historia tematu, wcześniejsze decyzje, przeszkody, które mogą wpłynąć na odbiór |

**Dobór techniki do nastawienia:**

| Nastawienie odbiorcy | Co robisz |
|---|---|
| Bierny, obojętny | Wzbudzasz poczucie pilności - pokazujesz konsekwencję bezczynności |
| Zaangażowany, chętny | Wykorzystujesz energię - dajesz konkretne zadanie i następny krok |
| Oporny, sceptyczny | Zawężasz do jednej rzeczy, którą da się uzgodnić; zaczynasz od faktów bezspornych |
| Niepewny, zdezorientowany | Upraszczasz, porządkujesz, ograniczasz liczbę wątków |

**Test poprawności:** potrafisz jednym zdaniem powiedzieć, czego ten konkretny odbiorca chce od tego spotkania.

---

## 3. Krok 2 - Cel

Cel to zmiana, nie temat. Tematem jest "migracja EMM"; celem jest "zarząd zatwierdza budżet migracji do 15.10".

**Trzy typy celu - wybierz jeden dominujący:**

| Typ | Kiedy | Konsekwencja dla struktury |
|---|---|---|
| Poinformować | Odbiorca ma wiedzieć | Układ opisowy, nacisk na kompletność i przejrzystość |
| Przekonać / uzyskać decyzję | Odbiorca ma zdecydować | Układ argumentacyjny, warianty, koszt alternatywny |
| Zainspirować / zmobilizować | Odbiorca ma działać | Nacisk na korzyść, emocjonalne uzasadnienie, wezwanie |

**Reguła:** cel zapisujesz jednym zdaniem przed napisaniem czegokolwiek innego i trzymasz go widoczny
przez cały czas pracy. Każdy późniejszy slajd musi dać się przypisać do tego zdania. Jeśli się nie da - slajd wypada.

**Test poprawności:** cel da się sprawdzić po spotkaniu ("czy zatwierdzili?"), a nie tylko odczuć.

---

## 4. Krok 3 - Struktura

Struktura powstaje w dwóch krokach i **oba są przed PowerPointem**: najpierw outline, potem wireframe.

### 4.1 Outline (konspekt)

- Klasyczny konspekt: cyfry rzymskie, litery, podpunkty. Kartka albo dokument tekstowy, nie slajdy.
- Skup się na logicznej sekwencji, nie na wyglądzie.
- Na koniec musisz umieć zapisać: **przesłanie całości w jednym zdaniu** oraz **trzy do czterech
  komunikatów**, które odbiorca ma wynieść.
- Jeśli tego nie potrafisz, konspekt jest niegotowy - nie przechodź dalej.

### 4.2 Wireframe (szkic slajdów)

- Zamień konspekt na sekwencję slajdów: **jedna główna myśl na slajd**.
- Tytuł slajdu zapisz jako zdanie niosące tę myśl (reguła Minto, sekcja 4 tamtego pliku).
- Szkic robisz odręcznie albo prosto na komputerze: prostokąty i podpisy, bez formatowania.
- Wireframe jest iteracyjny. Jeśli pokazuje, że jedna myśl nie mieści się na slajdzie - rozbij na dwa.
- Wireframe to pierwszy etap storyboardingu; dopiero po nim buduje się właściwy deck.

### 4.3 Reguły treści wewnątrz struktury

| Reguła | Uzasadnienie |
|---|---|
| Nie pakuj wszystkiego, co masz | Nadmiar informacji przytłacza i obniża zapamiętywalność |
| Używaj słów, których użyłbyś w rozmowie | Żargon i długie słowa kosztują uwagę, autentyczność ją buduje |
| Mów "my", "wy", "nasze" | Buduje relację z salą, zamiast dystansu bezosobowego |
| Faktami podpieraj tezy, opinii nie podpierasz niczym | Fakty są bezsporne, opinie podważalne |
| Nie zasypuj faktami | Odbiorca zapamięta kilka, nie kilkadziesiąt |
| Używaj anegdot i pytań | Angażują i sprawiają, że przekaz zostaje w pamięci |
| Zaadresuj warstwę emocjonalną | Odbiorca musi wiedzieć, dlaczego ma mu na tym zależeć |
| Nie koloryzuj | Dobre fakty wystarczą; jeden zmyślony niszczy wiarygodność całości |

---

## 5. Krok 4 - Otwarcie

Otwarcie ma przykuć uwagę i przygotować odbiorcę do słuchania. Planuje się je świadomie, nie improwizuje.

**Elementy skutecznego otwarcia:**
1. **Hook** - fakt, pytanie, kontrast lub krótka historia, która zatrzymuje uwagę.
2. **Ustawienie** - po co się spotykamy i co odbiorca z tego będzie miał (cel + korzyść, w skrócie).
3. **Wiarygodność** - dlaczego to ja o tym mówię, jeśli sala mnie nie zna.
4. **Mapa** - co się zaraz wydarzy, ile to potrwa, kiedy będą pytania.

**Reguła:** logistyka (agenda, zasady, przedstawienie się) należy do otwarcia, ale idzie **po** hooku,
nie przed nim. Nie zaczynasz od "dzień dobry, na początek kilka spraw organizacyjnych".

---

## 6. Krok 5 - Zamknięcie

Zamknięcie decyduje o ostatnim wrażeniu tak samo, jak otwarcie o pierwszym. Nie jest slajdem "Dziękuję".

**Skuteczne zamknięcie zawiera:**
- Podsumowanie kluczowych komunikatów i korzyści (te trzy do czterech z kroku 3).
- Wyraźne wezwanie do działania: decyzja, następny krok, termin, właściciel.
- Zarezerwowany czas na pytania - zamknięcie planuje się razem z nimi.

**Techniki zamknięcia (wybierz jedną, nie wszystkie):**
- poproś o decyzję albo rzuć wyzwanie sali,
- podaj fakty i liczby domykające argument,
- opowiedz scenariusz "wyobraźcie sobie, że...",
- podsumuj główne punkty i wskaż działania oraz kolejne kroki,
- przedstaw warianty do wyboru,
- domknij przykładem, który spina całość,
- odpytaj salę, czy przekaz jest zrozumiały, albo poproś o informację zwrotną.

**Tabu zamknięcia:**

| Antywzorzec | Dlaczego szkodzi |
|---|---|
| Zapowiadanie konkluzji ("na zakończenie chciałbym...") | Sala przestaje słuchać w momencie zapowiedzi |
| Wielokrotne kończenie | Rozmywa puentę i wydłuża spotkanie |
| Powtarzanie tego samego innymi słowami | Traktowane jako brak przygotowania |
| Wprowadzanie nowego wątku na końcu | Otwiera dyskusję, której nie zdążysz domknąć |
| Kończenie na pytaniach bez własnego domknięcia | Ostatnie zdanie wypowiada ktoś inny, nie ty |

---

## 7. Krok 6 - Materiały wizualne

Wizualizacja ma **wnosić** zrozumienie, a nie dekorować. Pytanie sterujące: które punkty wymagają
pokazania, żeby stały się jasne, i które kluczowe komunikaty wizualizacja wzmocni.

**Kryteria dobrej pomocy wizualnej:** zrozumiała bez tłumaczenia, dopasowana do sali i warunków,
zintegrowana z tym, co mówisz.

**Zasady użycia:**

| Zasada | Sens |
|---|---|
| Pokazuj dostatecznie długo, ale nie za długo | Za krótko - nikt nie zrozumie; za długo - odciąga uwagę od ciebie |
| Nie mnóż wizualizacji | Im więcej, tym mniejszy wpływ każdej z nich |
| Nie chowaj się za slajdem | Slajd nie jest schronieniem dla prowadzącego |
| Nie mów "przez" slajd | Sala nie czyta i nie słucha jednocześnie |
| Nie czytaj slajdu na głos | Czytanie na głos jest odbierane jako brak przygotowania |

---

## 8. Krok 7 - Pytania

Sposób obsługi pytań wpływa nie tylko na pytającego, ale na gotowość całej sali do dalszego udziału.

**Przygotowanie:**
- Wypisz pytania, które padną. Osobno wypisz te, których się obawiasz.
- Do każdego przygotuj odpowiedź: krótką, konkretną, w języku odbiorcy.
- Przygotuj materiał zapasowy (aneks, dane źródłowe) na pytania o szczegóły.

**W trakcie:**
- Odpowiadaj prosto, zwięźle i na temat pytania, a nie na temat, który znasz lepiej.
- Pokaż aktywne słuchanie: dopytaj, sparafrazuj, potwierdź, że dobrze zrozumiałeś.
- Gdy nie znasz odpowiedzi, powiedz to wprost i umów się na termin dostarczenia jej.

**Reguła:** "nie wiem, sprawdzę i odezwę się do piątku" buduje wiarygodność. Improwizowana odpowiedź ją niszczy.

---

## 9. Krok 8 - Próba

Próba nie jest luksusem na koniec, tylko krokiem, który wyłapuje błędy niewidoczne na papierze.

- Ćwicz z notatkami i z materiałami wizualnymi, w warunkach zbliżonych do docelowych.
- Mierz czas. Prezentacja, która nie mieści się w slocie, jest niegotowa.
- Zbierz informację zwrotną jednym z trzech sposobów: poproś zaufaną osobę o obejrzenie,
  przećwicz przed lustrem, nagraj się i odsłuchaj.
- Nagranie jest najskuteczniejsze, bo pokazuje tempo, przerywniki i to, czy tezy wybrzmiewają.

**Reguła:** po próbie wracasz do kroków 3-6 i poprawiasz. Próba bez poprawki jest stratą czasu.

---

## 10. Dyrektywy operacyjne (do wklejenia w system prompt)

1. Nie generuj slajdów, dopóki nie ma zapisanego profilu odbiorcy (krok 1) i celu w jednym zdaniu (krok 2).
2. Zawsze pytaj o odbiorcę i cel, jeśli nie zostały podane. Nie zgaduj ich.
3. Najpierw zwróć konspekt tekstowy, potem wireframe (jedna myśl na slajd), dopiero na końcu treść slajdów.
4. Ogranicz komunikaty do wyniesienia do trzech, maksymalnie czterech.
5. Tytuł każdego slajdu formułuj jako zdanie niosące tezę, nie etykietę tematu.
6. Otwarcie i zamknięcie projektuj jawnie, jako osobne elementy, nigdy jako slajd "Agenda" i "Dziękuję".
7. Do każdej pomocy wizualnej podaj, którą tezę wzmacnia. Jeśli nie wzmacnia żadnej - usuń ją.
8. Do każdej prezentacji dołącz listę antycypowanych pytań z proponowanymi odpowiedziami.
9. Podaj szacowany czas wystąpienia i zaznacz, gdzie ciąć, jeśli slot się skróci.
10. Nie dopisuj faktów ani liczb, których nie ma w materiale źródłowym. Brak danych oznacz wprost.

---

## 11. Checklista przed oddaniem materiału

- [ ] Profil odbiorcy jest zapisany, nie założony w głowie.
- [ ] Cel jest zapisany jednym zdaniem i da się sprawdzić po spotkaniu.
- [ ] Istnieje konspekt tekstowy, powstały przed slajdami.
- [ ] Przesłanie całości mieści się w jednym zdaniu.
- [ ] Trzy do czterech komunikatów do wyniesienia są nazwane wprost.
- [ ] Każdy slajd niesie dokładnie jedną główną myśl.
- [ ] Tytuły slajdów są zdaniami niosącymi tezę.
- [ ] Otwarcie ma hook, a nie tylko agendę.
- [ ] Zamknięcie ma wezwanie do działania z terminem i właścicielem.
- [ ] Każda wizualizacja jest przypisana do konkretnej tezy.
- [ ] Lista antycypowanych pytań istnieje i ma odpowiedzi.
- [ ] Prezentacja została przećwiczona na głos i zmieszczona w czasie.
- [ ] Prezentacja dla sponsorów lub decydentów, prowadzona przez członka zespołu RTAM, ma akceptację jego Part Leadera (reguła programu od 2026-09-15, `_context/2026-04-22_RTAM_governance.md`).
- [ ] Po spotkaniu notatka poszła do uczestników, a do Part Leadera także wtedy, gdy nie był na spotkaniu.

---

## 12. Antywzorce

| Objaw | Poprawka |
|---|---|
| Praca zaczyna się od otwarcia PowerPointa | Zamknij PowerPointa, zrób kroki 1-3 na tekście |
| "Prezentacja o projekcie X" zamiast celu | Zapisz, jaką zmianę zachowania chcesz wywołać |
| Nieznany odbiorca ("to dla zarządu, chyba") | Ustal skład, wiedzę i nastawienie przed treścią |
| Slajd z pięcioma myślami | Rozbij na pięć slajdów albo wytnij cztery myśli |
| Tytuły typu "Wprowadzenie", "Analiza", "Podsumowanie" | Zamień na zdania niosące tezę |
| Wszystko, co wiemy, upchnięte w deck | Wytnij do trzech komunikatów, resztę do aneksu |
| Wykres, bo "trzeba mieć wykres" | Usuń albo przypisz do konkretnej tezy |
| Czytanie slajdów na głos | Skróć slajd, przenieś treść do wypowiedzi |
| Zamknięcie slajdem "Dziękuję" | Zastąp podsumowaniem i wezwaniem do działania |
| Pytania obsługiwane improwizacją | Przygotuj listę pytań z odpowiedziami przed spotkaniem |
| Pierwsze wykonanie na żywo przed salą | Przećwicz, najlepiej z nagraniem |

---

## 13. Powiązania w tym workspace

- `_context/99_method_Minto_Pyramid.md` - piramida Minto porządkuje **treść i logikę**: SCQA w otwarciu (krok 4),
  MECE w linii argumentacyjnej (krok 3), nagłówki-tezy na slajdach (krok 3), wniosek na początku i w zamknięciu (krok 5).
  Osiem kroków PwC porządkuje **proces**: od odbiorcy do próby. Warstwy się uzupełniają, nie zastępują.
- `CONTEXT.md` - reguła routingu decyzyjnego: **propozycje jednowariantowe nie są przyjmowane**.
  W prezentacji decyzyjnej (krok 2, typ "przekonać") oznacza to obowiązek pokazania wariantów w zamknięciu.
- `_context/2026-04-22_RTAM_governance.md`, sekcja „Prezentacje dla sponsorów i decydentów” - reguła programu
  od 2026-09-15: akceptacja Part Leadera jako minimum, pięć punktów przygotowania, notatka po spotkaniu.
- `_context/99_source_paper_VanClief_2026_EN.md` - metoda organizacji kontekstu (MWP/ICM),
  czyli porządek **plików i etapów pracy**. Niezależna od obu powyższych.

---
---

# PART II - ENGLISH

## EN 0. The governing rule

**A presentation is designed from the audience and the purpose, never from the slides. Slides come last.**

If one sentence is to survive from this file, this is it.
Step 1 (audience) is the most frequently skipped step and the most critical one, because it feeds all the others.

---

## EN 1. Map of the eight steps

The order is binding. You may return to an earlier step; you may not jump ahead of one.

| # | Step | Governing question | Output of the step |
|---|---|---|---|
| 1 | **Audience** | Who is in the room and what do they need? | Audience profile: roles, expectations, attitude |
| 2 | **Purpose** | What change in behaviour or attitude am I after? | Purpose in one sentence |
| 3 | **Structure** | How do I order the ideas so they lead to the purpose? | An outline, then a slide wireframe |
| 4 | **Introduction** | What captures attention and sets them up to listen? | A planned hook and framing |
| 5 | **Conclusion** | What do they leave with and what do they do next? | Summary plus call to action |
| 6 | **Visual aids** | What has to be shown rather than told? | Visuals mapped to specific messages |
| 7 | **Handling questions** | What will they ask and what do I answer? | Anticipated questions with answers |
| 8 | **Practice** | Does it hold out loud, in time, with the materials? | A rehearsed deck plus corrections |

Steps 1-3 are the substantive foundation. Steps 4-5 are the narrative frame. Steps 6-8 are execution and resilience.

---

## EN 2. Step 1 - Audience

Understanding the audience lets you tailor the message and pick the techniques that capture attention
and land the point. This step frames the entire presentation.

**Establish:**

| Dimension | What to pin down |
|---|---|
| Composition | Who they are, how many, what roles and levels, which organisations they represent |
| Knowledge | How well they know the subject, where they start from |
| Needs | What they expect, their pain points, what counts as a benefit for them |
| Attitude | Their mood towards the subject and towards you |
| Constraints | History of the topic, prior decisions, obstacles that may affect reception |

**Matching technique to attitude:**

| Audience attitude | What you do |
|---|---|
| Passive, complacent | Instil urgency - show the cost of doing nothing |
| Engaged, eager | Harness the energy - give a concrete task and a next step |
| Resistant, sceptical | Narrow to the one thing you can agree on; open with indisputable facts |
| Insecure, confused | Simplify, order, reduce the number of threads |

**Correctness test:** you can state in one sentence what this specific audience wants out of this meeting.

---

## EN 3. Step 2 - Purpose

Purpose is a change, not a topic. The topic is "EMM migration"; the purpose is "the board approves the
migration budget by 15 October".

**Three purpose types - pick one dominant:**

| Type | When | Consequence for structure |
|---|---|---|
| Inform | They need to know | Descriptive order, emphasis on completeness and clarity |
| Persuade / obtain a decision | They need to decide | Argumentative order, options, opportunity cost |
| Inspire / mobilise | They need to act | Emphasis on benefit, emotional grounding, a call to action |

**Rule:** write the purpose in one sentence before writing anything else and keep it visible throughout.
Every later slide must map to that sentence. If it cannot, the slide goes.

**Correctness test:** the purpose can be verified after the meeting ("did they approve?"), not merely felt.

---

## EN 4. Step 3 - Structure

Structure is built in two moves, and **both happen before PowerPoint**: outline first, wireframe second.

### EN 4.1 Outline

- Traditional outline format: roman numerals, capital letters, sub-points. Paper or a text document, not slides.
- Focus on the logical sequence, not on looks.
- By the end you must be able to write down the **overall message in one sentence** and the
  **three to four messages** the audience should take away.
- If you cannot, the outline is not finished. Do not move on.

### EN 4.2 Wireframe

- Convert the outline into a slide sequence: **one main point per slide**.
- Write the slide title as a sentence carrying that point (the Minto rule, section EN 4 of that file).
- Sketch it by hand or crudely on a computer: boxes and captions, no formatting.
- Wireframing is iterative. If it reveals that one point needs two slides rather than one, split it.
- The wireframe is the first stage of storyboarding; the deck itself is built only afterwards.

### EN 4.3 Content rules inside the structure

| Rule | Why |
|---|---|
| Do not cover everything you have | Too much information overwhelms and reduces retention |
| Use the words you would use in conversation | Jargon and long words cost attention; authenticity builds it |
| Say "we", "you", "our" | It builds connection instead of impersonal distance |
| Support points with facts, not with opinions | Facts are indisputable, opinions are contestable |
| Do not bury them in facts | The audience will remember a few, not dozens |
| Use anecdotes and questions | They engage and make the message memorable |
| Address the emotional underpinnings | The audience has to know why they should care |
| Do not embellish | Good facts are enough; one invented one destroys the whole |

---

## EN 5. Step 4 - Introduction

The opening captures attention and prepares the audience to hear you. It is planned deliberately, not improvised.

**Elements of an effective introduction:**
1. **Hook** - a fact, question, contrast or short story that stops them.
2. **Framing** - why we are here and what they get out of it (purpose plus benefit, briefly).
3. **Credibility** - why you are the one saying this, if the room does not know you.
4. **Map** - what happens next, how long it takes, when questions are taken.

**Rule:** logistics (agenda, ground rules, introductions) belong to the opening but come **after** the hook,
never before it. Do not start with "good morning, first a few housekeeping items".

---

## EN 6. Step 5 - Conclusion

The close decides the last impression the way the opening decides the first. It is not a "Thank you" slide.

**An effective close contains:**
- A summary of the key messages and benefits (the three to four from step 3).
- An explicit call to action: decision, next step, deadline, owner.
- Time reserved for questions - the close is planned together with them.

**Closing techniques (pick one, not all):**
- ask for a decision or challenge the group,
- present the facts and statistics that settle the argument,
- tell a "just imagine" scenario,
- summarise the major points and indicate actions and next steps,
- present alternatives,
- use an example that ties everything together,
- query the audience on whether the message landed, or ask for feedback.

**Closing taboos:**

| Anti-pattern | Why it hurts |
|---|---|
| Announcing the conclusion ("in closing, I would like to...") | The room stops listening the moment you announce it |
| Ending several times over | It dilutes the point and stretches the meeting |
| Reiterating the same thing in other words | It reads as lack of preparation |
| Introducing a new thread at the end | It opens a discussion you have no time to close |
| Ending on questions with no close of your own | Someone else speaks your last sentence |

---

## EN 7. Step 6 - Visual aids

A visual must **add** understanding, not decorate. Governing question: which points need showing to become
clear, and which key messages a visual would reinforce.

**Criteria for a good visual aid:** easy to understand without explanation, appropriate for the audience and
the venue, integrated with what you say.

**Rules of use:**

| Rule | Meaning |
|---|---|
| Display long enough, but not too long | Too short and nobody follows; too long and it pulls attention off you |
| Do not multiply visuals | The more you use, the less impact each one has |
| Do not use them as a refuge | A slide is not a hiding place for the presenter |
| Do not talk over them | The room cannot read and listen at the same time |
| Do not read them verbatim | Reading a slide aloud reads as lack of preparation |

---

## EN 8. Step 7 - Handling questions

How questions are handled affects not only the person asking but the whole room's willingness to participate.

**Preparation:**
- List the questions that will come. Separately, list the ones you fear.
- Prepare an answer for each: short, concrete, in the audience's language.
- Prepare backup material (appendix, source data) for questions about detail.

**In the room:**
- Answer simply, concisely and to the question asked, not to the question you know better.
- Demonstrate active listening: probe, paraphrase, confirm you understood.
- When you do not know, say so plainly and commit to a date for the answer.

**Rule:** "I don't know, I will check and come back to you by Friday" builds credibility. An improvised answer destroys it.

---

## EN 9. Step 8 - Practice

Rehearsal is not an optional last flourish. It catches the errors that are invisible on paper.

- Rehearse with your notes and your visual aids, in conditions close to the real ones.
- Time it. A presentation that does not fit the slot is not ready.
- Seek feedback one of three ways: ask a trusted colleague or friend to watch, practise in front of a mirror,
  record yourself and play it back.
- Recording works best, because it exposes pace, filler words and whether the messages actually land.

**Rule:** after rehearsing, go back to steps 3-6 and fix what surfaced. A rehearsal without a correction is wasted time.

---

## EN 10. Operational directives (to paste into a system prompt)

1. Do not generate slides until an audience profile (step 1) and a one-sentence purpose (step 2) are written down.
2. Always ask for audience and purpose when they are not given. Do not guess them.
3. Return a text outline first, then a wireframe (one point per slide), and only then slide content.
4. Limit take-away messages to three, at most four.
5. Write every slide title as a sentence carrying the point, not as a topic label.
6. Design the opening and the close explicitly, as distinct elements, never as an "Agenda" and a "Thank you" slide.
7. For every visual, state which message it reinforces. If it reinforces none, drop it.
8. Attach a list of anticipated questions with proposed answers to every deck.
9. State the estimated speaking time and mark what to cut if the slot shrinks.
10. Do not invent facts or figures absent from the source material. Flag missing data explicitly.

---

## EN 11. Pre-delivery checklist

- [ ] The audience profile is written down, not assumed in your head.
- [ ] The purpose is written in one sentence and is verifiable after the meeting.
- [ ] A text outline exists and was produced before the slides.
- [ ] The overall message fits in one sentence.
- [ ] Three to four take-away messages are named explicitly.
- [ ] Every slide carries exactly one main point.
- [ ] Slide titles are sentences carrying the point.
- [ ] The opening has a hook, not just an agenda.
- [ ] The close has a call to action with a deadline and an owner.
- [ ] Every visual is mapped to a specific message.
- [ ] A list of anticipated questions exists, with answers.
- [ ] The presentation has been rehearsed aloud and fits the time slot.
- [ ] A presentation to sponsors or decision-makers led by an RTAM team member is approved by that member's Part Leader (programme rule since 2026-09-15, `_context/2026-04-22_RTAM_governance.md`).
- [ ] After the meeting, a note went to the participants, and to the Part Leader if they did not attend.

---

## EN 12. Anti-patterns

| Symptom | Correction |
|---|---|
| Work starts by opening PowerPoint | Close PowerPoint, do steps 1-3 in text |
| "A presentation about project X" instead of a purpose | Write down the change in behaviour you want |
| Unknown audience ("it's for the board, I think") | Establish composition, knowledge and attitude before content |
| A slide with five points | Split into five slides or cut four points |
| Titles like "Introduction", "Analysis", "Summary" | Replace with sentences carrying the point |
| Everything you know stuffed into the deck | Cut to three messages, move the rest to an appendix |
| A chart because "there should be a chart" | Remove it or map it to a specific message |
| Reading slides aloud | Shorten the slide, move the content into what you say |
| Closing on a "Thank you" slide | Replace with a summary and a call to action |
| Questions handled by improvisation | Prepare a question list with answers beforehand |
| First live run is in front of the room | Rehearse, ideally with a recording |

---

## EN 13. Related material in this workspace

- `_context/99_method_Minto_Pyramid.md` - the Minto pyramid orders **content and logic**: SCQA in the opening
  (step 4), MECE in the argument line (step 3), point-carrying slide titles (step 3), the answer up front and
  in the close (step 5). The PwC eight steps order the **process**: from audience to rehearsal.
  The layers complement each other; neither replaces the other.
- `CONTEXT.md` - the decision routing rule: **single-option proposals are not accepted**. In a decision-oriented
  presentation (step 2, "persuade" type) this means options must appear in the close.
- `_context/2026-04-22_RTAM_governance.md`, section "Presentations to sponsors and decision-makers" - programme
  rule since 2026-09-15: Part Leader approval as a minimum, five preparation points, a note after the meeting.
- `_context/99_source_paper_VanClief_2026_EN.md` - the context organisation method (MWP/ICM), which orders
  **files and work stages**. Independent of both of the above.

---

**Last updated:** 2026-09-15 (checklist and related material: sponsor presentation rule / checklista i powiązania: reguła prezentacji dla sponsorów)
**Source:** PwC training material (2017). Applied, not authored, by RTAM.
