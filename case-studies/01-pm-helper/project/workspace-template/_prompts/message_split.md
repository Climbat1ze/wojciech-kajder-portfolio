# Prompt — rozbicie pliku na wiadomości

**Warstwa L3 — treść promptu dla etapu `pm-tracker` / `02_read`, część pierwsza (przed ekstrakcją zdarzeń).**

---

Plik e-mail zwykle zawiera cały łańcuch: na górze najnowsza wiadomość, niżej cytowane starsze
(mail, odpowiedź, mail, odpowiedź). Czytasz ponumerowany tekst jednego dokumentu i rozdzielasz go
na pojedyncze wiadomości. **Nie wycinaj treści** — wskazujesz tylko numery linii.

Dla każdej wiadomości podaj (numeracja `n` od 1, w kolejności występowania w pliku, czyli
1 = najnowsza):

- **kind** — `original` (pierwsza wiadomość rozmowy), `reply`, `forward`. Dokument Word/prezentacja
  to jedna wiadomość rodzaju `file` (robi to skrypt, nie ty).
- **from**, **to**, **sent_at** — nadawca, odbiorcy (tekstem) i data wysłania (`RRRR-MM-DD GG:MM`;
  dopisz strefę, jeśli źródło ją podaje, np. „(GMT+2)”). Najwyższa wiadomość pliku nie ma
  nagłówka w tekście — jej nadawcę, odbiorców, temat i datę weźmie skrypt z metadanych; wpisz
  wtedy `"metadata"`. Dla pozostałych czytaj nagłówek („From: / Sent: / To:”, „Original Message”,
  „Od: / Wysłano:” i podobne, także w innych językach).
- **lines** — `start` i `end`: od linii nagłówka wiadomości do ostatniej linii jej treści
  (przed nagłówkiem następnej). **body_from** — pierwsza linia treści, już po nagłówku.
- **expects_reply** — `yes`, gdy wiadomość zawiera pytanie, prośbę, polecenie albo termin, który
  wymaga odpowiedzi od kogoś; `no`, gdy tylko informuje, dziękuje albo potwierdza; `unclear`,
  gdy nie da się rozstrzygnąć. **awaiting** — od kogo (imię i nazwisko z wiadomości) oczekuje
  odpowiedzi, gdy `expects_reply = yes`, w przeciwnym razie `—`.
- **closes_thread** — `true` tylko wtedy, gdy wiadomość wyraźnie kończy rozmowę (potwierdza
  ustalenie i nic już nie zostaje do zrobienia). Samo „dziękuję” po pytaniu bez odpowiedzi
  rozmowy nie kończy.

Zasady:

1. Każda wiadomość łańcucha jest osobnym wpisem, także gdy powtarza się w innym pliku —
   duplikaty łączy skrypt po treści.
2. Zakresy nie zachodzą na siebie i idą rosnąco. Linie poza wiadomościami (stopki, ostrzeżenia
   prawne) mogą zostać poza zakresem.
3. Skrót, którego nie rozumiesz, zostaw tak, jak jest w źródle. Nie zgaduj nadawcy ani daty;
   gdy nagłówek ich nie zawiera, wpisz `—`.
4. Wiadomość przesłana dalej (`forward`) jest jedną wiadomością razem z dopiskiem przekazującego;
   zawartość przesłana dalej to osobne, starsze wiadomości poniżej.
