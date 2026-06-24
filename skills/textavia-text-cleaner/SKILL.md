---
name: textavia-text-cleaner
description: "Use this skill for text cleanup, whitespace normalization, formatting removal, word and character counts, plain text extraction, line trimming, duplicate line removal, and local text inspection with the Textavia CLI."
version: 0.1.0
author: Caravaca Labs
homepage: https://textavia.com/developers/agent-skills/text-cleaner
metadata:
  openclaw:
    tags: ["text-cleanup","plain-text","developer-tools","textavia","cli"]
    requires:
      anyBins: ["txv", "textavia"]
    install:
      - kind: node
        package: textavia
        bins: ["txv", "textavia"]
  hermes:
    tags: ["text-cleanup","plain-text","developer-tools","textavia","cli"]
    category: writing
    requires_toolsets: ["terminal"]
---

# Textavia Text Cleaner

Use this skill to clean, normalize, and inspect text locally.

Prefer the local Textavia CLI. Check availability in this order:

```bash
txv --version
textavia --version
npx textavia --version
```

If none of those commands work, ask the user before installing Textavia.

## CLI commands

### Clean text

Collapse whitespace and trim.

```bash
txv text clean "  a   b  "
```

Online version:
https://textavia.com/tools/text-cleaner

### Remove formatting

Remove zero-width and control characters.

```bash
txv text remove-formatting "a\u200Bb"
```

Online version:
https://textavia.com/tools/remove-formatting

### Text statistics

Report character, word, line, and sentence counts.

```bash
txv text stats "Hello world"
```

Online version:
https://textavia.com/tools/sentence-counter

## Safety

- Process user data locally by default.
- Do not upload secrets, logs, private files, or sensitive data to remote services.
- Use `--json` for structured agent output.
- Use canonical `txv run <tool-id>` commands for automation.
