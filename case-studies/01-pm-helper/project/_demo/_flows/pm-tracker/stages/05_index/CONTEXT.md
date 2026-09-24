# Etap 05 — Index

**Warstwa L2 — kontrakt etapu. Wykonawca: skrypt.**

---

## Inputs

| Warstwa | Plik | Po co |
|---|---|---|
| L4 | `../04_relate/output/related.json`, `thread_map.json`, `link_proposals.json` | zdarzenia, wątki i propozycje powiązań |
| L4 | `../03_validate/output/messages.json` | wiadomości tego przebiegu |
| L4 | `../../../../_kb/*.jsonl` | baza dotychczasowa |
| L3 | `../../../../_config/tags.json`, `pm_settings.json` | tagi, próg zaległości |

## Process

Upsert po `entry_id` do `_kb/events.jsonl`, po `doc_key` do `_kb/documents.jsonl` i po
`message_key` do `_kb/messages.jsonl` (przez `_scripts/io_jsonl.py`) — **nigdy zwykły append**.
Wiadomość cytowana w kilku plikach to jeden wiersz z listą `seen_in`; jej głównym źródłem jest plik,
w którym jest najwyższa (nie tylko cytowana). Zdarzenia sprzed wprowadzenia wiadomości dostają
`message_key` przez odnalezienie dowodu w tekście pliku (tryb `--backfill`).

Propozycje powiązań wątków wchodzą do `_kb/thread_links.jsonl` ze statusem `suggested`; decyzja PM
(`confirmed` / `rejected`) nigdy nie jest nadpisywana. `_kb/threads.jsonl` jest pochodną liczoną od
nowa przy każdym przebiegu: stany odpowiedzi wiadomości i wątków, tagi, zatwierdzone powiązania.
Numery wątków we wszystkich zdarzeniach, dokumentach i wiadomościach zgadzają się z grafem z etapu 04.

Zapisz treść źródłową dosłownie do `_kb/md/{doc_key}.md`, z kotwicami `msg-N` dla każdej wiadomości
i `entry_id` dla każdego zdarzenia (to jest `raw_ref` z etapu `validate`).

## Outputs

Zaktualizowane `_kb/events.jsonl`, `documents.jsonl`, `messages.jsonl`, `thread_links.jsonl`,
przeliczone `threads.jsonl`, pliki w `_kb/md/`.

## Verify

Liczba wierszy w `_kb/events.jsonl` po przebiegu = liczba sprzed przebiegu + liczba nowych wpisów
(upsert po `entry_id` nie mnoży wierszy przy ponownym uruchomieniu na tym samym dokumencie).
`python ../../../../_scripts/check_kb.py` nie zgłasza błędów.

---

**Skrypt:** `run.py` w tym folderze.
