# Interpretable Context Methodology: Folder Structure as Agent Architecture

> **Reference material (Layer 3 — "the factory", stable between runs).**
> This is the **source paper** of the method, not Wojtek's interpretation. Authors: **Jake Van Clief, David McDermott** (Eduba, University of Edinburgh). The method described in the paper is called the **Model Workspace Protocol (MWP)**; in PROJEKT BIZNES we refer to it as **ICM** (after the paper title and the author's handle).
>
> **Attribution (absolute rule):** ICM/MWP is Van Clief's concept. Wojtek is an adopter / operationalizer / propagator, NOT the author.
>
> Source: arXiv (cited in the project as 2603.16021) · Licence: MIT · Repo: https://github.com/RinDig/Model-Workspace-Protocol-MWP-
> English rendering of the project's PDF→MD conversion.

---

## Abstract

Current approaches to orchestrating AI agents usually rely on building multi-agent frameworks that manage context passing, memory, error handling, and step coordination in code. These frameworks work well for complex, concurrent systems. But for **sequential workflows in which a human reviews the output at every step**, they introduce engineering overhead the problem does not require.

The paper presents the **Model Workspace Protocol (MWP)** — a method that replaces framework-level orchestration with **filesystem structure**. Numbered folders represent stages. Plain markdown files carry the prompts and context that tell a single AI agent what role to play at each step. Local scripts handle the mechanical work that does not need AI. The result: a system in which one agent — reading the right files at the right moment — does work that would otherwise require a multi-agent framework.

The approach applies ideas from Unix pipeline design, modular decomposition, multi-pass compilation, and literate programming to the specific problem of structuring context for AI agents. The protocol is open source under the MIT licence.

**CCS Concepts:** Human-centered computing → Interactive systems and tools; HCI design and evaluation methods; Computing methodologies → Artificial intelligence; Software and its engineering → Software design engineering.

**Keywords:** context engineering, human-AI interaction, AI agent orchestration, filesystem architecture, human-in-the-loop, mixed-initiative systems, workflow automation.

---

## 1. Introduction

There are genuinely good agent frameworks today: CrewAI, LangChain, AutoGen and others handle multi-step orchestration, memory management, tool use, and error recovery. They work. But they work inside their own structures, and adapting those structures requires development work. Reordering steps, swapping a prompt, adding or removing a stage, skipping something irrelevant today — these actions usually mean editing code, understanding abstractions, and redeploying. For practitioners whose workflows are sequential and require human review at every step, the control surface can be far simpler.

The central observation is simple: if the prompts and context for each stage of a workflow already exist as files in a well-organized folder hierarchy, **you don't need a coordination framework** to manage many specialized agents. You need **one orchestrating agent** that reads the right files at the right moment. The folder structure tells it what to do at each step, and if the agent delegates sub-tasks, the same folder structure determines what context the sub-agents receive. Local Python scripts handle the parts that don't need AI: fetching data, moving files, formatting output, sending email.

This is a step back in order to move forward. The principles that made Unix pipelines effective in the 1970s and multi-pass compilers feasible in the 1980s apply directly to AI agent orchestration in the 2020s.

> **Programs that do one thing. The output of one becomes the input of another. Plain text as a universal interface.** These ideas are over fifty years old and hold up well.

The paper's central question: how does structuring the context-delivery mechanism as a filesystem hierarchy affect a practitioner's ability to control, inspect, and edit the behaviour of an AI agent in multi-step workflows — and what does that structure mean for the quality of the model's output at each stage?

---

## 2. Background and related work

### 2.1 Composability and the Unix tradition

In 1978, Doug McIlroy articulated the principles that define the Unix design philosophy: each program does one thing well; the output of each program should become the input of another; text streams are the universal interface between programs. These were not theories — they were engineering decisions forced by constraints (PDP-11 machines had little memory; programs had to be small).

Kernighan and Pike later argued that the power of Unix comes more from the **relationships between programs** than from the programs themselves. Eric Raymond codified this into explicit design rules: the Rule of Modularity (simple parts connected by clean interfaces), the Rule of Transparency (design so that inspection and debugging are easy), the Rule of Composition (design programs to be connected together).

