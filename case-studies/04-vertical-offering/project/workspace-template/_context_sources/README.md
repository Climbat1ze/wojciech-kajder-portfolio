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
`../../_context_sources/...`. See `_flows/_lib/paths.js`'s `expand()`.

Convert non-text formats (PDF, DOCX, PPTX) to Markdown or plain text before
mining — the prompt embeds the file's raw text verbatim.
