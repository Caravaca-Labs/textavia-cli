---
name: textavia-json-tools
description: "Use this skill for JSON formatting, minification, validation, YAML conversion, CSV conversion, Markdown table conversion, API responses, package manifests, config files, and generated structured data with the local Textavia CLI."
version: 0.1.0
author: Caravaca Labs
homepage: https://textavia.com/developers/agent-skills/json-tools
metadata:
  openclaw:
    tags: ["json","developer-tools","textavia","cli"]
    requires:
      anyBins: ["txv", "textavia"]
    install:
      - kind: node
        package: textavia
        bins: ["txv", "textavia"]
  hermes:
    tags: ["json","developer-tools","textavia","cli"]
    category: software-dev
    requires_toolsets: ["terminal"]
---

# Textavia JSON Tools

Format, minify, validate, and convert JSON using the local Textavia CLI.

Prefer the local Textavia CLI. Check availability in this order:

```bash
txv --version
textavia --version
npx textavia --version
```

If none of those commands work, ask the user before installing Textavia.

## CLI commands

### Format JSON

Pretty-print JSON.

```bash
txv json format '{"a":1}'
```

Online version:
https://textavia.com/tools/json-formatter

### Minify JSON

Minify JSON.

```bash
txv json minify '{"a": 1}'
```

Online version:
https://textavia.com/tools/json-minifier

### Validate JSON

Validate JSON and report diagnostics.

```bash
txv json validate '{"a":1}'
```

Online version:
https://textavia.com/tools/json-formatter

### JSON to YAML

Convert JSON to YAML.

```bash
txv json to-yaml --file data.json
```

Online version:
https://textavia.com/tools/json-to-yaml

### JSON to CSV

Convert JSON objects to CSV.

```bash
txv json to-csv --file users.json
```

Online version:
https://textavia.com/tools/json-to-csv

### JSON to Markdown table

Convert JSON objects to a Markdown table.

```bash
txv json to-markdown-table --file users.json
```

Online version:
https://textavia.com/tools/json-to-markdown-table

## Safety

- Process user data locally by default.
- Do not upload secrets, logs, private files, or sensitive data to remote services.
- Use `--json` for structured agent output.
- Use canonical `txv run <tool-id>` commands for automation.
