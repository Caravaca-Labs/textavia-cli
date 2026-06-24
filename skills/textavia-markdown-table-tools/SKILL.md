---
name: textavia-markdown-table-tools
description: "Use this skill for Markdown table creation, Markdown table to JSON conversion, Markdown table to CSV conversion, JSON to Markdown table conversion, CSV to Markdown table conversion, and local documentation table workflows with the Textavia CLI."
version: 0.1.0
author: Caravaca Labs
homepage: https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/agent-skills.md#textavia-markdown-table-tools
metadata:
  openclaw:
    tags: ["markdown","tables","csv","json","textavia","cli"]
    requires:
      anyBins: ["txv", "textavia"]
    install:
      - kind: node
        package: textavia
        bins: ["txv", "textavia"]
  hermes:
    tags: ["markdown","tables","csv","json","textavia","cli"]
    category: software-dev
    requires_toolsets: ["terminal"]
---

# Textavia Markdown Table Tools

Create and convert Markdown tables from JSON or CSV locally.

Prefer the local Textavia CLI. Check availability in this order:

```bash
txv --version
textavia --version
npx textavia --version
```

If none of those commands work, ask the user before installing Textavia.

## CLI commands

### Create Markdown table

Create a Markdown table from JSON or CSV.

```bash
txv table create --file users.csv
```

Online version:
https://textavia.com/tools/markdown-table-creator

### Markdown table to JSON

Convert a Markdown table to JSON.

```bash
txv markdown table-to-json --file table.md
```

Online version:
https://textavia.com/tools/markdown-table-to-json

### Markdown table to CSV

Convert a Markdown table to CSV.

```bash
txv markdown table-to-csv --file table.md
```

Online version:
https://textavia.com/tools/markdown-table-to-csv

### JSON to Markdown table

Convert JSON objects to a Markdown table.

```bash
txv json to-markdown-table --file users.json
```

Online version:
https://textavia.com/tools/json-to-markdown-table

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