The principles were formalized as the **"pipe-and-filter"** pattern (Shaw and Garlan): a system of independent components, each reading from inputs and writing to outputs, connected by data streams. The pattern's strength: each component can be swapped, inspected, or tested independently.

A related line runs through build systems. Stuart Feldman's **Make** (1979): workflows as dependency graphs between files. The key insight — **files are both work artifacts and the coordination mechanism** between stages. You don't need a separate orchestration layer when the filesystem tracks what has been produced and what depends on what. Multi-pass compilers work on the same principle.

David Parnas (1972): systems should be decomposed by **what each module hides** from the rest of the system. Dijkstra coined the term "separation of concerns".

These ideas recur across decades because they describe something real about how systems stay manageable as they grow. They matter because AI agent orchestration is, at its core, a problem of modular decomposition, clean interfaces, and readable intermediate representations.

### 2.2 Context engineering and agentic AI

The practitioner community has adopted the term **"context engineering"**. Andrej Karpathy (June 2025): "prompt engineering" doesn't capture the full scope of the work. Prompt engineering suggests a single instruction; context engineering describes the broader discipline of filling the context window with the right information: instructions, retrieved knowledge, memory, tool descriptions, prior outputs — all structured so the model can use it effectively.

Lance Martin (LangChain) formalized this into a taxonomy of strategies: **write** (author instructions), **select** (choose relevant context), **compress** (reduce token waste), **isolate** (keep unrelated context separate). Simon Willison: the whole information environment, including the model's previous responses and system state, is part of the context that requires engineering.

The current generation of frameworks (LangChain, AutoGen, CrewAI) handles context engineering through code-level abstractions. This works well for systems that require dynamic multi-agent collaboration, concurrency, or complex branching logic. But for **sequential workflows** these frameworks solve a coordination problem that may not need to exist. If Agent A's job is research, B is filtering, C is writing, the framework's role is to pass the right context to the right agent at the right time. That coordination can equally well be achieved by **putting the right files in the right folders**. The coordination logic lives in the filesystem, not in application code.

This matters because of how models handle context. Liu et al. showed that LLMs perform significantly worse when relevant information is buried **in the middle** of long contexts ("lost in the middle"). Jiang et al. showed that prompt compression can yield up to 20× token reduction with minimal quality loss — but the simpler approach is to **not load** the irrelevant context in the first place. **Loading stage-specific context** (each stage sees only the files it needs) prevents the problem instead of curing it after the fact.

**MWP vs MCP distinction:** MCP (Anthropic) standardizes how models access external tools and data — it solves the integration problem. MWP addresses a different layer: how to structure and deliver context to an agent in a multi-step workflow. They are complementary — an MWP stage can use MCP connections, and the stage's folder structure determines what context the agent receives. Jones and Kelly (Anthropic): loading all tool definitions upfront slows agents and raises cost; MWP's stage architecture avoids this by scoping tool definitions to individual stages.

### 2.3 Human oversight and observability

- **Fails and Olsen (2003):** the interactive machine-learning paradigm — fast cycles of output → human feedback → correction.
- **Amershi et al.:** interactive ML must engage users at all stages; interfaces should support steering and correction.
- **Horvitz (mixed-initiative):** systems should let users invoke, tune, and interrupt automated processes at natural points; this requires visibility of state and reversibility of actions.
- **Parasuraman and Riley:** when outputs are opaque, people either trust them blindly (misuse) or stop using them (disuse) — both stem from the human not seeing what happened between input and output.
- **Shneiderman (Human-Centered AI):** high human control and high automation are not in tension — they reinforce each other when the system is understandable, predictable, and controllable.
- **Cynthia Rudin (the strongest version of the argument):** stop building opaque systems and explaining them after the fact — build systems that are **inherently interpretable**. A production pipeline in which every intermediate output is a readable file is inherently interpretable. There is nothing to explain, because nothing was hidden.
- **EU AI Act:** requires human oversight of high-risk systems, distinguishing human-in-the-loop, human-on-the-loop, and human-in-command. Systems with staged review points, audit trails, and defined intervention surfaces have a practical advantage.

---

