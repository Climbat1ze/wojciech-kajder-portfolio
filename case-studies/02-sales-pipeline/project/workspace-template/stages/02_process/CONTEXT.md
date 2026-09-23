# Stage 02: Process, Normalize, and Validate Data

**Layer 2: Stage Contract**

---

## Purpose

Normalize pipeline data using the config mapping tables, and validate owners against a team
roster.

---

## Inputs

| Type | Location | Description |
|------|----------|-------------|
| **Primary** | `../01_convert/output/pipeline_data.json` | Converted data from Stage 01 |
| **Config** | `../../_config/industryMap.md` | Industry/vertical normalization |
| **Config** | `../../_config/ownerNameMap.md` | Owner name normalization |
| **Config** | `../../_config/businessUnitMap.md` | Business unit codes |
| **Config** | `../../_config/productMap.md` | Product abbreviations |
| **Config** | `../../_config/teamDefinitions.md` | Team membership |

---

## Process

### 1. Load Configuration Maps

Parse the Markdown tables in `_config/*.md` into lookup objects.

### 2. Normalize Fields

For each record in each sheet:

| Field | Transformation |
|-------|-----------------|
| `Owner` | Split by comma/newline (multiple owners in one cell), normalize each name using `ownerNameMap.md` |
| `Industry` / `Vertical` | Normalize using `industryMap.md` |
| `Business Unit` | Normalize using `businessUnitMap.md` |
| `Product Line(s)` | Split by comma/semicolon, normalize each using `productMap.md` |

### 3. Validate Owners

Check each person in `Owner` and `Supported By` against the team roster in
`teamDefinitions.md`:

- **Valid:** name found in the roster (after normalization)
- **NOT_PERSON:** entry looks like a team/queue label rather than an individual (e.g. all-caps
  code, ends in a colon)
- **NOT_ON_ROSTER:** name not found on the roster — flag for review, do not silently drop

### 4. Generate Validation Report

Create a Markdown report with summary statistics and a list of validation issues.

---

## Outputs

| File | Location | Description |
|------|----------|-------------|
| `processed_data.json` | `output/` | Normalized data with validation results |
| `validation_report.md` | `output/` | Human-readable validation report |

### Processed Data Structure

```json
{
  "processed": {
    "SheetName": {
      "title": "...",
      "headers": ["..."],
      "records": ["..."]
    }
  },
  "validationIssues": ["..."],
  "stats": {
    "totalRecords": 0,
    "normalizedNames": 0,
    "normalizedIndustries": 0,
    "validationErrors": 0
  }
}
```

---

## Execution

```bash
node ../../_scripts/stage_02_process.js
```

---

## Verification Checklist

- [ ] `processed_data.json` created in `output/`
- [ ] `validation_report.md` created in `output/`
- [ ] Names normalized per `ownerNameMap.md`
- [ ] Industries normalized per `industryMap.md`
- [ ] Validation issues identified (if any)
- [ ] Stats summary accurate

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `Input file not found` | Stage 01 not run | Run `stage_01_convert.js` first |
| `Config file not found` | Missing `_config/*.md` | Check the folder structure |

---

## Next Stage

```bash
node ../../_scripts/stage_03_report.js
```

---

**Stage Version:** 1.0
