# -*- coding: utf-8 -*-
"""Replace the RTAM programme acronym with the fictional 'Fieldcraft' in both repos."""
from pathlib import Path

targets = [
    r"C:\Repos\PROJEKTY-CLAUDE-MASTER\_context\99_method_RTAM_Weekly_Entry.md",
    r"C:\Repos\PROJEKTY-CLAUDE-MASTER\_context\99_method_PwC_8_steps_presentation.md",
    r"C:\Repos\PROJEKTY-CLAUDE-MASTER\_context\99_method_C-Level_KR_Communication.md",
    r"C:\Repos\wojciech-kajder-portfolio\reference\99_method_RTAM_Weekly_Entry.md",
    r"C:\Repos\wojciech-kajder-portfolio\reference\99_method_PwC_8_steps_presentation.md",
    r"C:\Repos\wojciech-kajder-portfolio\reference\99_method_C-Level_KR_Communication.md",
    r"C:\Repos\wojciech-kajder-portfolio\reference\README.md",
]
for t in targets:
    p = Path(t)
    text = p.read_text(encoding="utf-8")
    n = text.count("RTAM")
    p.write_text(text.replace("RTAM", "Fieldcraft"), encoding="utf-8")
    print(f"{p.name}: {n} replacements")
print("done")