## 3. The Model Workspace Protocol

### 3.1 Design principles (five)

1. **One stage, one job.** Each stage handles a single step and writes output to its own folder (McIlroy + Parnas's information hiding). A stage that fetches data does not also filter it; a stage that filters does not also format the final output.
2. **Plain text as interface.** Stages communicate through markdown and JSON files. No binary formats, database connections, or proprietary serialization (Kernighan and Pike: text is the universal interface). Any tool that reads text can participate; any human with a text editor can inspect or modify any artifact.
3. **Layered context loading.** Agents load only the context needed for the current stage (less irrelevant context = better model quality). This is **prevention, not compression**. Within the content layers, MWP further distinguishes reference material (stable rules) from working artifacts (per-run content) — they require different kinds of attention.
4. **Every output is an edit surface.** Each stage's intermediate output is a file a human can open, read, edit, and save before running the next stage (Horvitz + Shneiderman's direct manipulation).
5. **Configure the factory, not the product.** The workspace is configured once (preferences, brand, style, structural decisions). Then each run of the pipeline produces a new deliverable using the same configuration (the continuous-delivery principle: production pipelines should be repeatable).

### 3.2 Architecture — the five-layer context hierarchy

An MWP workspace is a folder. Inside it, agents navigate a five-layer context hierarchy:

| Layer | File | Question | Role | ~tokens |
|-------|------|----------|------|---------|
| **0** | `CLAUDE.md` | "Where am I?" | Global identity: which workspace, what the structure contains, where to find things | ~800 |
| **1** | `CONTEXT.md` (root) | "Where do I go?" | Workspace-level task routing: which stage handles the task + shared resources | ~300 |
| **2** | `CONTEXT.md` (stage) | "What do I do? What are the rules?" | Stage contract: inputs / process / outputs of one step | 200–500 |
| **3** | Reference material | "What do I work with (stable)?" | Reference material (**"the factory"**): stable between runs | 500–2k |
| **4** | Working artifacts | "What do I work with (this run)?" | Working artifacts (**"the product"**): unique per run | variable |

Layers 0–2 = **structure (routing)**. Layers 3–4 = **content (factory / product)**.

**Layer 3 vs Layer 4** (the key distinction):

| | Layer 3: Reference | Layer 4: Working |
|---|---|---|
| Changes between runs | No | Yes |
| Example files | `voice.md`, `design-system.md`, `conventions.md` | `research-output.md`, `script-draft.md` |
| The model should | Internalize as constraints | Process as input |
| Configured during | Workspace setup (once) | Pipeline execution (each run) |
| Location | `references/`, `_config/`, `shared/` | `output/` |
| Analogy | **The recipe** | **The ingredients** |

Mixing stable rules with per-run artifacts in an undifferentiated context window forces the model to sort them out itself. Separating them in the folder structure means the model receives **already-organized context**. No agent reads everything (e.g., a rendering agent needs only L0–L2; a script-writing agent descends to L4).

**Typical workspace folder structure:**

```
workspace/
├── CLAUDE.md                    ← Layer 0
├── CONTEXT.md                   ← Layer 1
├── stages/
│   ├── 01_research/
│   │   ├── CONTEXT.md           ← Layer 2
│   │   ├── references/          ← Layer 3
│   │   └── output/              ← Layer 4
│   ├── 02_script/
│   │   ├── CONTEXT.md           ← Layer 2
│   │   ├── references/          ← Layer 3
│   │   └── output/              ← Layer 4
│   └── 03_production/
│       ├── CONTEXT.md           ← Layer 2
│       ├── references/          ← Layer 3
│       └── output/              ← Layer 4
├── _config/                     ← Layer 3
├── shared/                      ← Layer 3
└── setup/
    └── questionnaire.md
```

