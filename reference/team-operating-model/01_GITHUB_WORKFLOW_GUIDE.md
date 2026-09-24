# Fieldcraft Programme — GitHub Workflow Guide

**Version:** 1.1
**Last Updated:** 2026-09-06
**Audience:** All Fieldcraft team members — bilingual EN/PL

---

## 🎯 OVERVIEW / OVERVIEW

This document describes the rules for working with Git/GitHub in the Fieldcraft repository.

Ten dokument opisuje zasady pracy z Git/GitHub w repozytorium Fieldcraft.

### Model: Protected Main Branch

```
main (protected)
  ↑
  └── feature/* branches (per-task/per-project)
```

**Rule:** Direct pushes to `main` are blocked. All changes go through a Pull Request.

**Zasada:** Bezpośrednie push do `main` są zablokowane. Wszystkie zmiany przechodzą przez Pull Request.

---

## 🔧 GITHUB CONFIGURATION — BRANCH PROTECTION / KONFIGURACJA GITHUB — BRANCH PROTECTION

### Step by step (for the Programme Manager) / Krok po kroku (dla Programme Managera)

1. **Open GitHub Repository Settings / Otwórz GitHub Repository Settings**
   ```
   GitHub → Fieldcraft Repository / Repozytorium Fieldcraft → Settings → Branches
   ```

2. **Add a branch protection rule / Dodaj regułę ochrony gałęzi**
   ```
   Click "Add branch protection rule"
   ```

3. **Configure the rule / Skonfiguruj regułę:**

   | Setting | Wartość / Value | Opis / Description |
   |---------|---------|------|
   | **Branch name pattern** | `main` | Protected branch name / Nazwa chronionej gałęzi |
   | **Require a pull request before merging** | ✓ | Requires a PR before merge / Wymaga PR przed merge |
   | **Require approvals** | `1` | Requires at least 1 approval / Wymaga min. 1 aprobaty |
   | **Dismiss stale reviews when pushes are made** | ✓ | Cancels approvals on new changes / Anuluje aprobaty przy nowych zmianach |
   | **Restrict who can push to matching branches** | ✓ | Authorized people only / Tylko uprawnione osoby |
   | **Include administrators** | □ (optional / opcjonalnie) | Whether this also applies to admins / Czy dotyczy też adminów |
   | **Require conversation resolution before merging** | ✓ | Requires discussions to be resolved / Wymaga rozwiązania dyskusji |

4. **Save the rule / Zapisz regułę**
   ```
   Click "Create" or "Save changes" / lub "Save changes"
   ```

---

## 📝 GIT WORKFLOW — STEP BY STEP / GIT WORKFLOW — KROK PO KROKU

### Scenario 1: Small change (docs, a typo) / Scenariusz 1: Mała zmiana (dokumentacja, literówka)

**Time / Czas:** < 15 minutes / minut
**Risk / Ryzyko:** Low / Niskie

```bash
# 1. Make sure main is current / Upewnij się, że masz aktualne main
git checkout main
git pull origin main

# 2. Create a branch, even for a small change / Stwórz branch (nawet dla małej zmiany)
git checkout -b fix/typo-readme

# 3. Make your changes / Wprowadź zmiany
# [edit files in VS Code / edycja plików w VS Code]

# 4. Add and commit / Dodaj i commit
git add .
git commit -m "[DOC] readme: fix typo in quick start section"

# 5. Push and open a PR / Push i PR
git push origin fix/typo-readme
# [open a PR on GitHub / Otwórz PR na GitHub]
```

---

### Scenario 2: Medium change (a new document, a report update) / Scenariusz 2: Średnia zmiana (nowy dokument, aktualizacja raportu)

**Time / Czas:** 15 min – 2 hours / godziny
**Risk / Ryzyko:** Medium / Średnie

```bash
# 1. Update main / Aktualizuj main
git checkout main
git pull origin main

# 2. Create a feature branch / Stwórz feature branch
git checkout -b feat/new-employee-onboarding

# 3. Work on the changes / Pracuj nad zmianami
# [edit files in VS Code / edycja plików w VS Code]

# 4. Commit more often (every 30-60 min) / Commituj częściej (co 30-60 min)
git add .
git commit -m "[DOC] onboarding: add tools section"
git commit -m "[DOC] onboarding: add key documents table"

# 5. Push and open a PR / Push i PR
git push origin feat/new-employee-onboarding
# [open a PR on GitHub with a description of the changes / Otwórz PR na GitHub z opisem zmian]
```

