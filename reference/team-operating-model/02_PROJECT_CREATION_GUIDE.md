# Fieldcraft Programme — Project Creation Guide

**Version:** 1.2
**Last Updated:** 2026-09-06
**Audience:** **All Fieldcraft team members** — anyone can set up a project on their own branch / **Wszyscy członkowie zespołu Fieldcraft** — każdy może założyć projekt na własnym branchu

---

## 🎯 OVERVIEW / OVERVIEW

This document describes the process of setting up new projects within the Fieldcraft
programme, in line with the Project Management Framework (PMF).

**You don't need to be the Programme Manager to set up a project.** You create it on
your own branch, and the Programme Manager approves it through a Pull Request. The full
path is below.

Ten dokument opisuje proces zakładania nowych projektów w ramach programu Fieldcraft, zgodnie z Project Management Framework (PMF).

**Nie musisz być Programme Managerem, żeby założyć projekt.** Zakładasz go na własnym branchu,
a Programme Manager zatwierdza go przez Pull Request. Poniżej pełna ścieżka.

---

## ⚡ FAST PATH — a new project on your own branch / SZYBKA ŚCIEŻKA — nowy projekt na własnym branchu

Before you start: check the qualification criteria (section below). If the task takes
less than 2 weeks and you're doing it alone — it's a task, not a project. Don't create
a folder.

Zanim zaczniesz: sprawdź kryteria kwalifikacji (sekcja niżej). Jeśli zadanie trwa krócej
niż 2 tygodnie i robisz je sam — to task, nie projekt. Nie zakładaj folderu.

```bash
# 1. Always start from a current main / Zawsze zaczynasz od aktualnego main
git checkout main
git pull origin main

# 2. Your own branch — never work directly on main / Własny branch — nigdy nie pracujesz bezpośrednio na main
git checkout -b feature/transportation-vertical

# 3. The script builds the full MWP structure and registers the project / Skrypt tworzy pełną strukturę MWP i wpisuje projekt do registry
node _scripts/management/create_new_project.js "Transportation Vertical"
```

The script creates / Skrypt tworzy:

```
_projects/Transportation Vertical/
├── CLAUDE.md                    ← L0: project identity (to fill in) / tożsamość projektu (do uzupełnienia)
├── CONTEXT.md                   ← L1: read order + output rules (to fill in) / (do uzupełnienia)
├── README.md
├── _context/project_brief.md    ← project brief (to fill in) / brief projektu (do uzupełnienia)
├── _outputs/_drafts/  _outputs/final/
├── _prompts/  _scripts/  _archive/
```
...and adds an entry to `_context/_project_registry.json`. / …oraz dopisuje wpis do `_context/_project_registry.json`.

```bash
# 4. Fill in the three things the script doesn't know / Uzupełnij trzy rzeczy, których skrypt nie zna:
#    CLAUDE.md                  -> Purpose, Owner, Strategic Alignment (O1-O9), Deliverable (D1-D15)
#    CONTEXT.md                 -> project read order, output rules / read order projektu, zasady zapisu outputów
#    _context/project_brief.md  -> scope, KPI impact, timeline, team, RAID / zakres, wplyw na KPI, timeline, zespol, RAID

# 5. Commit following the [TYPE] scope: description convention / Commit wg konwencji [TYPE] scope: opis
git add "_projects/Transportation Vertical/" _context/_project_registry.json
git commit -m "[FEAT] projects: add Transportation Vertical"

# 6. Push and open a Pull Request — the Programme Manager merges to main / Push i Pull Request — merge do main robi Programme Manager
git push origin feature/transportation-vertical
```

### Rules you need to know / Zasady, które musisz znać

