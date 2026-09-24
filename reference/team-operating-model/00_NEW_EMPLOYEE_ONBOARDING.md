# Fieldcraft Programme — New Employee Onboarding Guide

**Version:** 1.1
**Last Updated:** 2026-09-06
**Audience:** New Fieldcraft team members (PreSales, Product Managers, Integration) — bilingual EN/PL

---

## 🎯 START HERE / START HERE

Welcome to the Fieldcraft team! This guide will help you get started with our knowledge and
project management system.

Witaj w zespole Fieldcraft! Ten przewodnik pomoże Ci zacząć pracę z naszym systemem zarządzania wiedzą i projektami.

### First 30 minutes / Pierwsze 30 minut

1. **Read this file** — you'll understand the structure and tooling
2. **Read `CLAUDE.md`** (root) — routing table and quick start
3. **Read `CONTEXT.md`** — global rules and read order
4. **Set up Git** — see `_context/01_GITHUB_WORKFLOW_GUIDE.md`

1. **Przeczytaj ten plik** — zrozumiesz strukturę i narzędzia
2. **Przeczytaj `CLAUDE.md`** (root) — routing table i quick start
3. **Przeczytaj `CONTEXT.md`** — globalne zasady i read order
4. **Skonfiguruj Git** — patrz `_context/01_GITHUB_WORKFLOW_GUIDE.md`

---

## 📁 REPOSITORY STRUCTURE / STRUKTURA REPOZYTORIUM

The Fieldcraft repository uses the **Model Workspace Protocol (MWP)** — a methodology for
organizing knowledge in layers. The idea is simple: **the folder structure is
simultaneously an instruction for the AI and documentation for the human.** There is no
separate "system" — it's a folder of markdown files.

**Full repository structure: see `CLAUDE.md`, section "Workspace Structure".** That is
the only place it's described — every other document links there instead of repeating it.

Repozytorium Fieldcraft używa **Model Workspace Protocol (MWP)** — metodologii organizowania wiedzy
w warstwach. Idea jest prosta: **struktura folderów jest jednocześnie instrukcją dla AI
i dokumentacją dla człowieka.** Nie ma osobnego "systemu" — jest folder z plikami markdown.

**Pełna struktura repozytorium: patrz `CLAUDE.md`, sekcja „Workspace Structure".**
To jedyne miejsce, gdzie jest opisana — reszta dokumentów tam linkuje.

Files you'll read most often / Pliki, które przeczytasz najczęściej:

```
_context/
├── 00_NEW_EMPLOYEE_ONBOARDING.md   ← this file / ten plik
├── 01_GITHUB_WORKFLOW_GUIDE.md     ← Git flow: branches, commits, PR / branche, commity, PR
├── 02_PROJECT_CREATION_GUIDE.md    ← how to set up your own project / jak założyć własny projekt
├── 99_source_paper_VanClief_2026_EN.md  ← the source description of the MWP method / źródłowy opis metody MWP
└── [Fieldcraft programme canon — see "Key documents" below / kanon programu Fieldcraft — patrz "Kluczowe dokumenty" niżej]
```

### MWP Layers / Warstwy MWP

| Warstwa | Gdzie | Pytanie | Zmiany |
|---------|-------|---------|--------|
| **L0** | `CLAUDE.md` | "Where am I?" / „Gdzie jestem?" | Once (setup) / Raz (setup) |
| **L1** | `CONTEXT.md` | "Where do I go? What are the rules?" / „Gdzie iść? Jakie są zasady?" | Once (setup) / Raz (setup) |
| **L2** | `.clinerules/` | "How do I execute this stage?" — contract: what to load, what to do, where to save / „Jak wykonać ten etap?" — kontrakt: co wczytać, co zrobić, gdzie zapisać | Per workflow |
| **L2-aux** | `_prompts/` | "A prompt template for a management task" / „Szablon promptu do zadania zarządczego" | Per workflow |
| **L3** | `_context/`, `_templates/` | "What am I working with (stable)?" / „Na czym pracuję (stabilne)?" | Rarely (months) / Rzadko (miesiące) |
| **L4** | `_outputs/` | "What am I working with (this run)?" / „Na czym pracuję (ten przebieg)?" | Per run (daily) / Per run (dziennie) |

**The key distinction, L3 vs L4:** L3 is the *factory* — rules the model should treat as
constraints (canon, conventions, templates). L4 is the *product* — the inputs and results
of a single run. Never mix them: a report draft doesn't belong in `_context/`.

**Kluczowe rozróżnienie L3 vs L4:** L3 to *fabryka* — reguły, które model ma traktować jako
ograniczenia (kanon, konwencje, szablony). L4 to *produkt* — dane wejściowe i wyniki jednego
przebiegu. Nigdy nie mieszaj: draft raportu nie należy do `_context/`.