---

### Scenario 3: Large change (a new project, a refactor) / Scenariusz 3: Duża zmiana (nowy projekt, refaktoryzacja)

**Time / Czas:** > 2 hours / godziny, several days / kilka dni
**Risk / Ryzyko:** High / Wysokie

```bash
# 1. Update main / Aktualizuj main
git checkout main
git pull origin main

# 2. Create a feature branch with a descriptive name / Stwórz feature branch z opisową nazwą
git checkout -b feature/vertical-offering-generator

# 3. Work iteratively, commit logical units / Pracuj iteracyjnie, commituj logiczne jednostki
git add _templates/new-project/
git commit -m "[FEAT] templates: add CLAUDE.md template for new projects"

git add _context/02_PROJECT_CREATION_GUIDE.md
git commit -m "[FEAT] docs: add project creation guide"

# 4. Sync with main regularly (avoid conflicts) / Regularnie sync z main (unikaj konfliktów)
git checkout main
git pull origin main
git checkout feature/vertical-offering-generator
git rebase main

# 5. Push and open a detailed PR / Push i PR z szczegółowym opisem
git push origin feature/vertical-offering-generator
# [open a PR with / Otwórz PR z:
#  - the purpose of the change / Celem zmiany
#  - a list of files / Listą plików
#  - the tests you ran / Testami które wykonałeś
#  - any breaking changes / Ewentualnymi breaking changes]
```

---

## 📋 COMMIT MESSAGE CONVENTION / KONWENCJA KOMUNIKATÓW COMMITÓW

### Format

```
[TYPE] scope: description

[Optional body with more context]
```

### Types / Typy

| Type | When to use / Kiedy użyć | Przykład / Example |
|------|------------|----------|
| `[FEAT]` | New functionality / Nowa funkcjonalność | `[FEAT] templates: add project CLAUDE.md template` |
| `[FIX]` | Bug fix / Poprawka błędu | `[FIX] scripts: fix date parsing in convert_kop_xlsx.js` |
| `[DOC]` | Documentation / Dokumentacja | `[DOC] onboarding: add git workflow section` |
| `[REFACTOR]` | Refactor with no functional change / Refaktoryzacja bez zmian funkcjonalnych | `[REFACTOR] management: extract archive logic to separate module` |
| `[CHORE]` | Technical housekeeping / Zadania techniczne | `[CHORE] gitignore: add .xlsx to excluded files` |
| `[TEST]` | Tests / Testy | `[TEST] scripts: add unit tests for nameMap normalization` |
| `[PERF]` | Performance improvement / Poprawa wydajności | `[PERF] convert: optimize xlsx parsing for large files` |

### Scope / Zakres

The scope is the area of the change. Examples:

Scope to obszar zmiany. Przykłady:

| Scope | Opis / Description |
|-------|------|
| `onboarding` | Onboarding documents / Dokumenty onboardingowe |
| `templates` | Project templates / Szablony projektów |
| `scripts` | Scripts in `_scripts/` / Skrypty w `_scripts/` |
| `kop` | Beacon Pipeline related |
| `weekly` | Weekly Reports |
| `monthly` | Monthly Reports |
| `management` | Portfolio management scripts |
| `git` | Git configuration, workflows |

### Examples of correct commit messages / Przykłady poprawnych commit messages

```bash
# Good / Dobrze:
[DOC] onboarding: add new employee onboarding guide
[FEAT] templates: add CLAUDE.md and CONTEXT.md templates for new projects
[FIX] scripts: fix xlsx date conversion in convert_kop_xlsx.js
[CHORE] gitignore: exclude Fieldcraft Weekly Reports from sync
[REFACTOR] management: extract project creation logic to separate module

# Bad / Źle:
update files
added new stuff
fix bug
```

---

## 🔒 SAFEGUARD — BLOCKING FORCED MERGES / BEZPIECZEŃSTWO — BLOKOWANIE WYMUSZONEGO MERGE