| Zasada / Rule | Dlaczego / Why |
|--------|----------|
| **The canon is read upward, never sideways / Kanon czyta się w górę, nigdy w bok** | Need unit codes or the team roster? Reference `_context/` at root. Don't copy those lists into your project and don't reach into another project's dictionary. Copying has historically produced **three contradictory unit-code dictionaries** — see `CONTEXT.md`, section "Listy kontrolowane programu" / Potrzebujesz kodów jednostek albo składu zespołu? Odwołaj się do `_context/` w rootcie. Nie kopiuj tych list do swojego projektu i nie sięgaj do słownika innego projektu. Kopiowanie dało już historycznie **trzy sprzeczne słowniki kodów jednostek** — patrz `CONTEXT.md`, sekcja „Listy kontrolowane programu" |
| **`_context/` is read-only / `_context/` jest read-only** | At every level — root and project. A change requires the owner's approval / Na każdym poziomie — root i projekt. Zmiana wymaga zgody właściciela |
| **Don't run `update_project_registry.js` unless you need to / Nie uruchamiaj `update_project_registry.js` bez potrzeby** | It overwrites the entire registry and wipes manually filled-in `linked_kpi`, `linked_deliverable`, `owner` fields / Nadpisuje registry w całości i kasuje ręcznie uzupełnione pola `linked_kpi`, `linked_deliverable`, `owner` |
| **Folder name / Nazwa folderu** | The script strips special characters (`—`, `&`, `/`). If the project name contains them, the folder will be named differently from the registry entry — use a simple name / Skrypt usuwa znaki specjalne (`—`, `&`, `/`). Jeśli nazwa projektu je zawiera, folder będzie się nazywał inaczej niż wpis w registry — użyj prostej nazwy |
| **Outputs / Outputy** | Drafts → `_outputs/_drafts/`. Final → `_outputs/final/`. Never to `_context/` / Wersje robocze → `_outputs/_drafts/`. Gotowe → `_outputs/final/`. Nigdy do `_context/` |

### When should you set up a new project? / Kiedy założyć nowy projekt?