**Numbering encodes execution order. Folder boundaries enforce separation of concerns.** The `output/` directories are Layer 4 handoff points (stage 01's output becomes available as input to 02). If a human edits a file in `01_research/output/` before running stage 02, the agent picks up the edited version.

**Layer 2 is the control point of the whole system.** Each stage contract contains an Inputs table that specifies exactly which files from Layer 3/4 the agent should load and which sections are relevant. Without this scoping mechanism the agent would either load everything or rely on its own judgment. The Inputs table makes selection explicit, editable, and auditable.

> This is the filesystem doing the work a framework would otherwise do in code. **Stage sequencing = folder numbering. Context scoping = folder hierarchy. State management = files on disk. Coordination = one folder's output being another's input.**

**Context-window composition:** L0–L2 together ~1,300–1,600 tokens; L3 adds 500–2,000; L4 variable, rarely exceeding a few thousand when the previous stage did its condensation work. Total per stage typically **2,000–8,000 tokens** — well within the range where models perform best. A monolithic approach (all instructions, all reference material, all previous outputs in one prompt) easily reaches **30,000–50,000 tokens**, entering the "lost in the middle" degradation range. In MWP those tokens are never loaded.

Richard Gabriel: systems that prioritize simplicity of implementation over completeness of features tend to survive and spread (easier to port, understand, incrementally improve). MWP trades the flexibility of a programmable orchestrator for the portability, inspectability, and editability of plain files. **That trade is the point.** (Analogy to Plan 9: "everything is a file" taken to its conclusion — MWP applies the idea to AI workflows: all state, context, instructions exist as files in a namespace of folders.)

### 3.3 Stage contracts and handoffs

Each stage defines a **three-part contract**: what it reads (inputs), what it does (process), what it writes (outputs) — recorded in the stage's `CONTEXT.md`. A typical contract:

```markdown
## Inputs
- Layer 4 (working):   ../01_research/output/
- Layer 3 (reference): ../../_config/voice.md
- Layer 3 (reference): references/structure.md

## Process
Write a script based on the research output.
Follow the structure in structure.md.
Match the tone described in voice.md.

## Outputs
- script_draft.md -> output/
```

The agent reads `CONTEXT.md`, executes the instructions, writes output. The human reviews what landed in `output/`. If needed — they edit the file directly. The next stage reads whatever is there.

This implements **prompt chaining at the filesystem level** (Wu, Terry, Cai — AI Chains: transparent, controllable workflows where each step's output becomes the next step's input). In MWP the chain is a sequence of folders, and the links between them are plain files. Stage outputs serve as **intermediate representations**: each is a complete, readable artifact.

There is something of Knuth's **literate programming** here: the markdown files instructing the agent are simultaneously the documentation that tells a human what the stage does. The instruction set and the documentation are the same artifact — the workspace is self-documenting. Wei et al.: breaking complex reasoning into intermediate steps dramatically improves LLM quality — MWP applies this architecturally.

**Review gates:** each stage gets its own context (L0–4), writes output to its folder, and a human reviews and optionally edits before the next stage reads it. The same model executes each stage; the folder structure controls what context it receives.

### 3.4 Portability and reproducibility

A workspace is a folder. It can be copied to another machine, committed to Git, sent as a zip, synced over the cloud. It carries its own prompts, context structure, stage definitions. No server to configure, no environment to replicate, no deployment step.

MWP workspaces are **Git-compatible by default**: every prompt change, output edit, config correction is diffable and reversible. This is **infrastructure as code** applied to AI workflows — the workspace definition IS the system. The practical meaning: if a consultant builds a workspace for a client's weekly reporting workflow, handing it over = copying the folder. The client runs it, edits prompts, adjusts stages without involving a developer.

---

## 4. Working deployments

### 4.1 Model and environment

All workspaces developed and run in **Claude Code with Claude Opus 4.6** as the primary agent. For sub-tasks within stages, Opus 4.6 delegates to **Claude Sonnet 4.6** via Agent Teams. An important detail: Opus 4.6 uses the workspace's own context files (the `CONTEXT.md` hierarchy + L3 material) to fill in prompts for sub-agents. **The folder hierarchy is simultaneously the human control surface and the model's orchestration logic.**

MWP is **model-agnostic** by design — it specifies folder structure, file formats, naming conventions, and does not depend on any model-specific capability. No vendor lock-in (though output equivalence across models is an empirical question).

### 4.2 The Script-to-Animation pipeline

The first workspace: topic → a working animated film, in three stages.
- **Stage 1 (`01_research`):** topic → structured research (key points, narrative angles, supporting data).
- **Stage 2 (`02_script`):** research → script; `CONTEXT.md` points to a voice guide and a structural template in `_config/`.
- **Stage 3 (`03_production`):** script → animation specifications + working Remotion code (a React-based framework for programmatic video); the context includes design guidelines, colour palettes, animation conventions.

At each boundary a human reviews the output. The whole thing runs in **a single Claude Code session**. One orchestrating agent (Opus 4.6) manages the pipeline, delegating sub-tasks to faster sub-agents (Sonnet 4.6). In compiler terminology: the workspace performs a **multi-pass compilation**.

### 4.3 Training-deck production

The second workspace: unstructured source material (PDFs, papers, notes, sketches) → polished PowerPoint decks, in five stages: content extraction → structural planning → slide draft → design specification → final assembly. The five-stage structure matters because deck production requires human judgment at several points. The structural plan (stage 2's output) determines the whole arc of the presentation — exposing it as an editable markdown file before drawing slides allows correction where correction is cheapest and most effective.

### 4.4 Building new workspaces

MWP includes a **workspace-builder**: a five-stage workspace whose output is a new workspace. It goes through discovery (what domain, what workflow) → stage mapping (where the natural split points are) → scaffolding (creating the folder structure) → questionnaire design → validation (does the pipeline work end-to-end). The builder itself follows MWP conventions and enforces them on the workspaces it produces. Practitioners can create workspaces for their own domains without understanding the conventions in detail.

MWP workspaces have been adopted outside the author's organization — the Neuropolitics Lab (University of Edinburgh), ICR Research, the Academy of International Affairs in Bonn (details under NDA). A preliminary answer to the reviewer's question "does MWP work when someone other than the designer builds and operates it": yes — in academic research, policy analysis, and content production.

### 4.5 Early practitioner experience

Observations from an invitation-only community of **52 members** (from AI engineers to business owners, content creators, researchers). These are practitioner reports, not controlled studies.

**The U-shaped intervention pattern (the most consistent observation).** Of 33 members using the script-to-animation workspace, **30 report a U-shaped pattern**: heavy editing at stage 1 (setting direction), light in the middle, heavy again at the end (aligning with earlier decisions). The other 3 — roughly equal editing throughout.

- Edit frequency: Stage 1 ~92%, Stage 2 (middle) ~30%, Stage 3 ~78%.
- **Two peaks = two kinds of editing.** Stage 1 = directional (creative judgment — narrowing from broad possibilities to a specific angle). The final stage = alignment work (closer to debugging — checking that the output faithfully represents earlier decisions).
- The middle gets the lightest touch because it sits between well-defined anchors (the earlier stage's output sets direction; the L3 reference material constrains execution).

**Other patterns:**
- **Prompt editing by non-technical users** — people with no development experience effectively modify stage behaviour by editing `CONTEXT.md` files (tuning tone, adding constraints like "keep scripts under 90 seconds", shifting emphasis). In a framework this would require a developer.
- **Accessibility** — three members with no coding experience and no prior exposure to Claude Code used the workspace-builder to create and run workspaces producing 10-minute animations.
- **Workspace duplication** — users copy a working folder and modify the prompts for a different format (as Unix users build new scripts by modifying existing ones).

### 4.6 Threats to validity

- Data collection is **informal** — observations from conversations, not structured interviews, diaries, or instrumented logging.
- The community is invitation-only and self-selecting → selection and enthusiasm bias. The U-pattern (30/33) is self-reported, not verified by controlled measurement.
- Most active use is concentrated in content production; the academic/policy deployments are early.
- Tested on only one model family (Claude Opus 4.6 + Sonnet 4.6). Cross-model evaluation is the natural next step.
- **No controlled comparison** of MWP vs monolithic prompting on the same tasks — the quality-improvement claim rests on the "lost in the middle" literature and practitioner judgment, not on measured effects.

---

## 5. Discussion

### 5.1 Where it works

Sequential multi-step workflows where a human reviews the output at each stage. The common thread across the deployments (content production, training materials, research workflows, policy analysis): they are **sequential** (step 2 follows step 1), **reviewable** (a human should check each step's output), and **repeatable** (the same pipeline runs weekly/daily with different input). For this class, MWP delivers full orchestration capability without framework code, server infrastructure, or a developer in the daily loop.

### 5.2 Where it does NOT work

- **Real-time multi-agent collaboration** (agents communicating dynamically in tight loops) — requires message-passing infrastructure (AutoGen). MWP's file handoffs are too slow.
- **High-concurrency systems** (many users hitting the same pipeline at once) — need queueing, state isolation, deployment infrastructure. MWP is local-first.
- **Workflows with complex branching logic based on AI decisions mid-pipeline** — awkward in MWP. A human can branch between stages (run 3a instead of 3b based on what they see), but automatic branching would push MWP toward becoming a framework.

> The claim is NOT "MWP replaces existing tools across the board". It is: for a large, common class of workflows, existing tools deliver more complexity than the problem requires — and that complexity has real costs: opacity, brittleness, developer dependency, overhead that slows iteration.

### 5.3 Observability as a side effect

The most useful property of MWP may be the one not designed as a feature. Because every intermediate output is a plain file, **the system is observable by default** — there is no logging layer to build, no dashboard to configure. You open the folder and read the files. MWP is a **glass-box AI workflow** (Rudin): it did not become transparent by adding an explanation layer — it was never opaque. Guaranteed compliance with human-AI guidelines (Amershi et al.): stage contracts make capabilities explicit; markdown files support effective correction; review gates support effective rejection. Convergence with the EU AI Act's oversight requirements (staged review, audit trails, intervention points) as a by-product of the architecture.

### 5.4 Implications for the design of intelligent systems

The core mechanism is **context scoping**: by delivering different context to the same model at each stage, MWP changes the task the model performs. The model's capabilities do not change — what changes is the information it has available. The L3/L4 distinction adds a dimension: reference material says "here are the rules, follow them"; working artifacts say "here is the input, transform it". Delivering them as structurally separate context gives the model clearer signals.

**Open questions:** (1) does the five-layer hierarchy generalize across model families, or is it tuned to the attention patterns of the tested models? (2) as context windows grow, does selective loading become less important? (if a model reliably handles 200k tokens without degradation, the engineering argument weakens — but the human-interaction arguments remain); (3) how sensitive is stage output quality to the ordering and formatting of context within a layer?

---

## 6. Future directions: compilation, debugging, source integrity

### 6.1 MWP as incremental multi-pass compilation

A closer analogy than Unix pipelines: **multi-pass compilation**. A multi-pass compiler transforms code through a sequence of passes (lexer → tokens; parser → syntax tree; semantic analysis → annotations; optimization → rewrite; code generation → output). MWP does the same with content: Stage 1 (research) transforms a brief into structured research; Stage 2 (script) research into a script; Stage 3 (production) script into animation specs. **Incremental compilation** = recompiling only the changed parts — MWP supports this by default: if the research is fine but the script needs rework, the practitioner re-runs stage 2 without touching stage 1. The Inputs table declares the dependencies; a changed file signals that a stage's output may be stale.

### 6.2 Toward semantic debugging

MWP currently provides observability but **not traceability**. If a phrase in stage 3's output reads badly, there is no direct way to trace it back to a specific instruction / reference file / previous stage's output. The practitioner does this manually. Directions:
- **Provenance by identifiers** — each output section would carry an identifier linking to the source instruction/file (the equivalent of debug symbols / source maps: GUIDs, section tags, annotations).
- **Cross-stage trace verification** — in script-to-animation, a recurring problem is drift between the animation spec (stage 3) and the script (stage 2). The current solution: an audit file forcing the agent to trace from the spec back to the original script. This is a **proto-debugger**. The pattern can be generalized: a stage contract could include a **Verify** section alongside Inputs/Process/Outputs, specifying which earlier outputs to check and by what criteria.
- **Breakpoints in markdown** (the most speculative) — a breakpoint in `CONTEXT.md` saying "after processing this instruction, show what the agent produced before continuing". It turns a single stage run into a sequence of verifiable sub-steps.

### 6.3 Source integrity and the Edit-Source principle

The paper describes review gates as places where practitioners edit stage output. But there is an argument (from software-engineering practice): it is the **source files that should improve over time**, and editing output is treating symptoms, not causes.

If a script reads badly at stage 2: (a) edit the script directly — fixes this run; (b) ask why it reads badly and trace it to the source (voice guide underspecified? stage contract emphasizing the wrong quality? did stage 1's research frame the topic wrong?) — fixes every future run. In compiler terms, editing output is **patching the binary**.

**The tension is real:** creative content is fuzzier than compiled code — sometimes output needs a human touch that cannot be reduced to a source rule (and then editing output is right). But there is a class of **diagnostic** edits: if a practitioner consistently shortens the opening paragraph, that is a signal the contract should say "keep the opening under three sentences". A future version of MWP could **track output edits across runs** and suggest a source-level change (a contract fix, a reference-file update). This closes the loop between editing output and improving the source — turning one-off fixes into permanent system improvements. **If workspaces improve their own source files over time, they become systems that get better with use.**

---

## 7. Conclusion

The principles that made Unix pipelines effective in the 1970s apply to AI agent orchestration in the 2020s: programs that do one thing; the output of one as the input of another; plain text as a universal interface; readable intermediate state.

MWP applies them to a specific problem: structuring context for AI agents in multi-step workflows. The result: **the folder structure replaces the framework**. One agent reads different context at each stage instead of many agents coordinating through code. Local scripts handle the mechanical work. Every intermediate output is a file a human can read and edit.

For practitioners whose AI workflows are sequential, reviewable, and repeatable, this means full pipeline capability without a framework to learn, a server to maintain, or a developer in the daily loop. A workspace is a folder — it can be copied, versioned, shared, and edited with a text editor. **The simplest viable architecture for this class of problem is the one that already exists on every computer: the filesystem.** The protocol is open source (MIT) and includes a workspace-builder for creating new workspaces in any domain.

---

## Bibliography (selected key references)

Full list of 54 entries in the original. Most relevant to the core method:

- **[1]** McIlroy, Pinson, Tague — *Unix Time-Sharing System: Foreword*, Bell System Technical Journal, 1978.
- **[5]** Kernighan, Pike — *The UNIX Programming Environment*, Prentice Hall, 1984.
- **[7]** Feldman — *Make — A Program for Maintaining Computer Programs*, 1979.
- **[9]** Parnas — *On the Criteria To Be Used in Decomposing Systems into Modules*, CACM, 1972.
- **[10]** Knuth — *Literate Programming*, The Computer Journal, 1984.
- **[11]** Gabriel — *The Rise of 'Worse is Better'*, 1991.
- **[12]** Pike et al. — *Plan 9 from Bell Labs*, 1995.
- **[16]** Karpathy — *+1 for 'context engineering' over 'prompt engineering'*, X, June 2025.
- **[17]** Martin — *Context Engineering*, LangChain Blog, July 2025.
- **[23]** Anthropic — *Introducing the Model Context Protocol*, Nov 2024.
- **[25]** Liu et al. — *Lost in the Middle: How Language Models Use Long Contexts*, TACL 2024.
- **[26]** Wu, Terry, Cai — *AI Chains*, CHI 2022.
- **[27]** Wei et al. — *Chain-of-Thought Prompting*, NeurIPS 2022.
- **[31]** Jiang et al. — *LLMLingua*, EMNLP 2023.
- **[43/44]** Shneiderman — *Human-Centered AI*, 2020 / OUP 2022.
- **[45]** Rudin — *Stop Explaining Black Box ML Models...*, Nature Machine Intelligence, 2019.
- **[49]** Enqvist — *'Human Oversight' in the EU AI Act*, 2023.
- **[52]** Aho, Lam, Sethi, Ullman — *Compilers: Principles, Techniques, and Tools*, 2006.
- **[54]** Anthropic — *Introducing Claude Opus 4.6*, Feb 2026.

---

*English rendering of the project's PDF→Markdown conversion of `Interpretable_Context_Methodology.pdf` (21 pages). Structure, tables, and folder diagrams preserved; figures described in text. Method-specific proper names kept in their original form.*
