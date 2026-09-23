# Etap 02 — Approve

**Warstwa L2 — kontrakt etapu. Wykonawca: Project Manager (PM), skrypt tylko zapisuje decyzję.**

---

## Inputs

| Warstwa | Plik | Po co |
|---|---|---|
| L4 | `../01_propose/output/proposals.jsonl` | propozycje kontekstu do oceny |

## Process

1. Skrypt renderuje propozycje do jednego czytelnego pliku,
   `_config/context_proposals/candidate_context.md` — lista pozycji z kategorią, treścią,
   cytatem źródłowym i polem decyzji do wypełnienia (`approved` / `rejected` / `edited` + w razie
   `edited` poprawiona treść).
2. **PM otwiera ten plik i wypełnia decyzję przy każdej pozycji, ręcznie.** Brak decyzji = brak
   wejścia do kontekstu, nigdy domyślne zatwierdzenie.
3. PM uruchamia skrypt zatwierdzający, który czyta wypełnione decyzje.

## Outputs

- `_config/project_context.md` — aktualizacja: dopisanie zatwierdzonych i poprawionych pozycji
  (nigdy nadpisanie całego pliku od zera, żeby nie zgubić wcześniej zatwierdzonego kontekstu
  z poprzednich przebiegów).
- `_config/context_proposals/{data}_decisions.jsonl` — archiwum wszystkich decyzji tego
  przebiegu, łącznie z odrzuconymi — dowód, że nic nie zniknęło po cichu.

## Bramka — zatrzymanie

Pozycja bez jawnej decyzji PM w `candidate_context.md` **nie** trafia do `project_context.md`.
To jest twarde wymaganie z rozmowy z właścicielem programu: żadna propozycja modelu nie wchodzi
w życie sama, niezależnie od tego, jak oczywista się wydaje.

---

**Skrypty:** `render.py` (krok 1), `commit.py` (krok 3) w tym folderze.