*Note on L1: the source paper (§3.2) assigns "Where do I go?" to Layer 1 and "What do
I do? What are the rules?" specifically to Layer 2. The table above blends both
questions into L1 because root `CONTEXT.md` genuinely carries both routing and some
rules in this repository — a deliberate implementation choice, not a misreading of the
paper.*

*Uwaga do L1: paper źródłowy (§3.2) przypisuje „Gdzie iść?" do warstwy 1, a „Co robię?
Jakie są zasady?" konkretnie do warstwy 2. Powyższa tabela łączy oba pytania w L1, bo
root `CONTEXT.md` w tym repozytorium faktycznie łączy routing z regułami — to świadomy
wybór implementacyjny, nie błędne odczytanie papieru.*

### Deviations from the MWP canon — read before comparing against the paper / Odstępstwa od kanonu MWP — przeczytaj, zanim porównasz z paperem

If you go to `_context/99_source_paper_VanClief_2026_EN.md`, you'll see elements in the
pattern that this repository doesn't have. These are deliberate simplifications, not
mistakes:

Jeśli sięgniesz do `_context/99_source_paper_VanClief_2026_EN.md`, zobaczysz we wzorcu elementy,
których w tym repozytorium nie ma. To celowe uproszczenia, nie błędy:

| Element wzorca / Pattern element | Stan w Fieldcraft / State in Fieldcraft | Dlaczego / Why |
|---|---|---|
| `setup/questionnaire.md` | Missing / Brak | This onboarding file fills that role / Jego rolę pełni ten plik onboardingowy |
| `_config/`, `shared/` | Missing — merged into `_context/` / Brak — scalone w `_context/` | One L3 directory instead of three / Jeden katalog L3 zamiast trzech |
| `stages/NN_nazwa/` | Missing at root level / Brak na poziomie root | The root is the programme's hub, not a pipeline. Stages (`stages/`) occur inside sub-projects that have multi-stage processing / Root jest hubem programu, nie pipeline'em. Etapy (`stages/`) występują wewnątrz podprojektów, które mają przetwarzanie wieloetapowe |
| — | **Added / Dodany:** `_prompts/` as "L2-aux" — not in the paper's five-layer model at all / jako „L2-aux" — w ogóle nie w pięciowarstwowym modelu papieru | Fieldcraft-specific addition for reusable management-task prompt templates, distinct from the L2 stage contracts in `.clinerules/` / Dodatek specyficzny dla Fieldcraft na potrzeby wielokrotnego użytku szablonów promptów zarządczych, odrębny od kontraktów etapów L2 w `.clinerules/` |

---

## 🔧 TOOLS / NARZĘDZIA

### Required / Wymagane

| Narzędzie | Wersja | Cel |
|-----------|--------|-----|
| **Node.js** | 18+ | Conversion scripts (xlsx, html) / Skrypty konwersji (xlsx, html) |
| **Python** | 3.10+ | Conversion scripts (pptx, docx, msg) / Skrypty konwersji (pptx, docx, msg) |
| **Git** | 2.40+ | Sync with GitHub / Synchronizacja z GitHub |
| **Visual Studio Code** | Latest | IDE with Git integration / IDE z integracją Git |

### Installation (Windows) / Instalacja (Windows)

```bash
# 1. Node.js — https://nodejs.org/
# 2. Python — https://python.org/ (add to PATH! / dodaj do PATH!)
# 3. Git — https://git-scm.com/
# 4. VS Code — https://code.visualstudio.com/

# Verify / Weryfikacja:
node --version
python --version
git --version
```

---

## 📚 KEY DOCUMENTS / KLUCZOWE DOKUMENTY

### Programme Context (mandatory) / Programme Context (obowiązkowe)

| # | Dokument | Cel / Purpose |
|---|----------|-----|
| 1 | `_context/2026-07-30_Fieldcraft_brief.md` | Programme overview & mission / Overview programu i misja |
| 2 | `_context/2026-04-22_Fieldcraft_strategy_2026_framework.md` | Strategic framework (GE + Enablers) / Framework strategiczny (GE + Enablers) |
| 3 | `_context/2026-04-22_Fieldcraft_governance.md` | Governance model & rhythms / Model governance i rytmy |
| 4 | `_context/2026-04-22_Fieldcraft_stakeholders.md` | Stakeholder mapping / Mapowanie interesariuszy |
| 5 | `_context/2026-04-22_Fieldcraft_KPI_deliverables.md` | core KPIs and deliverables / core KPIs i deliverables |
| 6 | `_context/2026-04-22_Fieldcraft_deliverables_mapping.md` | Detailed deliverables mapping / Szczegółowe mapowanie deliverables |
| 7 | `_context/2026-06-17_Fieldcraft_organization_structure.md` | Team structure / Struktura zespołu |

