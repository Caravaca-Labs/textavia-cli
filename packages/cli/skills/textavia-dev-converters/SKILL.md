---
name: textavia-dev-converters
description: "Use this skill for local developer conversions including URL encoding and decoding, YAML to JSON, XML formatting, XML to JSON, timestamp parsing, Unix time conversion, UTM URL construction, and QR SVG generation with the Textavia CLI."
version: 0.1.0
author: Caravaca Labs
homepage: https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/agent-skills.md#textavia-dev-converters
metadata:
  openclaw:
    tags: ["converters","url-encoding","timestamp","xml","yaml","textavia"]
    requires:
      anyBins: ["txv", "textavia"]
    install:
      - kind: node
        package: textavia
        bins: ["txv", "textavia"]
  hermes:
    tags: ["converters","url-encoding","timestamp","xml","yaml","textavia"]
    category: software-dev
    requires_toolsets: ["terminal"]
---

# Textavia Developer Converters

Convert URL components, YAML, XML, timestamps, UTM URLs, and QR inputs locally.

Prefer the local Textavia CLI. Check availability in this order:

```bash
txv --version
textavia --version
npx textavia --version
```

If none of those commands work, ask the user before installing Textavia.

## CLI commands

### URL encode

URL-encode text.

```bash
txv run encoding.url.encode "a b&c"
```

Online version:
https://textavia.com/tools/url-encoder

### URL decode

URL-decode text.

```bash
txv run encoding.url.decode "a%20b"
```

Online version:
https://textavia.com/tools/url-encoder

### YAML to JSON

Convert YAML to JSON.

```bash
txv yaml to-json --file data.yaml
```

Online version:
https://textavia.com/tools/yaml-to-json

### Format XML

Format XML with indentation.

```bash
txv xml format --file data.xml
```

Online version:
https://textavia.com/tools/xml-formatter

### XML to JSON

Convert XML to JSON.

```bash
txv xml to-json --file data.xml
```

Online version:
https://textavia.com/tools/xml-to-json

### Parse timestamp

Parse a timestamp string.

```bash
txv timestamp parse "2024-01-01T00:00:00Z"
```

Online version:
https://textavia.com/tools/unix-timestamp-converter

### Unix to date

Convert a Unix timestamp to a date.

```bash
txv timestamp to-date 1704067200
```

Online version:
https://textavia.com/tools/unix-timestamp-converter

### Date to Unix

Convert a date to a Unix timestamp.

```bash
txv timestamp from-date "2024-01-01T00:00:00Z"
```

Online version:
https://textavia.com/tools/unix-timestamp-converter

### UTM builder

Build a URL with UTM parameters.

```bash
txv utm build "https://example.com" --source newsletter --medium email
```

Online version:
https://textavia.com/tools/utm-builder

### QR SVG

Generate a local QR code SVG.

```bash
txv qr "https://textavia.com" --out qr.svg
```

Online version:
https://textavia.com/tools/qr-code

## Safety

- Process user data locally by default.
- Do not upload secrets, logs, private files, or sensitive data to remote services.
- Use `--json` for structured agent output.
- Use canonical `txv run <tool-id>` commands for automation.
