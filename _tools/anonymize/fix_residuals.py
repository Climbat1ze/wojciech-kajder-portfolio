# -*- coding: utf-8 -*-
"""Fix two residual leaks found by the portfolio-wide grep:
   1. 'Galaxy S23/S26' brand in the Fieldcraft Weekly file (both repos).
   2. Samsung proprietary font names in PM Helper CSS/HTML (portfolio only)."""
from pathlib import Path
import re

# --- 1. Galaxy -> fictional, in both copies of the Fieldcraft Weekly file
galaxy_files = [
    Path(r"C:\Repos\wojciech-kajder-portfolio\reference\99_method_Fieldcraft_Weekly_Entry.md"),
    Path(r"C:\Repos\PROJEKTY-CLAUDE-MASTER\_context\99_method_Fieldcraft_Weekly_Entry.md"),
]
galaxy_map = [
    ("Galaxy S23 to S26", "Vela F23 to F26"),
    ("Galaxy S23", "Vela F23"),
    ("Galaxy S26", "Vela F26"),
    ("S23 → S26", "F23 → F26"),
    ("S23 to S26", "F23 to F26"),
    ("the S26 cycle", "the F26 cycle"),
    ("S26 cycle", "F26 cycle"),
    ("Galaxy", "Vela Field"),
]
for p in galaxy_files:
    if not p.exists():
        print(f"MISSING {p}"); continue
    t = p.read_text(encoding="utf-8"); n = 0
    for a, b in galaxy_map:
        n += t.count(a); t = t.replace(a, b)
    p.write_text(t, encoding="utf-8")
    print(f"{p.name} [{p.parent.parent.name}]: {n} galaxy replacements")

# --- 2. Samsung font names -> generic, across the PM Helper case study (portfolio)
pmroot = Path(r"C:\Repos\wojciech-kajder-portfolio\case-studies\01-pm-helper")
font_map = [
    ('"Samsung Sharp Sans",', ''),
    ('"SamsungOne",', ''),
    ('"Samsung Sharp Sans"', '"Poppins"'),   # safety if no trailing comma
    ('"SamsungOne"', '"Inter"'),
]
count = 0
for p in list(pmroot.rglob("*.html")) + list(pmroot.rglob("*.css")):
    t = p.read_text(encoding="utf-8"); n = 0
    for a, b in font_map:
        n += t.count(a); t = t.replace(a, b)
    if n:
        p.write_text(t, encoding="utf-8"); count += 1
        print(f"font-scrub {p.relative_to(pmroot)}: {n}")
print(f"done ({count} files touched for fonts)")
