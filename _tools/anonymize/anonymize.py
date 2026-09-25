# -*- coding: utf-8 -*-
"""Anonymize the 5 reference method files: replace confidential Samsung terms with a
consistent fictional cast. COMMON replacements hit all files; RTAM_ONLY only the weekly file
(so 'Korean culture' in the C-Level file is preserved)."""
import re
from pathlib import Path

CTX = Path(r"C:\Repos\PROJEKTY-CLAUDE-MASTER\_context")

# (kind, pattern, replacement): kind 'lit' = literal substring, 're' = regex (word-boundary)
COMMON = [
    ("lit", "Samsung Electronics Poland", "Vela Poland"),
    ("lit", "Samsung Electronics", "Vela Systems"),
    ("lit", "Samsung Business Summit", "Vela Business Summit"),
    ("lit", "Samsung's", "Vela's"),
    ("lit", "Samsung B2B", "Vela B2B"),
    ("lit", "Samsung", "Vela"),
    ("lit", "SRPOL", "VLE"),
    ("lit", "Suwon", "Aurora HQ"),
    ("lit", "North KPIs", "core KPIs"),
    ("lit", "North KPI", "core KPI"),
    ("lit", "GMBT", "HQ leadership"),
    # people
    ("lit", "Jongmin", "Soo-jin"),
    ("lit", "Sean Yun", "Iga Malinowska"),
    ("lit", "Michała Piotrkowskiego", "Bartka Sowy"),
    ("lit", "Michałem Piotrkowskim", "Bartkiem Sową"),
    ("lit", "Michał Piotrkowski", "Bartek Sowa"),
    ("lit", "Michałem", "Bartkiem"),
    ("lit", "Michała", "Bartka"),
    ("lit", "Michał", "Bartek"),
    ("lit", "Mateusza Obidzińskiego", "Kuby Wilka"),
    ("lit", "Mateusz Obidziński", "Kuba Wilk"),
    # projects / teams
    ("lit", "Visual Displays", "Skyline Displays"),
    ("lit", "projekt CORE", "projekt CORAL"),
    ("lit", "project CORE", "project CORAL"),
    ("lit", "(CORE project)", "(CORAL project)"),
    ("lit", "(projekt CORE)", "(projekt CORAL)"),
    ("re", r"\bVD\b", "SKY"),
]

RTAM_ONLY = [
    # HQ location (in the C-Level file 'Korea' means the culture and must stay; here it means HQ)
    ("lit", "Korei", "Aurora HQ"),
    ("lit", "Korea", "Aurora HQ"),
    # clients
    ("lit", "AEAD", "Larkspur"),
    ("lit", "EssilorLuxottica", "Lumina Optics"),
    ("lit", "GSP Services", "Granite Services"),
    ("lit", "Erste", "Vermillion"),
    ("lit", "Verisure", "Sentinel Home"),
    ("lit", "Pekao", "Rivera Bank"),
    ("lit", "Koźmiński", "Aldridge"),
    ("lit", "Kozminski", "Aldridge"),
    ("lit", "IC Solutions", "Beacon Solutions"),
    ("re", r"\bNBP\b", "Nordbank"),
    ("re", r"\bAMS\b", "Orion"),
    # products
    ("lit", "Knox AI Assist", "AI Assist"),
    ("lit", "Knox Manage", "HerdManager"),
    ("lit", "Knox Suite", "GuardSuite"),
    ("lit", "Knox", "Guard"),
    ("re", r"\bKAI\b", "FleetPulse"),
    ("lit", "Enterprise Edition", "Pro Edition"),
    ("lit", "Microsoft Intune", "Contoso Manage"),
    ("lit", "Intune", "Contoso Manage"),
    ("lit", "Fully Rugged", "the Rugged line"),
    ("re", r"\bMFSS\b", "the SSO link"),
    # ids / labels
    ("lit", "PL202502190010", "DEAL-2026-0190"),
    ("lit", "BO ID", "deal ID"),
    ("lit", "BO Status", "Deal status"),
    ("lit", "BO:", "Deal:"),
    ("re", r"\bBOs\b", "deals"),
    ("re", r"\bBO\b", "deal"),
    ("lit", "SEPOL", "VL-PL"),
    ("re", r"\bVOC\b", "ticket"),
    # product ETS last (word-boundary, uppercase only)
    ("re", r"\bETS\b", "CarePlus"),
    ("re", r"\bEE\b", "Pro Edition"),
]

FILES = {
    "99_method_Minto_Pyramid.md": COMMON,
    "99_method_C-Level_KR_Communication.md": COMMON,
    "99_method_PwC_8_steps_presentation.md": COMMON,
    "99_source_paper_VanClief_2026_EN.md": COMMON,
    "99_method_RTAM_Weekly_Entry.md": COMMON + RTAM_ONLY,
}

for fname, rules in FILES.items():
    p = CTX / fname
    text = p.read_text(encoding="utf-8")
    total = 0
    for kind, pat, rep in rules:
        if kind == "lit":
            n = text.count(pat)
            if n:
                text = text.replace(pat, rep)
        else:
            new, n = re.subn(pat, rep, text)
            text = new
        total += n
    p.write_text(text, encoding="utf-8")
    print(f"{fname}: {total} replacements")
print("done")
