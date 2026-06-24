# Textavia Agent Skills

The `textavia` npm package includes agent skills in `skills/`. Each skill is a
folder with a `SKILL.md` file that teaches an agent when and how to call the
local Textavia CLI.

The skills are intentionally thin. They do not contain the implementation of
the tools; they point agents to `txv` / `textavia`, so the CLI remains the
auditable execution layer.

## Install

For Pi:

```sh
pi install npm:textavia
```

The package manifest declares:

```json
{
  "pi": {
    "skills": ["./skills"]
  }
}
```

For other `SKILL.md`-based agents, install the npm package or point the agent
at the repo `skills/` directory.

## Included skills

### textavia-json-tools

Format, validate, repair, query, minify, and convert JSON.

### textavia-base64-debugger

Encode, decode, validate, normalize, repair, and inspect Base64 payloads.

### textavia-text-cleaner

Normalize whitespace, clean copied text, remove formatting, and produce plain
text.

### textavia-csv-cleaner

Clean CSV, validate rows, convert CSV to JSON, and create Markdown tables.

### textavia-privacy-scrubber

Redact emails, phone numbers, tokens, IP addresses, and similar sensitive
strings locally.

### textavia-markdown-table-tools

Create, clean, and convert Markdown tables.

### textavia-regex-helper

Test and explain regular expressions with timeout protection.

### textavia-dev-converters

Use hashes, timestamps, URL encoding, HTML escaping, JWT decoding, QR SVG
generation, and color utilities.

## Runtime behavior

Each skill tells the agent to prefer this command order:

```sh
txv --version
textavia --version
npx textavia --version
```

Commands in skills use canonical CLI forms first:

```sh
txv json format --file package.json --write
txv base64 encode "Hello"
txv csv to-json --file users.csv --json
txv text privacy-scrub --file support-log.txt
```

Skills should not silently install dependencies. If `txv` and `textavia` are
missing, the agent should ask the user before installing the CLI.

## Safety

- Prefer local processing.
- Do not upload user data to external services.
- Use `--file` for file inputs; positional strings are treated as literal text.
- Use `--json` when the agent needs structured output.
- Use `--allow-network` only when the user explicitly approves a network tool.

## Source locations

- Package skills: `packages/cli/skills/`
- Repo mirror: `skills/`
- Repo docs: `docs/agent-skills.md`
