# PM Helper — od czego zacząć

PM Helper czyta korespondencję i dokumenty jednego projektu (maile `.msg`, Word, prezentacje, notatki),
rozbija łańcuchy maili na pojedyncze wiadomości, pokazuje, które czekają na odpowiedź, podpowiada, które
rozmowy są ciągiem dalszym innych, i buduje dashboard z osią czasu dla ośmiu obszarów zarządzania projektem
(PMBOK 7). Model AI czyta i proponuje, skrypty sprawdzają, a decyzje podejmuje kierownik projektu.

W tej paczce jest **sam workspace (puste narzędzie)**. Nie ma w niej żadnych danych żadnego projektu.

## Czego potrzebujesz

- Python 3.10 lub nowszy (sprawdzone na 3.14).
- Asystent AI, który czyta pliki w folderze i uruchamia polecenia (np. Claude Code albo Cline). Kroki
  „czytanie ze zrozumieniem” wykonuje on, według opisów w `_prompts/` i kontraktów etapów.
- Biblioteki do plików wejściowych: `python -m pip install -r requirements.txt`

## Pierwsze kroki

1. Rozpakuj paczkę w dowolnym miejscu i otwórz folder `PM_Helper` w edytorze z asystentem AI.
   Jeden folder = jeden projekt. Dla drugiego projektu rozpakuj paczkę jeszcze raz.
2. Dokumenty **opisujące** projekt (karta projektu, kontrakt, kick-off) wrzuć do `_context_sources/`.
3. Poproś asystenta: „Przeprowadź przepływ `context-intake` według `CLAUDE.md`”. Przeczytasz i zatwierdzisz
   opis projektu (`_config/project_context.md`). Bez tego dalsze kroki nie mają na czym się oprzeć.
4. Uzupełnij `_config/pm_settings.json`: kto jest „naszą stroną” (domeny i nazwiska), po ilu dniach brak
   odpowiedzi jest zaległy, strefa czasowa dat.
5. Bieżące maile i pliki wrzucaj do `_input/originals/` i poproś asystenta: „Przepuść nowe pliki przez
   `pm-tracker` według `_context/40_runbook.md`”. Na końcu dostaniesz `_outputs/dashboard.html`.
6. Plik `_flows/pm-tracker/stages/04_relate/output/pending_review.md` zawiera propozycje powiązań i tagów z
   cytatami. Wpisujesz w nim `yes` albo `no` i zatwierdzasz poleceniem `python review.py --apply`.

## Zasady, które warto znać

- Dane (`_kb`, `_areas`, `_outputs`) powstają w Twoim folderze i zostają w nim. Oryginały (`_input/originals/`)
  nie wchodzą do git — dołączony `.gitignore` już to załatwia, jeśli trzymasz projekt w repozytorium.
- Kolejność uruchamiania, kto co robi (skrypt, model, kierownik projektu) i typowe problemy: `_context/40_runbook.md`.
- Reguły metody, których nie wolno obejść: `_context/00_method.md`.
- Po każdym przebiegu uruchom `python _scripts/check_kb.py` i `python _scripts/check_canon.py` (oba mają
  zakończyć się bez błędów).
- Dashboard jest po angielsku. Pracuje w zwykłej przeglądarce, bez internetu i bez dodatkowych bibliotek.

## Wersja

Paczka zbudowana z folderu `workspace-template` projektu PM Helper (skrypt `_tools/build_package.py`).
Data i wersja: patrz nazwa pliku ZIP oraz `VERSION.txt` w tym folderze.
