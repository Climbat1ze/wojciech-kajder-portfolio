# Schemat wiersza bazy JSON Lines

**Warstwa L3 — jedyne źródło prawdy o polach bazy.** Zmiana pola = zmiana tego pliku, potem
`_scripts/io_jsonl.py` i `_scripts/check_canon.py` — w tej kolejności.

---

## `_kb/events.jsonl` — jedno zdarzenie na wiersz

| Pole | Kto wypełnia | Opis |
|---|---|---|
| `entry_id` | skrypt (`validate`) | `{doc_key}-{KOD}-{NN}`, NN = kolejność w dokumencie dla danego kodu typu |
| `doc_key` | skrypt (`prepare`) | identyfikator dokumentu źródłowego |
| `source_type`, `source_file` | skrypt (`prepare`) | skąd pochodzi dokument |
| `event_date` | skrypt / model | data dokumentu; model nadpisuje tylko, gdy zdarzenie miało miejsce innego dnia |
| `author`, `author_email` | skrypt (`prepare`) | nadawca / autor dokumentu; brak = `—`, nigdy „Unknown” |
| `type` | model (`read`) | z kanonu `10_event_types_relations.md` |
| `pmbok_area` | model (`read`) | z kanonu `20_pmbok_areas.md` |
| `title` | model (`read`) | ≤120 znaków, własnymi słowami — **jedyne pole, które model pisze swobodnie** |
| `evidence`, `evidence_sha256`, `raw_ref` | skrypt (`validate`) | dosłowny fragment źródła wycięty po numerach linii wskazanych przez model w etapie `read`; suma kontrolna; kotwica w `_kb/md/` |
| `owner`, `due` | model (`read`) | odpowiedzialny i termin (`RRRR-MM-DD`), tylko gdy tekst je podaje |
| `importance`, `importance_by` | model → PM | waga z kanonu; `llm` albo `pm` |
| `status`, `status_by` | model → PM | status z kanonu; `llm` albo `pm` |
| `relations` | model / skrypt / PM | `[{rel, target, by}]` |
| `thread_id` | skrypt (`relate`) | wątek korespondencji (wiadomość powtórzona w kilku plikach, nagłówek odpowiedzi, znormalizowany temat); numer się nie zmienia, chyba że dwa wątki okażą się jednym (wtedy zostaje niższy) |
| `message_key`, `message_no` | skrypt (`validate`) | wiadomość, w której leży cytat zdarzenia, i jej numer w pliku (1 = najwyższa, czyli najnowsza); brak = zdarzenie sprzed wprowadzenia wiadomości, do uzupełnienia |
| `confirmed` | PM | `true`, gdy PM zatwierdził propozycje modelu dla tego wiersza |
| `rejected` | PM | `true` = PM odrzucił zdarzenie (zostaje w bazie dla audytu, znika z raportu) |
| `issues` | skrypt | uwagi walidacji, nigdy cicho poprawiane |

## `_kb/documents.jsonl` — jeden dokument źródłowy na wiersz

`doc_key, source_type, source_file, content_sha256, doc_date, author, author_email, recipients, subject, summary,
doc_importance (+ _by), doc_relations, thread_id, entry_ids, confirmed, issues`

`content_sha256` — skrypt (`prepare`): suma kontrolna bajtów pliku; po niej, nie po nazwie, poznajemy duplikat
(ten sam mail zapisany przez dwie osoby ma dwie nazwy).

`recipients` — skrypt (`index`), z metadanych „to” dokumentu źródłowego (nagłówek e-maila);
`—` dla dokumentów bez odbiorców (np. `.docx`/`.pptx`). Dodane 2026-09-18, przy budowie
dashboardu — bez tego pola nie da się pokazać „do kogo” bez ponownego czytania plików
źródłowych.

## `_kb/messages.jsonl` — jedna wiadomość na wiersz

Wiadomość cytowana w kilku plikach to **jeden** wiersz. Rozbicie pliku na wiadomości robi model
(etap `read`), skrypt tylko sprawdza zakresy i liczy klucz.