| Kryterium / Criterion | TAK (załóż projekt) / YES (create a project) | NIE (nie zakładaj) / NO (don't) |
|-----------|---------------------|-------------------|
| **Duration / Czas trwania** | > 2 weeks / tygodnie | < 2 weeks (a task) / tygodnie (task) |
| **Team / Zespół** | 2+ people / osoby | 1 person / osoba |
| **Budget** | Requires tracking / Wymaga trackingu | No budget / Brak budgetu |
| **KPI Impact** | Affects core KPIs / Wpływa na core KPIs | No KPI impact / Brak wpływu na KPI |
| **Deliverable** | A new deliverable (D1-D15) / Nowy deliverable | Maintaining an existing one / Utrzymanie istniejącego |
| **Complexity / Złożoność** | Requires phase gates / Wymaga phase gates | A simple task / Proste zadanie |

---

## 📋 PROJECT QUALIFICATION CRITERIA / KRYTERIA KWALIFIKACJI PROJEKTU

### Minimum criteria (all must be met) / Minimalne kryteria (wszystkie muszą być spełnione)

1. **Linked to Strategy** — The project must map to:
   - a Growth Engine (O1–O4), OR
   - an Enabler (O5–O9)

2. **Named Owner** — The project must have an owner (Person/Role)

3. **Defined Outcome** — The project must have a defined outcome (a deliverable)

4. **Measurable KPI** — The project must affect at least 1 core KPI

1. **Linked to Strategy** — Projekt musi mapować się do:
   - Growth Engine (O1–O4) LUB
   - Enabler (O5–O9)

2. **Named Owner** — Projekt musi mieć właściciela (Person/Role)

3. **Defined Outcome** — Projekt musi mieć zdefiniowany rezultat (deliverable)

4. **Measurable KPI** — Projekt musi wpływać na co najmniej 1 core KPI

### Additional criteria (worth considering) / Kryteria dodatkowe (warto rozważyć)

- **Cross-functional** — Requires collaboration across parts (PreSales / PM / Integration) / Wymaga współpracy między częściami (PreSales / PM / Integration)
- **External stakeholder** — Requires coordination with HQ / Subsidiary / Partner / Wymaga koordynacji z HQ / Subsidiary / Partner
- **Multi-week** — Runs longer than 2 weeks / Trwa dłużej niż 2 tygodnie
- **Phase gates** — Requires formal Go/No-Go decisions / Wymaga formalnych Go/No-Go decyzji

---

## 🚀 PROJECT SETUP PROCESS — STEP BY STEP / PROCES ZAKŁADANIA PROJEKTU — KROK PO KROKU

### Step 1: Prepare the Project Brief / Krok 1: Przygotowanie Project Brief

**Time / Czas:** 30–60 minutes / minut
**Output:** `_projects/[Name]/_context/project_brief.md`

**Project Brief structure / Struktura Project Brief:**

*The template below is shared boilerplate for the actual project file — not duplicated
per language, since it becomes literal content in a new project.*
*Poniższy szablon to wspólny materiał źródłowy dla właściwego pliku projektu — nie jest
duplikowany per język, bo staje się dosłowną treścią nowego projektu.*

```markdown
# [Project Name] — Project Brief

## Executive Summary (1 paragraph)
[Short description: what, why, for whom]

## Strategic Alignment
| Growth Engine / Enabler | Objective | Deliverable |
|------------------------|-----------|-------------|
| [e.g. O3 Rugged] | [e.g. Portfolio completion] | [e.g. D1 Battlecard] |

## core KPI Impact
| KPI | Target | Baseline | Expected Impact |
|-----|--------|----------|-----------------|
| [e.g. Solution Revenue] | [$XX M] | [$XX M] | [+X%] |

## Scope
### In Scope
- [Element 1]
- [Element 2]

### Out of Scope
- [Element 1]
- [Element 2]

## Timeline
| Phase | Start | End | Milestone |
|-------|-------|-----|-----------|
| Initiation | YYYY-MM-DD | YYYY-MM-DD | Project Charter |
| Execution | YYYY-MM-DD | YYYY-MM-DD | Deliverable v1.0 |
| Closure | YYYY-MM-DD | YYYY-MM-DD | Final Report |

## Team
| Role | Person | Availability |
|------|--------|--------------|
| Project Owner | [Name] | [X%] |
| Team Member | [Name] | [X%] |

## Risks (RAID)
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | High | High | [Mitigation] |

## Success Criteria
- [Criterion 1 — measurable]
- [Criterion 2 — measurable]
```

---

### Step 2: Run the structure-creation script / Krok 2: Uruchomienie skryptu tworzącego strukturę

**Time / Czas:** 2 minutes / minuty
**Output:** Project folder structure / Struktura folderów projektu

```bash
# Run the script with the project name / Uruchom skrypt z nazwą projektu
node _scripts/management/create_new_project.js "[Project Name]"

# Example / Przykład:
node _scripts/management/create_new_project.js "Transportation Vertical"
```

**The script automatically / Skrypt automatycznie:**
1. Creates the `_projects/[Name]/` folder / Tworzy folder `_projects/[Nazwa]/`
2. Creates the MWP structure (CLAUDE.md, CONTEXT.md, _context/, _outputs/, etc.) / Tworzy strukturę MWP (CLAUDE.md, CONTEXT.md, _context/, _outputs/, itp.)
3. Copies templates from `_templates/new-project/` / Kopiuje szablony z `_templates/new-project/`
4. Adds an entry to `_context/_project_registry.json` / Dodaje wpis do `_context/_project_registry.json`
5. Creates `.gitkeep` in empty folders / Tworzy `.gitkeep` w pustych folderach

---

### Step 3: Fill in the project's CLAUDE.md / Krok 3: Uzupełnienie CLAUDE.md projektu

**Time / Czas:** 15–30 minutes / minut
**Output:** `_projects/[Name]/CLAUDE.md`

**CLAUDE.md template / Szablon CLAUDE.md:**

```markdown
# [Project Name] — Fieldcraft Programme

**Purpose:** [Short description of the project's purpose]

**Owner:** [Person/Role]

**Strategic Alignment:** [Growth Engine / Enabler]

---

## QUICK START

1. **Read context first** — `_context/project_brief.md`
2. **Check status** — `_outputs/_drafts/` for latest reports
3. **Use prompts** — `_prompts/` for AI-assisted workflows

---

## STRUCTURE

```
[Name]/
├── CLAUDE.md              ← This file
├── CONTEXT.md             ← Task routing
├── _context/              ← Project context (READ-ONLY)
├── _outputs/              ← Project outputs (WRITE)
│   ├── _drafts/           ← Drafts
│   └── final/             ← Final deliverables
├── _archive/              ← Archived documents
├── _prompts/              ← Project-specific prompts
└── _scripts/              ← Project-specific scripts
```

---

## LINKED DELIVERABLES

| Deliverable | Description | Status |
|-------------|-------------|--------|
| [D1] | [Battlecard] | [In Progress] |

---

## LINKED KPIS

| core KPI | Target | Current | Impact |
|-----------|--------|---------|--------|
| [KPI 1] | [Target] | [Current] | [Impact] |

---

**Last Updated:** YYYY-MM-DD
```

---

### Step 4: Fill in the project's CONTEXT.md / Krok 4: Uzupełnienie CONTEXT.md projektu

**Time / Czas:** 10–15 minutes / minut
**Output:** `_projects/[Name]/CONTEXT.md`

**CONTEXT.md template / Szablon CONTEXT.md:**

```markdown
# [Project Name] — Context Routing

**Layer:** L1 — Project-specific routing

---

## READ ORDER

| # | Document | Purpose |
|---|----------|---------|
| 1 | `_context/project_brief.md` | Project overview |
| 2 | `_context/[doc2]` | [Purpose] |

---

## OUTPUT RULES

| Output Type | Destination |
|-------------|-------------|
| Drafts | `_outputs/_drafts/` |
| Final | `_outputs/final/` |

---

## RELATED PROJECTS

| Project | Relationship |
|---------|--------------|
| [Project 1] | [Consumer/Provider/Independent] |

---

**Last Updated:** YYYY-MM-DD
```

---

### Step 5: Register the project / Krok 5: Rejestracja projektu w registry

**Time / Czas:** 5 minutes / minut
**Output:** `_context/_project_registry.json` (updated / zaktualizowany)

**The script automatically adds / Skrypt automatycznie dodaje:**

```json
{
  "name": "[Project Name]",
  "path": "_projects/[Name]/",
  "category": "[Product/Strategy/Reporting/Operations/Other]",
  "status": "active",
  "last_activity": "YYYY-MM-DD",
  "files_last_3_months": 0,
  "structure_score": 100,
  "has_required_structure": true,
  "linked_kpi": ["[KPI 1]"],
  "linked_deliverable": ["[D1]"],
  "owner": "[Person/Role]"
}
```

---

### Step 6: First commit to Git / Krok 6: Pierwszy commit do Git

**Time / Czas:** 5 minutes / minut

> You already created the branch in Step 0 (see "Fast path" at the top of this
> document) — **before** running the script. You don't work directly on `main`.
>
> Branch założyłeś już w Kroku 0 (patrz „Szybka ścieżka" na początku dokumentu) — **przed**
> uruchomieniem skryptu. Nie pracujesz bezpośrednio na `main`.

```bash
# 1. Confirm you're on your branch / Sprawdź, że jesteś na swoim branchu
git branch --show-current

# 2. Add files (quotes - the folder name has spaces) / Dodaj pliki (cudzysłowy — nazwa folderu zawiera spacje)
git add "_projects/[Name]/"
git add _context/_project_registry.json

# 3. Commit
git commit -m "[FEAT] projects: add [Project Name] - [brief description]"

# 4. Push
git push origin feature/[project-name]

# 5. Open a PR on GitHub — the Programme Manager merges to main / Otwórz PR na GitHub — merge do main robi Programme Manager
```

---

## 📁 PROJECT STRUCTURE (MWP-COMPLIANT)

### Minimum structure (required) / Minimalna struktura (required)

```
[Name]/
├── CLAUDE.md              ← L0: Identity
├── CONTEXT.md             ← L1: Routing
├── _context/              ← L3: Context (READ-ONLY)
└── _outputs/              ← L4: Outputs (WRITE)
```

### Full structure (recommended) / Pełna struktura (recommended)

```
[Name]/
├── CLAUDE.md              ← L0: Identity
├── CONTEXT.md             ← L1: Routing
├── _context/              ← L3: Context
│   ├── project_brief.md   ← Project brief
│   └── [other docs]
├── _outputs/              ← L4: Outputs
│   ├── _drafts/           ← Drafts
│   └── final/             ← Final
├── _archive/              ← Archive
├── _prompts/              ← Prompts
└── _scripts/              ← Scripts
```

---

## 🏷️ PROJECT CATEGORIZATION / KATEGORYZACJA PROJEKTÓW

### Categories / Kategorie

| Kategoria / Category | Opis / Description | Przykłady / Examples |
|-----------|------|-----------|
| **Product** | Portfolio products / Produkty z portfolio | Rugged Portfolio, Defence vertical |
| **Strategy** | Strategic initiatives / Inicjatywy strategiczne | AI Transformation, DaaS in Europe |
| **Reporting** | Reporting / Raportowanie | Weekly Reports, Monthly Reports, Beacon Pipeline |
| **Operations** | Internal operations / Operacje wewnętrzne | Competencies Optimization, Subsidiaries |
| **Events** | Events / Wydarzenia | CTO visit, VIP Visits |
| **Professional Services** | Paid services / Usługi płatne | LO (AMS), EMM Migration Support |
| **Integration** | Technical integrations / Integracje techniczne | Fieldcraft Integrations Part, Systems Cooperation |

---

## 📊 PROJECT MONITORING / MONITOROWANIE PROJEKTU

### Health Check (monthly / comiesięczny)

Run / Uruchom:
```bash
node _scripts/management/analyze_project_activity.js
```

**Metrics / Metryki:**
- **Structure Score** (0–100): Does the project have the required structure? / Czy projekt ma wymaganą strukturę?
- **Last Activity**: When was the last file? / Kiedy ostatni plik?
- **Files (3 months)**: How many files were added in 3 months? / Ile plików dodano w 3 miesiącach?
- **Status**: active / dormant / critical / dead

### Status criteria / Kryteria statusu

| Status | Kryteria / Criteria | Akcja / Action |
|--------|----------|-------|
| **Active** | Activity < 30 days, outputs being produced / Aktywność < 30 dni, outputy powstają | Continue / Kontynuuj |
| **Dormant** | Activity 30–90 days, no outputs / Aktywność 30–90 dni, brak outputów | Check with the owner / Sprawdź z ownerem |
| **Critical** | Activity > 90 days, no progress / Aktywność > 90 dni, brak postępu | Consider archiving / Rozważ archiwizację |
| **Dead** | Activity > 180 days, project finished/outdated / Aktywność > 180 dni, projekt zakończony/nieaktualny | Archive / Archiwizuj |

---

## 🗄️ PROJECT ARCHIVAL / ARCHIWIZACJA PROJEKTU

### When to archive? / Kiedy archiwizować?

- The project is finished (deliverables completed) / Projekt zakończony (deliverables ukończone)
- The project is outdated (strategy change) / Projekt nieaktualny (zmiana strategii)
- No activity > 180 days / Brak aktywności > 180 dni
- No owner / Brak ownera

### Archival process / Proces archiwizacji

1. **Run the archive suggestion / Uruchom sugestię archiwizacji:**
   ```bash
   node _scripts/management/suggest_archives.js
   ```

2. **Review the candidates / Przejrzyj kandydatów:**
   ```
   _outputs/management/archive_candidates.json
   ```

3. **After approval — run the archival / Po akceptacji — uruchom archiwizację:**
   ```bash
   # [The script moves the project to _projects/_ARCHIVED/ / Skrypt przenosi projekt do _projects/_ARCHIVED/]
   ```

4. **Update the registry / Zaktualizuj registry:**
   ```bash
   node _scripts/management/update_project_registry.js
   ```

5. **Commit the changes / Commit zmiany:**
   ```bash
   git add _projects/_ARCHIVED/
   git add _context/_project_registry.json
   git commit -m "[CHORE] archive: move [Name] to archive"
   ```

---

## 📋 CHECKLIST BEFORE CREATING A PROJECT / CHECKLIST PRZED UTWORZENIEM PROJEKTU

Before running the script, check / Przed uruchomieniem skryptu sprawdź:

- [ ] **Strategic Link** — The project maps to a GE/EN / Projekt mapuje się do GE/EN
- [ ] **Owner Assigned** — A responsible person is named / Osoba odpowiedzialna wskazana
- [ ] **Project Brief** — Brief prepared in `_context/` / Brief przygotowany w `_context/`
- [ ] **KPI Impact** — Impact on a core KPI defined / Wpływ na core KPI zdefiniowany
- [ ] **Deliverable** — A deliverable (D1–D15) identified / Deliverable (D1–D15) zidentyfikowany
- [ ] **Timeline** — A timeframe defined / Ramy czasowe określone
- [ ] **Team** — A team defined (even 1 person) / Zespół zdefiniowany (nawet 1 osoba)

---

## 📎 FILE TEMPLATES / TEMPLATE PLIKÓW

Templates available in `_templates/new-project/`: / Szablony dostępne w `_templates/new-project/`:

| Plik / File | Cel / Purpose |
|------|-----|
| `CLAUDE.md.template` | L0 template for a project / Szablon L0 dla projektu |
| `CONTEXT.md.template` | L1 template for a project / Szablon L1 dla projektu |
| `README.md.template` | Project README template / Szablon README projektu |

---

## 🚨 COMMON MISTAKES / CZĘSTE BŁĘDY

### Mistake 1: Too many projects / Błąd 1: Za dużo projektów

**Problem:** Every task as a separate project → fragmentation. / Każdy task jako osobny projekt → fragmentacja.

**Solution:** Group tasks into larger initiatives. Use the qualification criteria. / Grupuj taski w większe inicjatywy. Używaj kryteriów kwalifikacji.

---

### Mistake 2: Not enough structure / Błąd 2: Za mało struktury

**Problem:** A project without `_context/` and `_outputs/` → chaos. / Projekt bez `_context/` i `_outputs/` → chaos.

**Solution:** Always run the `create_new_project.js` script — it creates the required structure. / Zawsze uruchamiaj skrypt `create_new_project.js` — tworzy wymaganą strukturę.

---

### Mistake 3: No owner / Błąd 3: Brak ownera

**Problem:** A project without a named responsible person. / Projekt bez wskazanej osoby odpowiedzialnej.

**Solution:** Don't create a project without an owner. If the owner is TBD — postpone creation. / Nie zakładaj projektu bez ownera. Jeśli owner TBD — odłóż utworzenie.

---

### Mistake 4: Ignoring the registry / Błąd 4: Ignorowanie registry

**Problem:** The project was created, but it's not in `_project_registry.json`. / Projekt utworzony, ale nie ma w `_project_registry.json`.

**Solution:** The script updates the registry automatically — use it! / Skrypt automatycznie aktualizuje registry — używaj go!

---

## 📖 RELATED DOCUMENTS

| Dokument | Ścieżka |
|----------|---------|
| New Employee Onboarding | `_context/00_NEW_EMPLOYEE_ONBOARDING.md` |
| GitHub Workflow Guide | `_context/01_GITHUB_WORKFLOW_GUIDE.md` |
| Fieldcraft Governance Model | `_context/2026-04-22_Fieldcraft_governance.md` |
| Strategy 2026 Framework | `_context/2026-04-22_Fieldcraft_strategy_2026_framework.md` |
| Project Registry | `_context/_project_registry.json` |

---

**Last Updated:** 2026-09-06
**Owner:** Fieldcraft Programme Manager
**Review Cycle:** Quarterly
