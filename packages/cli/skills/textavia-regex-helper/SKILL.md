---
name: textavia-regex-helper
description: "Use this skill for local regular expression testing, match inspection, timeout-protected regex debugging, generated pattern validation, and safe regex experimentation with the Textavia CLI."
version: 0.1.0
author: Caravaca Labs
homepage: https://textavia.com/developers/agent-skills/regex-helper
metadata:
  openclaw:
    tags: ["regex","testing","developer-tools","textavia","cli"]
    requires:
      anyBins: ["txv", "textavia"]
    install:
      - kind: node
        package: textavia
        bins: ["txv", "textavia"]
  hermes:
    tags: ["regex","testing","developer-tools","textavia","cli"]
    category: software-dev
    requires_toolsets: ["terminal"]
---

# Textavia Regex Helper

Test JavaScript regular expressions locally with timeout protection.

Prefer the local Textavia CLI. Check availability in this order:

```bash
txv --version
textavia --version
npx textavia --version
```

If none of those commands work, ask the user before installing Textavia.

## CLI commands

### Regex test

Test a regular expression with timeout protection.

```bash
txv regex test "^[a-z0-9-]+$" "hello-world" --json
```

Online version:
https://textavia.com/tools/regex-tester

## Safety

- Process user data locally by default.
- Do not upload secrets, logs, private files, or sensitive data to remote services.
- Use `--json` for structured agent output.
- Use canonical `txv run <tool-id>` commands for automation.