### Problem

VS Code with the Git extension can try to merge directly to `main`, bypassing the PR.

VS Code z rozszerzeniem Git może próbować wykonać merge bezpośrednio do `main`, omijając PR.

### Solution / Rozwiązanie

**GitHub Branch Protection** (configured above) blocks / (skonfigurowane powyżej) blokuje:
- ✅ Direct push to `main` / Direct push do `main`
- ✅ Merge without a Pull Request / Merge bez Pull Request
- ✅ Merge without the required number of approvals / Merge bez wymaganej liczby aprobat
- ✅ Merge with unresolved discussions / Merge nierozwiązanych dyskusji

### Additional safeguards in VS Code / Dodatkowe zabezpieczenia w VS Code

1. **Set the default branch to a feature branch / Ustaw domyślny branch na feature:**
   ```json
   // .vscode/settings.json
   {
     "git.defaultBranch": "feature/wip"
   }
   ```

2. **Use the GitHub Pull Requests extension / Używaj GitHub Pull Requests extension:**
   - Install / Zainstaluj: "GitHub Pull Requests & Issues"
   - Forces PR creation through the UI / Wymusza tworzenie PR przez UI

3. **Check your branch before committing / Sprawdzaj branch przed commit:**
   ```bash
   git branch  # Check which branch you're on / Sprawdź na którym branchu jesteś
   ```

---

## 🚫 IGNORED FILES (`.gitignore`) / PLIKI IGNOROWANE (`.gitignore`)

### Current list / Aktualna lista

```gitignore
# OS Files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea/
*.swp
*.swo

# Large files (>10MB)
*.xlsx
*.pptx
*.docx
*.msg
*.pst
*.ost

# Temporary files
_temp/
*.tmp
*.log

# Node modules
node_modules/
package-lock.json

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/

# Fieldcraft Weekly Reports (currently being restructured / aktualnie w trakcie zmian)
_projects/Fieldcraft Weekly Reports/_input/
_projects/Fieldcraft Weekly Reports/_context/Weekly\ reports\ 2026/Weekly\ reports\ msg/

# Build outputs (if applicable / jeśli dotyczy)
dist/
build/
```

### Why do we ignore large files? / Dlaczego ignorujemy duże pliki?

| Typ / Type | Powód / Reason |
|-----|-------|
| `.xlsx` | Often large, binary, hard to diff / Często duże, binarne, trudne do diff |
| `.pptx` | Large files, versioned via SharePoint / Duże pliki, wersjonowanie przez SharePoint |
| `.docx` | Large files, versioned via SharePoint / Duże pliki, wersjonowanie przez SharePoint |
| `.msg` | Source emails — converted to `.md` / Maile źródłowe — konwertowane do `.md` |

**Rule:** In Git we keep **text artifacts** (`.md`, `.html`, `.js`, `.json`). Source data
(`.xlsx`, `.msg`, `.pptx`) lives in SharePoint/OneDrive.

**Zasada:** W Git przechowujemy **tekstowe artefakty** (`.md`, `.html`, `.js`, `.json`). Dane źródłowe (`.xlsx`, `.msg`, `.pptx`) są w SharePoint/OneDrive.

---

## 🔄 TWO-WAY SYNC FLOW / DWUKIERUNKOWY PRZEPŁYW SYNCHRONIZACJI

### Before starting work / Przed rozpoczęciem pracy

```bash
# 1. Switch to main / Przełącz się na main
git checkout main

# 2. Pull the latest changes / Pobierz najnowsze zmiany
git pull origin main

# 3. Create a new branch / Stwórz nowy branch
git checkout -b feature/my-change
```

### While working / Podczas pracy

```bash
# 1. Add changes / Dodaj zmiany
git add .

# 2. Commit with the correct format / Commit z poprawnym formatem
git commit -m "[TYPE] scope: description"

# 3. Sync with main regularly (every 1-2 hours) / Regularny sync z main (co 1-2 godziny)
git checkout main
git pull origin main
git checkout feature/my-change
git rebase main
```

### After finishing work / Po zakończeniu pracy

```bash
# 1. Push the branch / Push brancha
git push origin feature/my-change

# 2. Open a PR on GitHub / Otwórz PR na GitHub
# [GitHub → Pull Requests → New Pull Request]

# 3. Wait for review and merge from the Programme Manager / Poczekaj na review i merge od Programme Managera
```

