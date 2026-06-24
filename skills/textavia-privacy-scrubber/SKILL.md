---
name: textavia-privacy-scrubber
description: "Use this skill for local redaction of likely-sensitive text, secrets, tokens, email addresses, phone numbers, IDs, and logs before pasting into issues, prompts, tickets, or public documents with the Textavia CLI."
version: 0.1.0
author: Caravaca Labs
homepage: https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/agent-skills.md#textavia-privacy-scrubber
metadata:
  openclaw:
    tags: ["privacy","redaction","security","textavia","cli"]
    requires:
      anyBins: ["txv", "textavia"]
    install:
      - kind: node
        package: textavia
        bins: ["txv", "textavia"]
  hermes:
    tags: ["privacy","redaction","security","textavia","cli"]
    category: security
    requires_toolsets: ["terminal"]
---

# Textavia Privacy Scrubber

Redact likely-sensitive text locally before sharing it.

Prefer the local Textavia CLI. Check availability in this order:

```bash
txv --version
textavia --version
npx textavia --version
```

If none of those commands work, ask the user before installing Textavia.

## CLI commands

### Privacy scrub

Redact likely-sensitive substrings.

```bash
txv text privacy-scrub "email a@b.com from 1.2.3.4"
```

Online version:
https://textavia.com/tools/privacy-scrubber

## Safety

- Process user data locally by default.
- Do not upload secrets, logs, private files, or sensitive data to remote services.
- Use `--json` for structured agent output.
- Use canonical `txv run <tool-id>` commands for automation.
