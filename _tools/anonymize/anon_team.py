# -*- coding: utf-8 -*-
"""Anonymize the team-operating-model files (00,01,02,03,05) for the public portfolio.
Consistent fictional cast: Vela Systems / VLE / Fieldcraft / Aurora HQ, invented products & projects."""
import re
from pathlib import Path

D = Path(r"C:\Repos\wojciech-kajder-portfolio\reference\team-operating-model")
FILES = ["00_NEW_EMPLOYEE_ONBOARDING.md", "01_GITHUB_WORKFLOW_GUIDE.md",
         "02_PROJECT_CREATION_GUIDE.md", "03_AI_ASSISTANT_RULES.md", "05_WORKFLOW_GOVERNANCE.md"]

# (kind, pattern, replacement); order matters, specific first
R = [
    # emails first (before @samsung generic)
    ("lit", "w.kajder@ax.samsung.com", "pm@vela.example"),
    ("lit", "maciej.smyk@samsung.com", "group.lead@vela.example"),
    ("lit", "@ax.samsung.com", "@vela.example"),
    ("lit", "@samsung.com", "@vela.example"),
    ("lit", "docs.samsungknox.com/admin/", "docs.velaguard.example/admin/"),
    # people
    ("lit", "Maciej Smyk", "Tomasz Reda"),
    ("lit", "Beata Masperi", "Nadia Kern"),
    # org
    ("lit", "Samsung Electronics Poland", "Vela Poland"),
    ("lit", "Samsung Electronics", "Vela Systems"),
    ("lit", "Samsung", "Vela"),
    ("lit", "SRPOL", "VLE"),
    ("lit", "RTAM", "Fieldcraft"),
    ("lit", "Suwon", "Aurora HQ"),
    ("lit", "North KPIs", "core KPIs"),
    ("lit", "North KPI", "core KPI"),
    ("lit", "GMBT BD&P", "HQ BD&P"),
    ("lit", "GMBT", "HQ leadership"),
    # products
    ("lit", "Knox AI Assist", "AI Assist"),
    ("lit", "Knox Validation Program", "Guard Validation Program"),
    ("lit", "Knox Documentation", "Guard Documentation"),
    ("lit", "Knox Manage", "HerdManager"),
    ("lit", "Knox Suite", "GuardSuite"),
    ("lit", "Knox", "Guard"),
    ("re",  r"\bKVP\b", "GVP"),
    ("re",  r"\bKDP\b", "GDP"),
    ("re",  r"\bKAI\b", "FleetPulse"),
    ("lit", "Enterprise Edition", "Pro Edition"),
    ("lit", "Microsoft Intune", "Contoso Manage"),
    ("lit", "Intune", "Contoso Manage"),
    ("re",  r"\bMFSS\b", "the SSO link"),
    ("lit", "Galaxy S23", "Vela F23"),
    ("lit", "Galaxy S26", "Vela F26"),
    ("lit", "Galaxy Fleet", "Field Fleet"),
    ("lit", "Galaxy", "Vela Field"),
    ("lit", "A-Series", "Fleet Series"),
    ("lit", "Apple win-back", "rival-brand win-back"),
    ("lit", "Apple", "the rival brand"),
    ("re",  r"\bNPC\b", "SMB Line"),
    ("re",  r"\bETS\b", "CarePlus"),
    # projects / tags
    ("lit", "KOP Pipeline", "Beacon Pipeline"),
    ("lit", "kop-report", "beacon-report"),
    ("lit", "kop-sponsor", "beacon-sponsor"),
    ("re",  r"\bKOP\b", "Beacon"),
    ("lit", "EssilorLuxottica", "Lumina Optics"),
    ("lit", "Fully Rugged", "Rugged Portfolio"),
    ("lit", "BEC Deal Acceleration", "Enterprise Deal Acceleration"),
    ("re",  r"\bBEC\b", "EDA"),
    ("lit", "RDS Cooperation", "Systems Cooperation"),
    ("re",  r"\bRDS\b", "Systems"),
    ("re",  r"\bEL\b", "LO"),
]

for f in FILES:
    p = D / f
    text = p.read_text(encoding="utf-8")
    total = 0
    for kind, pat, rep in R:
        if kind == "lit":
            n = text.count(pat); text = text.replace(pat, rep)
        else:
            text, n = re.subn(pat, rep, text)
        total += n
    p.write_text(text, encoding="utf-8")
    print(f"{f}: {total} replacements")
print("done")
