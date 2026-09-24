# Source documents

Drop the documents Stage 02 (Knowledge AI Mining, `extract` mode) should mine
here — product docs, whitepapers, case studies, datasheets. Point `--file` at
them:

```bash
node run_flow.js --stage 02 --file "_context_sources/your_document.md" --product example_module
```

**`--file` is always resolved relative to the project root, not your
current directory** — even though you run `run_flow.js` from inside
`_flows/data-ingestion/`, write the path as `_context_sources/...`, not
`../../_context_sources/...`.

Convert non-text formats (PDF, DOCX, PPTX) to Markdown or plain text before
mining — the prompt embeds the file's raw text verbatim.

**This demo's own worked example:**
```bash
node run_flow.js --stage 02 --file "_context_sources/aster_scan_analytics_notes.md" --product aster_scan_suite --pm PM02
```
See the root `README.md` of this `_demo/` folder for the full walkthrough,
including the real generated output this command produced.
