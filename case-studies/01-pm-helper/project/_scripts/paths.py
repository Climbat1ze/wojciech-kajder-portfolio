"""Jeden adres na rolę.

Wszystkie skrypty w tym workspace imporują ten moduł zamiast składać ścieżki u siebie. Bez
tego lokalizacje rozjeżdżają się między plikami, kiedy folder zostaje skopiowany gdzie indziej.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # workspace-template/

CANON = ROOT / "_context"
CONFIG = ROOT / "_config"
PROJECT_CONTEXT = CONFIG / "project_context.md"
CONTEXT_PROPOSALS = CONFIG / "context_proposals"
SETTINGS_JSON = CONFIG / "pm_settings.json"   # domeny "naszej strony", próg zaległości, strefa dat
TAGS_JSON = CONFIG / "tags.json"              # tagi wątków i plików — edytowane ręcznie

CONTEXT_SOURCES = ROOT / "_context_sources"
INPUT_ORIGINALS = ROOT / "_input" / "originals"

KB = ROOT / "_kb"
KB_MD = KB / "md"
KB_RUNS = KB / "_runs"
EVENTS_JSONL = KB / "events.jsonl"
DOCUMENTS_JSONL = KB / "documents.jsonl"
MESSAGES_JSONL = KB / "messages.jsonl"          # jedna wiadomość = jeden wiersz (także cytowana w wielu plikach)
THREADS_JSONL = KB / "threads.jsonl"            # pochodna: liczona od nowa z wiadomości i powiązań
THREAD_LINKS_JSONL = KB / "thread_links.jsonl"  # powiązania między wątkami: zaproponowane / zatwierdzone / odrzucone

AREAS = ROOT / "_areas"
OUTPUTS = ROOT / "_outputs"
FLOWS = ROOT / "_flows"


def stage_dir(flow: str, stage: str) -> Path:
    return FLOWS / flow / "stages" / stage


def stage_output(flow: str, stage: str) -> Path:
    return stage_dir(flow, stage) / "output"


def input_files(folder: Path) -> list[Path]:
    """Pliki wejściowe z folderu: bez ukrytych i tymczasowych (`.gitkeep`, `.DS_Store`, `~$plik.docx`, `Thumbs.db`),
    które nie są dokumentami i nie mogą trafić do bazy."""
    skip_names = {"thumbs.db", "desktop.ini"}
    return sorted(p for p in folder.glob("*")
                  if p.is_file() and not p.name.startswith((".", "~$")) and p.name.lower() not in skip_names)


def ensure(*dirs: Path) -> None:
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
