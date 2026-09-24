# Etap 01 — Propose

**Warstwa L2 — kontrakt etapu. Wykonawca: model.**

---

## Inputs

| Warstwa | Plik | Po co |
|---|---|---|
| L4 | `../00_collect/output/documents.json` | dokumenty opisujące projekt, zdekodowane |
| L3 | `_prompts/context_extraction.md` | instrukcja ekstrakcji — treść promptu jest tam, nie tutaj |
| L3 | `../../../../_context/30_row_schema.md` | pola propozycji kontekstu |

Nic więcej. Model nie sięga po żadne dane spoza tych dokumentów.

## Process

Wykonaj prompt z `_prompts/context_extraction.md` na każdym dokumencie. Model **czyta ze
zrozumieniem**, nie zgaduje i nie uzupełnia z ogólnej wiedzy o organizacji klienta czy własnej — tylko to,
co faktycznie jest w tekście.

Dla każdej znalezionej pozycji: kategoria (`person` / `client` / `vocabulary` /
`characteristic`), proponowana treść, cytat źródłowy, dokument źródłowy.

## Outputs

`output/proposals.jsonl` — jedna propozycja na wiersz, pola wg `30_row_schema.md`, sekcja
`_config/context_proposals/*.md`. Każda propozycja ma `status: "proposed"` — nic więcej na tym
etapie.

## Verify

Każda propozycja ma pole `evidence` będące dosłownym fragmentem źródła (nie parafrazą). Osoby i
klienci nie powtarzają się pod różnymi wariantami zapisu bez połączenia w jedną propozycję.

## Dobór modelu

| Kiedy | Model | Dlaczego |
|---|---|---|
| Pierwszy dokument nowego projektu, ustalanie kontraktu | Opus 5 | wychwycenie niejednoznaczności w nieznanym jeszcze materiale |
| Kolejne dokumenty tego samego projektu | Sonnet 5 | kontrakt już ustalony |

---

**Prompt:** `_prompts/context_extraction.md` (L3, edytowalny bez dotykania kodu)