| Pole | Kto wypełnia | Opis |
|---|---|---|
| `message_key` | skrypt (`validate`) | `M-…` z początku treści (bez nagłówka); bardzo krótkie treści dostają w kluczu nadawcę. Plik bez maila (Word, prezentacja): `F-{doc_key}` |
| `kind` | model (`read`) | `original` · `reply` · `forward` · `file` |
| `sender`, `sender_email`, `sender_side` | model / skrypt | nadawca; strona `ours` / `external` / `unknown` z domen w `_config/pm_settings.json` |
| `to` | model (`read`) | odbiorcy, tekstem |
| `sent_at` | model (`read`) | `RRRR-MM-DD GG:MM` (ze strefą, jeśli źródło ją podaje); najwyższa wiadomość pliku bierze datę z metadanych |
| `subject` | skrypt | temat pliku źródłowego |
| `expects_reply` | model (`read`) | `yes` (pytanie, prośba, termin) · `no` (informacja, podziękowanie) · `unclear` |
| `closes_thread` | model (`read`) | `true`, gdy wiadomość kończy rozmowę (potwierdzenie, podziękowanie po ustaleniu) |
| `awaiting` | model (`read`) | od kogo oczekuje odpowiedzi (tekstem), gdy `expects_reply = yes` |
| `primary_doc_key`, `primary_n`, `primary_lines` | skrypt (`index`) | plik będący głównym źródłem (tam, gdzie wiadomość jest najwyższa, a nie tylko cytowana), jej numer w tym pliku i zakres linii |
| `seen_in` | skrypt (`index`) | `[{doc_key, n, lines}]` — wszystkie pliki z tą wiadomością |
| `preview` | skrypt (`index`) | pierwsze ~300 znaków treści |
| `thread_id` | skrypt (`index`) | wątek |
| `replies_to` | skrypt (`index`) | `message_key` wiadomości, na którą ta odpowiada (kolejność łańcucha lub nagłówek), albo `—` |
| `reply_state`, `answered_by` | skrypt (`index`) | `answered` · `no_reply` · `info` i klucz wiadomości, która odpowiedziała |
| `entry_ids` | skrypt (`index`) | zdarzenia z tej wiadomości |

## `_kb/threads.jsonl` — jeden wątek na wiersz (pochodna, przeliczana przy każdym przebiegu)

`thread_id, title, message_keys (chronologicznie), doc_keys, first_at, last_at, participants,
state, awaiting, days_waiting, stale, last_message_key, links (zatwierdzone), tags`

`state`: `awaiting` (ostatnia wiadomość czeka na odpowiedź) · `closed` · `ended` (nic nie czeka) ·
`continued` (ma zatwierdzoną kontynuację w innym wątku) · `unclear`. Liczba dni liczona od
najnowszej wiadomości w danych, nie od dnia uruchomienia.

## `_kb/thread_links.jsonl` — jedno powiązanie wątków na wiersz

`link_id, from_thread, to_thread, kind, confidence, reason, evidence, status, by, decided_at`

`kind`: `continuation` (od ciągu dalszego do wcześniejszego) · `attachment_of` (plik jest załącznikiem
do maila) · `related`. `status`: `suggested` (model) → `confirmed` / `rejected` (PM, `by: pm`).
Odrzucona para nie jest proponowana ponownie.

## `_config/tags.json` — tagi (edytowane ręcznie)

`vocabulary` (tag → jedno zdanie), `threads` (THR-… → tagi), `sources` (nazwa pliku → tagi),
`thread_titles` (THR-… → własny tytuł). Podpowiedzi modelu wchodzą tu dopiero po decyzji PM.

## `_config/context_proposals/*.md` — jedna propozycja kontekstu na pozycję

| Pole | Kto wypełnia | Opis |
|---|---|---|
| `proposal_id` | skrypt (`collect`) | identyfikator propozycji |
| `category` | model (`propose`) | jedna z: `person`, `client`, `vocabulary`, `characteristic` |
| `value` | model (`propose`) | proponowana treść, własnymi słowami tam gdzie to definicja, dosłownie tam gdzie to nazwa |
| `evidence`, `source_ref` | model / skrypt | cytat źródłowy + wskazanie dokumentu |
| `status` | PM (`approve`) | `approved`, `rejected`, `edited` |
| `decided_by`, `decided_at` | PM (`approve`) | kto i kiedy zdecydował |

Tylko wiersze ze `status = approved` (albo `edited`, z treścią po poprawce PM) trafiają do
`_config/project_context.md`.

---

**Wersja:** 1.0 · **Wzorowane na:** schemacie wiersza bazy wiedzy wcześniejszych baz wiedzy programu (ten workspace od nich nie zależy)
i schemacie logu zdarzeń projektu EL (scalone, uogólnione, rozszerzone o `pmbok_area`) ·
**Data:** 2026-09-18
