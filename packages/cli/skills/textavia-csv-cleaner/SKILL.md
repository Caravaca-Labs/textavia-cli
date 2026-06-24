---
name: textavia-csv-cleaner
description: "Use this skill for CSV cleanup, CSV to JSON conversion, JSON to CSV conversion, CSV to Markdown table conversion, delimiter-safe tabular transforms, and local data preparation with the Textavia CLI."
version: 0.1.0
author: Caravaca Labs
homepage: https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/agent-skills.md#textavia-csv-cleaner
metadata:
  openclaw:
    tags: ["csv","json","markdown","data-cleaning","textavia","cli"]
    requires:
      anyBins: ["txv", "textavia"]
    install:
      - kind: node
        package: textavia
        bins: ["txv", "textavia"]
  hermes:
    tags: ["csv","json","markdown","data-cleaning","textavia","cli"]
    category: data
    requires_toolsets: ["terminal"]
---

# Textavia CSV Cleaner

Clean CSV and convert between CSV, JSON, and Markdown locally.

Prefer the local Textavia CLI. Check availability in this order:

```bash
txv --version
textavia --version
npx textavia --version
```

If none of those commands work, ask the user before installing Textavia.

## CLI commands

### Clean CSV

Trim CSV cells and remove empty rows.

```bash
txv csv clean --file users.csv
```

Online version:
https://textavia.com/tools/csv-cleaner

### CSV to JSON

Convert header-based CSV to JSON.

```bash
txv csv to-json --file users.csv
```

Online version:
https://textavia.com/tools/csv-to-json

### JSON to CSV

Convert JSON objects to CSV.

```bash
txv json to-csv --file users.json
```

Online version:
https://textavia.com/tools/json-to-csv

### CSV to Markdown table

Convert CSV to a Markdown table.

```bash
txv csv to-markdown-table --file users.csv --out users.md
```

Online version:
https://textavia.com/tools/csv-to-markdown-table

## Safety

- Process user data locally by default.
- Do not upload secrets, logs, private files, or sensitive data to remote services.
- Use `--json` for structured agent output.
- Use canonical `txv run <tool-id>` commands for automation.
