# Team operating model — running AI-augmented delivery with a team, not one power user

Most AI-in-the-enterprise stories are about one capable person with a clever setup. They do not survive that person's calendar, let alone their departure. This folder is the other thing: the operating model that lets a *team* run AI-assisted delivery as a standard way of working, with onboarding, source control, project governance, and explicit rules for what the AI may and may not do.

> This is anonymised. The company (Vela Systems), the programme (Fieldcraft), products, and people are a fictional cast; the real version runs a live enterprise programme. No confidential employer, client, or strategy data is included. One internal deployment/promotion procedure is deliberately kept out of this public copy.

## What's here

| File | What it governs |
|------|-----------------|
| [`00_NEW_EMPLOYEE_ONBOARDING.md`](./00_NEW_EMPLOYEE_ONBOARDING.md) | First-30-minutes onboarding: the layered workspace model, tools, key documents, the weekly and monthly operating rhythm |
| [`01_GITHUB_WORKFLOW_GUIDE.md`](./01_GITHUB_WORKFLOW_GUIDE.md) | Source control for non-developers: protected main, PR-only changes, a commit-message convention, and how to recover from the usual mistakes |
| [`02_PROJECT_CREATION_GUIDE.md`](./02_PROJECT_CREATION_GUIDE.md) | When something is a project versus a task, the qualification criteria (strategy link, owner, deliverable, measurable KPI), and a scripted setup that registers it |
| [`03_AI_ASSISTANT_RULES.md`](./03_AI_ASSISTANT_RULES.md) | The operating contract for the AI itself: what it does, what it must never do, how it cites, and where it must stop and ask |
| [`05_WORKFLOW_GOVERNANCE.md`](./05_WORKFLOW_GOVERNANCE.md) | Treating pipeline stages as reusable, versioned modules with a catalogue, so work can be found and reused instead of rebuilt |

## Why this is the hard part, and the part that lasts

The models are the easy bit. What decides whether AI-assisted delivery survives in a real organisation is the boring scaffolding around it:

- **A hard line on what the AI is not allowed to do.** The assistant rules forbid single-option recommendations, forbid inventing KPI or pipeline numbers (missing data is flagged, not filled), and forbid touching governed context without approval. The interesting engineering is the restraint.
- **Governance a non-developer can actually follow.** Protected main and PR review, expressed for people whose job is not writing code, so the process holds instead of being bypassed under deadline.
- **A gate on project sprawl.** Explicit criteria for what earns a project folder, so an AI-accelerated team does not drown in half-finished initiatives.
- **Reuse over reinvention.** A stage catalogue so a pipeline step proven in one workflow gets reused in the next, with versioning that says whether a change can break its consumers.

Taken together, this is what turns "we ran an AI pilot" into "this is how the team works now." It is the same instinct as programme governance: design the operating model so the result outlives the person who set it up.

---

*Reference material by Wojciech Kajder. The underlying filesystem-as-orchestration method is credited to Van Clief & McDermott (see the [method playbooks](../)).*
