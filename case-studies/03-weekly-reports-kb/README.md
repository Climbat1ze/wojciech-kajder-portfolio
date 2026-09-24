# Case study: Weekly Reports Knowledge Base — the report is disposable, the index is the asset

Most AI reporting tools hand you a nicer version of last week's status report and forget it the moment it renders. This one does the opposite: it turns each week's recurring status documents into a searchable, cited knowledge base, and generates the reports from that index rather than from a template. The weekly document is disposable. What accumulates, and what you can still query a year later, is the base underneath it.

> Everything in [`project/_demo/`](./project/_demo/) is invented: a fictional client-support team ("Lighthouse Program") at a fictional device vendor ("Meridian Systems"), with made-up clients, people, and numbers. No real data is included.

## The problem it solves

A team writes the same kind of status update every week. The information is real and valuable, and it evaporates. Six months later, "which engagements touched public-sector logistics, and what did we actually do for them" is an afternoon of scrolling through old documents, if the answer is recoverable at all. The weekly report format optimises for this week and loses everything else.

## What makes it durable

1. **A flat, typed index is the product.** Every activity becomes one row in `activities.jsonl` (15 fields: client, category, value dimension, dates, and a verbatim `activity` string). Reports are generated from that index by script, so old data answers new questions. You are not locked into the one report shape someone designed at the start.
2. **Retrieval is cited, not vibes.** A question answered from the base ([`answer_example.md`](./project/_demo/_flows/query_kb/stages/01_answer/output/answer_example.md)) carries a citation back to the `entry_id` behind every claim. An executive can trace any statement to its source line. This is the difference between a search tool you can put in front of a sponsor and one you cannot.
3. **Entities are resolved once, by a human when unsure.** Each client is resolved to one category in a registry (`_kb/_registry/clients.md`), reused verbatim thereafter instead of re-guessed. The one case the model was not confident about is parked as `TBD` in `pending_review.md` for a person to decide, not silently forced into the nearest bucket.
4. **A controlled taxonomy stops drift.** Categories live in one governed vocabulary (`_context/20_taxonomy.md`). A value outside it is a validation error, not a quietly accepted new variant. This is the discipline that keeps a knowledge base usable past month three.

## Proof, and honesty about its limits

This is where a sceptical buyer should look hardest. The demo is explicit about what actually executed and what was staged:

- Everything from the indexing stage onward **really ran**: the scripts merged the entries, made a real category decision per entity, wrote the real `activities.jsonl`, filtered it for a query, and generated two personal reports and three topic reports straight from the index.
- The earliest stage was **hand-built to the exact schema the scripts expect** (the demo uses plain-text sources instead of real email/Word files), with real, verifiable SHA-256 hashes over each activity string.

A reference that tells you precisely which parts ran and which were staged, and why, is worth more than a polished demo that hides the seams. It also names what it deliberately left out (an organisation-specific KPI report pipeline that would not generalise), because a reference implementation should be honest about scope.

## Why this matters to someone who has seen the pilots

The reason AI pilots die is that they produce artifacts, not assets. A slide deck, a one-off summary, a demo. This produces an asset that compounds: a queryable, cited record of what the team did, that survives reorganisations and tooling changes because it is a folder of plain files with a documented schema. The instinct on display is the one that matters in programme delivery: build the thing that is still useful in month twelve, and be honest about where the seams are.

## Explore

- [`project/README.md`](./project/README.md) — the method and how to adopt it.
- [`project/_demo/CLAUDE.md`](./project/_demo/CLAUDE.md) — a guided tour, including exactly what ran vs. what was staged.
- [`project/_demo/_kb/activities.jsonl`](./project/_demo/_kb/activities.jsonl) — the index that everything is generated from.
- [`project/_demo/_outputs/`](./project/_demo/_outputs/) — reports generated from the index (per-person and per-topic).

---

*Case study by Wojciech Kajder. The tool is original work; the underlying filesystem-as-orchestration method is credited to Van Clief & McDermott (see the [reference materials](../../reference/)).*