### Slash Commands (AI tooling) / Slash Commands (narzędzia AI)

| Komenda | Opis / Description |
|---------|------|
| `/beacon-report` | Generate the Beacon Pipeline report / Generuj raport Beacon Pipeline |
| `/beacon-sponsor` | Sponsor Dashboard for Beacon / Sponsor Dashboard dla Beacon |
| `/weekly-report` | Fieldcraft weekly report / Raport tygodniowy Fieldcraft |
| `/monthly-report` | Monthly report (Aurora HQ + MD) / Raport miesięczny (Aurora HQ + MD) |
| `/rtam-manage` | Portfolio management (dashboard, health check) |
| `/authors-rights` | Authors Rights report / Raport Authors Rights |
| `/defence-quiz` | Defence Vertical knowledge quiz / Quiz wiedzy Defence Vertical |

**Full list / Pełna lista:** `.clinerules/`

---

## 🗂️ PROJECTS / PROJEKTY

### Project structure / Struktura projektu

Every project in `_projects/` has its own MWP structure:

Każdy projekt w `_projects/` ma własną strukturę MWP:

```
_projects/[Project Name]/
├── CLAUDE.md              ← L0: project identity / Identity projektu
├── CONTEXT.md             ← L1: routing within the project / Routing w projekcie
├── _context/              ← L3: project-specific context / Kontekst specyficzny dla projektu
├── _outputs/               ← L4: project outputs / Outputy projektu
│   ├── _drafts/            ← Work in progress / Wersje robocze
│   └── final/              ← Final deliverables / Finalne deliverables
├── _archive/               ← Project archive / Archiwum projektu
├── _prompts/                ← Project-specific prompts / Prompty specyficzne
└── _scripts/                 ← Project-specific scripts / Skrypty specyficzne
```

### Example projects / Przykładowe projekty

| Projekt | Folder | Obszar / Area |
|---------|--------|--------|
| Beacon Pipeline | `_projects/Beacon Pipeline/` | Pipeline operations |
| Vertical Offering | `_projects/Vertical Offering - TEST/` | Shared Service — vertical offering generator (live project; `-TEST` suffix stays during active testing, predecessor archived) |
| Fieldcraft Weekly Reports | `_projects/Fieldcraft Weekly Reports/` | Weekly reporting |
| Fieldcraft Monthly Reports | `_projects/Fieldcraft Monthly Reports/` | Monthly reporting |
| Rugged Portfolio | `_projects/Rugged Portfolio/` | Rugged portfolio |
| Defence vertical | `_projects/Defence vertical/` | Defence offering |

**Full list / Pełna lista:** `_context/_project_registry.json`

---

## 🔄 OPERATING WORKFLOW / WORKFLOW OPERACYJNY

### Weekly rhythm / Tygodniowy rytm

| Dzień / Day | Godzina / Time | Aktywność / Activity |
|-------|---------|-----------|
| Monday / Poniedziałek | 09:00 | Fieldcraft–Aurora HQ Sync |
| Monday / Poniedziałek | 11:00 | Fieldcraft Programme Sync (Kanban) |
| Monday / Poniedziałek | 13:30 | PM + Group Leader review |
| Tue–Thu / Wtorek–Czwartek | 15:00 | Daily Stand-up |
| Thursday / Czwartek | — | Cross-Part Task Force Sync |
| Friday / Piątek | — | Weekly Report to Aurora HQ |
| Friday / Piątek | — | Programme Council (RAID, WIP) |

### Monthly rhythm / Miesięczny rytm

- **Monthly Report to Aurora HQ** — consolidates weekly reports + KPI status / konsolidacja weekly + KPI status
- **MD Monthly Report** — report for the Managing Director / raport dla Managing Director

### Meetings with sponsors / Spotkania ze sponsorami

Since 2026-09-15 every presentation you give to sponsors and decision-makers (OPM, i.e. Operational
Product Managers in HQ; HQ BD&P, i.e. Business Development & Partnership; project owners) must be
approved by your Part Leader first. Come prepared, be brief and start with the conclusion, and send
a meeting note afterwards. Full rule: `_context/2026-04-22_Fieldcraft_governance.md`.

Od 2026-09-15 każdą prezentację dla sponsorów i decydentów (OPM, czyli Operational Product Managers
w HQ; HQ BD&P, czyli Business Development & Partnership; właściciele projektów) najpierw akceptuje
Twój Part Leader. Przychodzisz przygotowany, mówisz krótko i zaczynasz od konkluzji, a po spotkaniu
wysyłasz notatkę. Pełna reguła: `_context/2026-04-22_Fieldcraft_governance.md`.

---

