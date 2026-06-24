---
name: textavia-base64-debugger
description: "Use this skill for Base64 encoding, decoding, validation, normalization, repair, detection, data URL conversion, gzip checks, copied Base64 payload debugging, and local binary/text Base64 workflows with the Textavia CLI."
version: 0.1.0
author: Caravaca Labs
homepage: https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/agent-skills.md#textavia-base64-debugger
metadata:
  openclaw:
    tags: ["base64","encoding","debugging","textavia","cli"]
    requires:
      anyBins: ["txv", "textavia"]
    install:
      - kind: node
        package: textavia
        bins: ["txv", "textavia"]
  hermes:
    tags: ["base64","encoding","debugging","textavia","cli"]
    category: software-dev
    requires_toolsets: ["terminal"]
---

# Textavia Base64 Debugger

Encode, decode, validate, normalize, repair, detect, and inspect Base64 locally.

Prefer the local Textavia CLI. Check availability in this order:

```bash
txv --version
textavia --version
npx textavia --version
```

If none of those commands work, ask the user before installing Textavia.

## CLI commands

### Base64 encode

Encode text or bytes to Base64.

```bash
txv run encoding.base64.encode "Hello"
```

Online version:
https://textavia.com/tools/base64/encode/text

### Base64 decode

Decode Base64 to text or bytes.

```bash
txv run encoding.base64.decode "SGVsbG8="
```

Online version:
https://textavia.com/tools/base64/decode/text

### Base64 validate

Check whether text is valid Base64.

```bash
txv run encoding.base64.validate "SGVsbG8="
```

Online version:
https://textavia.com/tools/base64/validate

### Base64 normalize

Normalize a Base64 string (whitespace and padding).

```bash
txv base64 normalize "SGV sbG8"
```

Online version:
https://textavia.com/tools/base64/normalize

### Base64 repair

Attempt to repair a malformed Base64 string.

```bash
txv base64 repair "SGVsbG8"
```

Online version:
https://textavia.com/tools/base64/repair-malformed

### Base64 detect

Detect whether text is likely Base64.

```bash
txv base64 detect SGVsbG8= --json
```

Online version:
https://textavia.com/tools/base64/standard-detector

### Base64 gzip check

Check whether Base64 content is gzipped.

```bash
txv base64 gzip-check H4sI --json
```

Online version:
https://textavia.com/tools/base64/check-gzip-compression

### Base64 data URL

Convert between bytes and a Base64 data URL.

```bash
txv data-url --file logo.png --mimeType image/png
```

Online version:
https://textavia.com/tools/base64

## Safety

- Process user data locally by default.
- Do not upload secrets, logs, private files, or sensitive data to remote services.
- Use `--json` for structured agent output.
- Use canonical `txv run <tool-id>` commands for automation.