---

## 📊 PULL REQUEST TEMPLATE / SZABLON PULL REQUEST

### How to open a PR / Jak otworzyć PR

1. **Open GitHub / Otwórz GitHub**
   ```
   https://<your-github-host>/<organization>/<repo>/pulls
   ```
   *(Replace with your repository's actual address — this is a placeholder, not a
   working link. / Podmień na realny adres waszego repozytorium — to jest placeholder,
   nie działający link.)*

2. **Click "New Pull Request"**

3. **Choose the branches / Wybierz brancha:**
   - base: `main`
   - compare: `feature/your-change`

4. **Fill in the template / Wypełnij template:**

   ```markdown
   ## Description of changes / Opis zmian
   [Short description of what you're changing / Krótki opis co zmieniasz]

   ## Type of change / Typ zmian
   - [ ] New functionality / Nowa funkcjonalność
   - [ ] Bug fix / Poprawka błędu
   - [ ] Documentation / Dokumentacja
   - [ ] Refactor / Refaktoryzacja
   - [ ] Other / Inne

   ## Related issue / Powiązane issue
   [Link to the issue, if applicable / Link do issue jeśli dotyczy]

   ## Checklist
   - [ ] Local tests run / Testy lokalne wykonane
   - [ ] Documentation updated / Dokumentacja zaktualizowana
   - [ ] Commit messages follow the convention / Commit messages zgodne z konwencją
   ```

5. **Assign reviewers** (Programme Manager + SME if applicable / ewentualnie SME)

6. **Submit Pull Request**

---

## 🚨 TROUBLESHOOTING / ROZWIĄZYWANIE PROBLEMÓW

### Problem: "You may not merge this pull request because the branch is restricted"

**Cause / Przyczyna:** Only the Programme Manager can merge to `main`. / Tylko Programme Manager może merge do `main`.

**Solution / Rozwiązanie:**
1. Ask the Programme Manager to merge / Poproś Programme Managera o merge
2. Or ask to be added to the list of authorized people / Lub poproś o dodanie Cię do listy osób z uprawnieniami

---

### Problem: Merge conflicts / Konflikty merge

**Cause / Przyczyna:** Someone else changed the same lines in `main`. / Ktoś inny zmienił te same linie w `main`.

**Solution / Rozwiązanie:**
```bash
# 1. Update main / Aktualizuj main
git checkout main
git pull origin main

# 2. Switch to your branch / Przełącz się na swój branch
git checkout feature/my-change

# 3. Rebase (or merge) / Rebase (lub merge)
git rebase main
# Or / Lub:
git merge main

# 4. Resolve conflicts in VS Code / Rozwiąż konflikty w VS Code
# [Files with conflicts will be marked / Pliki z konfliktami będą oznaczone]

# 5. After resolving / Po rozwiązaniu
git add .
git commit -m "[CHORE] resolve merge conflicts"
git push origin feature/my-change
```

---

### Problem: I forgot to create a branch, I committed to main / Zapomniałem stworzyć branch, commitowałem do main

**Solution / Rozwiązanie:**
```bash
# 1. Create a new branch from the current position / Stwórz nowy branch z obecnej pozycji
git branch feature/my-change

# 2. Roll main back to before the commits / Cofnij main do stanu przed commitami
git checkout main
git reset --hard HEAD~1  # ~1 = go back 1 commit / cofnij o 1 commit

# 3. Switch to the branch / Przełącz się na branch
git checkout feature/my-change

# 4. Push and open a PR / Push i otwórz PR
git push origin feature/my-change
```

---

## 📎 ADDITIONAL RESOURCES / DODATKOWE ZASOBY

| Zasób / Resource | Link |
|-------|------|
| GitHub Docs — Branch Protection | https://docs.github.com/en/repositories/configuring-branches-and-merges |
| Conventional Commits | https://www.conventionalcommits.org/ |
| Git — Rebasing | https://git-scm.com/docs/git-rebase |

---

**Last Updated:** 2026-09-06
**Owner:** Fieldcraft Programme Manager
**Review Cycle:** Quarterly
