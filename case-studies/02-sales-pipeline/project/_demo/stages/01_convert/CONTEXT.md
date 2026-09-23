# Stage 01: Convert Spreadsheet to JSON + Markdown

**Layer 2: Stage Contract**

---

## Purpose

Convert the raw sales-pipeline spreadsheet (XLSX) into structured JSON and a Markdown table, for
further processing.

---

## Inputs

| Type | Location | Description |
|------|----------|-------------|
| **Primary** | `../../_input/pipeline_*.xlsx` | Latest spreadsheet (managed/versioned by Stage 0) |

---

## Process

1. Find the latest XLSX file in `_input/`.
2. Read every sheet in the workbook.
3. For each sheet:
   - Row 1 = title
   - Row 2 = column headers
   - Row 3+ = data records
4. Convert Excel serial dates to ISO format (`YYYY-MM-DD`).
5. Handle null/empty cells.
6. Escape Markdown special characters (`|`, newlines) when generating the Markdown view.

### Date Conversion Rules

- Excel serial number → ISO date
- String dates in other formats → ISO date
- Already ISO → keep as-is

### Cell Processing Rules

- Null/empty → `null` in JSON, empty string in Markdown
- Pipe character `|` → escaped as `\|`
- Newlines → replaced with a space

---

## Outputs

| File | Location | Description |
|------|----------|-------------|
| `pipeline_data.json` | `output/` | Structured JSON with all sheets |
| `pipeline_data.md` | `output/` | Human-readable Markdown tables |

### JSON Structure

```json
{
  "SheetName": {
    "title": "Sheet Title",
    "headers": ["Col1", "Col2", "..."],
    "records": [
      {"Col1": "value1", "Col2": "value2"}
    ]
  }
}
```

---

## Execution

```bash
node ../../_scripts/stage_01_convert.js
```

---

## Verification Checklist

- [ ] JSON file created in `output/`
- [ ] Markdown file created in `output/`
- [ ] All sheets from the spreadsheet are present in the JSON
- [ ] Date columns converted to ISO format (`YYYY-MM-DD`)
- [ ] Record count matches the spreadsheet (minus header rows)
- [ ] No null values in required fields (Account Name, etc.)

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `_input/ directory not found` | Stage 0 not run | Run `manage_pipeline_input.js` first |
| `No pipeline_*.xlsx found` | No file placed in the watched folder | Drop a spreadsheet where Stage 0 expects it |
| `Error reading XLSX` | Corrupted file | Re-export/re-download the spreadsheet |

---

## Next Stage

```bash
node ../../_scripts/stage_02_process.js
```

---

**Stage Version:** 1.0