## 📊 STRATEGIC FRAMEWORK — CHEAT SHEET / STRATEGIC FRAMEWORK — ŚCIĄGA

Everything in Fieldcraft maps to the cascade / Wszystko w Fieldcraft mapuje się do kaskady:

**core KPIs → Objectives (O1–O9) → Deliverables (D1–D15) → Individual MBOs**

### Growth Engines (GE)

| Objective | Growth Engine | Focus |
|-----------|---------------|-------|
| **O1** | Flagship | rival-brand win-back & enterprise retention |
| **O2** | Fleet Series | Enterprise fleet engine & retention |
| **O3** | Rugged | Portfolio completion & workforce enablement |
| **O4** | SMB Line | SMB run-rate & enterprise BO wins |

### Enablers (EN)

| Objective | Enabler | Focus |
|-----------|---------|-------|
| **O5** | Solution Provider | Services, support, TCO, solution activation |
| **O6** | Channel Enablement | MSP, DaaS, Portal, SMB activation |
| **O7** | AI & Security Leadership | AI differentiation, zero-trust |
| **O8** | Enterprise Deal Acceleration | Late-stage deal support |
| **O9** | Integration Readiness | Deployment & integration layer |

### Deliverables (D1–D15)

| Kategoria / Category | Deliverables |
|-----------|-------------|
| **Enablement & positioning** | D1–D4 (battlecards, tenders, usage guides) |
| **Pipeline & sales support** | D5–D9 (PoC, Beacon, migration, compliance) |
| **Scaling & feedback** | D10–D15 (success stories, verticals, webinars) |

---

## 🔐 ACCESS AND PERMISSIONS / DOSTĘP I UPRAWNIENIA

### GitHub

- **Main branch:** Protected — only the Programme Manager merges / tylko Programme Manager merge
- **Feature branches:** For larger changes / Dla większych zmian
- **Pull Requests:** Required before merge / Wymagane przed merge

**Details / Szczegóły:** `_context/01_GITHUB_WORKFLOW_GUIDE.md`

### Folders / Foldery

| Folder | Dostęp / Access |
|--------|--------|
| `_context/` | READ-ONLY (without SME/PM approval / bez zgody SME/PM) |
| `_archive/` | READ-ONLY |
| `_projects/*/ _context/` | READ-ONLY (project owner / właściciel projektu) |
| `_outputs/` | WRITE |
| `_projects/*/ _outputs/` | WRITE (project team / zespół projektu) |

---

## 🚀 QUICK START — FIRST TASKS / QUICK START — PIERWSZE ZADANIA

### Task 1: Prepare a Weekly Report / Zadanie 1: Przygotuj Weekly Report

```
1. Open a terminal in VS Code / Otwórz terminal w VS Code
2. Run / Uruchom: /weekly-report
3. Follow the instructions / Postępuj zgodnie z instrukcjami
4. Verify the output in / Zweryfikuj output w `_projects/Fieldcraft Weekly Reports/_outputs/_drafts/`
```

### Task 2: Check project status / Zadanie 2: Sprawdź stan projektu

```
1. Run / Uruchom: /rtam-manage dashboard
2. Open the generated HTML / Otwórz wygenerowany HTML
3. Review project statuses (Active/Dormant/Critical) / Przejrzyj statusy projektów (Active/Dormant/Critical)
```

### Task 3: Get familiar with Beacon Pipeline / Zadanie 3: Zapoznaj się z Beacon Pipeline

```
1. Run / Uruchom: /beacon-report
2. Open the report in / Otwórz raport w `_projects/Beacon Pipeline/_output/_final/`
3. Review the tabs: Executive Summary, Beacon, Rugged, Integration / Przejrzyj zakładki: Executive Summary, Beacon, Rugged, Integration
```

---

## 📞 CONTACT AND SUPPORT / KONTAKT I WSPARCIE

| Rola / Role | Osoba / Person | Kontakt |
|------|-------|---------|
| Programme Manager | Wojciech Kajder | pm@vela.example |
| Group Leader & Project Owner | Tomasz Reda | group.lead@vela.example |
| AI Assistant | Claude (Cline SR) | Via VS Code / Przez VS Code |

---

## 📖 NEXT / DALEJ

1. **Git Workflow** → `_context/01_GITHUB_WORKFLOW_GUIDE.md`
2. **Setting up projects / Zakładanie projektów** → `_context/02_PROJECT_CREATION_GUIDE.md`
3. **Strategy Framework** → `_context/2026-04-22_Fieldcraft_strategy_2026_framework.md`
4. **Governance Model** → `_context/2026-04-22_Fieldcraft_governance.md`

---

**Last Updated:** 2026-09-06
**Owner:** Fieldcraft Programme Manager
**Review Cycle:** Quarterly
