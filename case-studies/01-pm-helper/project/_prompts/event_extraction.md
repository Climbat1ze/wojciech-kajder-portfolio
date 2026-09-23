# Prompt — ekstrakcja zdarzeń

**Warstwa L3 — treść promptu dla etapu `pm-tracker` / `02_read`.**

---

Czytasz ponumerowany tekst jednego dokumentu (korespondencji, notatki). Masz też zatwierdzony
kontekst projektu (`_config/project_context.md`) — ludzi, klientów, słownik pojęć. Twoje
zadanie: wypisać zdarzenia, które ten dokument opisuje.

Dla każdego zdarzenia wypisz:

- **type** — jeden z ośmiu typów z `_context/10_event_types_relations.md`.
- **pmbok_area** — jeden z ośmiu obszarów z `_context/20_pmbok_areas.md`, ten, którego
  zdarzenie dotyczy **najbardziej bezpośrednio**.
- **title** — do 120 znaków, własnymi słowami, po polsku.
- **evidence_lines** — numery linii źródła (`start`, `end`) dokładnie obejmujące fragment,
  który jest dowodem tego zdarzenia. **Nie przepisuj treści** — sam fragment wytnie skrypt w
  etapie `validate`.
- **owner**, **due** — tylko jeśli tekst wprost je podaje.
- **importance** — `critical` / `high` / `normal`, wg kanonu. `critical` oszczędnie.
- **status** — tylko dla typów, które go mają (`decision`, `action`, `risk`, `issue`).

Zasady:

1. Jeden akapit może opisywać kilka zdarzeń — rozdziel je, nie łącz w jedno zbiorcze.
2. Sekcja dokumentu, która wygląda na treściwą, ale nie dała żadnego zdarzenia — to sygnał
   błędu w czytaniu, nie „spokojny fragment”. Wróć i sprawdź jeszcze raz.
3. Jeśli zdarzenie nie pasuje wyraźnie do żadnego z ośmiu obszarów PMBOK 7, zostaw
   `pmbok_area` puste i zaznacz to w uwagach — nie przypisuj na siłę do najbliższego z brzegu.
4. Nazwy osób i klientów dopasowuj do kontekstu projektu (`project_context.md`), jeśli to ta
   sama osoba/klient pod innym zapisem — chyba że kontekst nie wspomina takiej osoby w ogóle.
5. **Najpierw rozbij plik na wiadomości** wg `_prompts/message_split.md`; zdarzenia wypisuj
   dopiero potem. Każde zdarzenie bierz z wiadomości, w której faktycznie leży jego dowód;
   nie wypisuj drugi raz zdarzenia, które opisuje starsza wiadomość zacytowana niżej, jeśli ta
   sama wiadomość jest już w bazie jako osobny plik (sprawdź w streszczeniu poprzednich
   przebiegów). Zdarzenie ma `evidence_lines` mieszczące się w **jednej** wiadomości.
6. `event_date` podaj tylko wtedy, gdy zdarzenie miało miejsce innego dnia niż wysłano wiadomość;
   inaczej skrypt weźmie datę wiadomości, z której pochodzi dowód.

