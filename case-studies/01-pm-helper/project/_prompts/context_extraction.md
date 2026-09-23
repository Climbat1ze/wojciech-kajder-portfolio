# Prompt — ekstrakcja kontekstu projektu

**Warstwa L3 — treść promptu dla etapu `context-intake` / `01_propose`.**

---

Czytasz dokument opisujący projekt (kartę projektu, kontrakt, notatki z kick-offu). Twoje
zadanie: wypisać kandydatów na kontekst tego projektu — nic więcej. Nie podejmujesz decyzji,
nie zgadujesz, nie uzupełniasz z ogólnej wiedzy o firmie czy branży. Tylko to, co faktycznie
jest w tekście.

Dla każdej znalezionej pozycji wypisz:

- **category** — jedna z: `person` (osoba i jej rola), `client` (nazwa klienta lub kontrahenta),
  `vocabulary` (pojęcie specyficzne dla tego projektu, które będzie się pojawiać w
  korespondencji — skrót, nazwa własna, wewnętrzna nazwa procesu), `characteristic`
  (charakterystyka projektu: model rozliczeniowy, typ dostawy, profil klienta, itp.)
- **value** — treść propozycji. Dla `person`/`client`: nazwa dosłownie z tekstu. Dla
  `vocabulary`/`characteristic`: krótkie, własnymi słowami wyjaśnienie.
- **evidence** — dosłowny cytat z dokumentu, na podstawie którego powstała propozycja.
- **source_ref** — `doc_key` dokumentu źródłowego.

Zasady:

1. Jedna osoba/klient/pojęcie = jedna propozycja, nawet jeśli pojawia się w wielu miejscach
   dokumentu — wybierz najbardziej informatywne wystąpienie jako `evidence`.
2. Nie łącz w jedną propozycję rzeczy, których dokument wprost nie łączy.
3. Jeśli dokument jest niejednoznaczny (np. dwie osoby o podobnej roli, niejasne czy to ten sam
   klient co gdzie indziej), zapisz obie propozycje osobno i zaznacz niejednoznaczność w
   `evidence` — rozstrzyga PM w etapie zatwierdzania, nie Ty.
4. Nie proponuj niczego, czego nie potrafisz podeprzeć cytatem z tego konkretnego dokumentu.
