# Team roster (controlling file)

**Layer 3 — reference material.**

---

## Status: fill this in with your own team, or point elsewhere entirely

This file is the **default location** `_flows/build_kb/stages/03_validate` and
`_prompts/C_extraction.md` look at for "who is on the team". If your organization
already maintains a roster somewhere else (an HR export, an org-chart document),
you have two options: keep this file as a copy you update deliberately when the
other one changes, or repoint `ROSTER_FILE` in
`_flows/build_kb/stages/03_validate/_scripts/validate.py` at that other file
directly. Do **not** maintain both an external roster and a full copy here without
one of them being clearly the one source — that exact situation (a controlling
file and a silently-drifting copy) is the failure mode `_config/teamMembers.md`
exists to contain, and it is worse to have it happen to the roster itself.

## Format

A flat bullet list. A parenthesized nickname after a name is treated as an alias
of that name.

```
- Full Name
- Full Name (Nickname)
```

## Roster

*(empty — replace with your own team before running extraction; see
`_demo/_config/teamRoster.md` for a filled-in, fictional example)*

- 

---

**Consumed by:** `_flows/build_kb/stages/03_validate`, `_prompts/C_extraction.md`.
