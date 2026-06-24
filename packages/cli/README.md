# Textavia

[![Docs](https://img.shields.io/badge/docs-GitHub-24292F)](https://github.com/Caravaca-Labs/textavia-cli/tree/main/docs)
[![npm package](https://img.shields.io/npm/v/textavia?label=npm)](https://www.npmjs.com/package/textavia)
[![Pi package](https://img.shields.io/badge/Pi-package-3B82F6)](https://pi.dev/packages?search=textavia)
[![Agent skills](https://img.shields.io/badge/agent_skills-SKILL.md-0F766E)](https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/agent-skills.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Fast, local-first command-line toolkit for text, data, encoding, formatting,
and developer utilities.

Textavia is for quick, repeatable transformations that should stay local:
format JSON, decode Base64, clean pasted text, convert CSV, hash files, test
regexes, generate UUIDs, scrub sensitive strings, and emit structured JSON for
automation and agents.

```sh
npm install -g textavia
txv --version
```

The package installs both binaries:

- `txv`
- `textavia`

It also ships agent skills in `skills/` for Pi, Hermes, OpenClaw, and other
`SKILL.md`-based agent systems.

## Command model

```sh
txv <namespace> <operation> [input] [options]
txv run <tool-id> [input] [options]
txv tools list | search <q> | info <id> | docs <id>
txv agent run <tool-id> | txv agent manifest
```

Use short namespace commands for humans and canonical tool IDs for scripts:

```sh
txv json format '{"a":1}'
txv run dev.json.format '{"a":1}' --json
```

Positional input is treated as literal text. Use `--file` to read from disk:

```sh
txv case slug "my file.txt"
txv case slug --file title.txt
```

## Examples

```sh
txv case slug "Hello World!"
txv hash sha256 abc
txv json format --file package.json --write
txv base64 encode "Hello"
txv run data.csv.to-json --file users.csv --json
txv run text.privacy-scrub --file support-log.txt --json
```

## Tool families

- Case and text: slugs, case conversion, cleanup, plain text, stats, privacy scrubbing.
- Encoding: Base64, URL encoding, hex, binary, UTF-8, Roman numerals.
- Data formats: JSON, CSV, YAML, TOML, XML, HTML, Markdown tables.
- Developer utilities: hashes, JWT decode, regex, timestamps, cron, UTM URLs, QR SVG.
- Lines and lists: trim, sort, dedupe, compare, intersect, subtract, shuffle.
- Random generators: UUIDs, passwords, numbers, dates, booleans, choices.

## Agent skills

Pi can load the bundled skills directly from this npm package:

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

Each skill prefers the local CLI and checks `txv`, `textavia`, then
`npx textavia`. Skills never auto-install dependencies; agents should ask the
user before installing anything.

More docs:

- [Repo documentation](https://github.com/Caravaca-Labs/textavia-cli/tree/main/docs)
- [CLI commands](https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/cli.md)
- [Tool registry](https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/registry.md)
- [Agent skills](https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/agent-skills.md)

## Online tools

Prefer a browser UI?

- [Textavia](https://textavia.com)
- [Textavia JSON formatter](https://textavia.com/tools/json-formatter)
- [Textavia Base64 tools](https://textavia.com/tools/base64)
- [Textavia text cleaner](https://textavia.com/tools/text-cleaner)
- [Textavia privacy scrubber](https://textavia.com/tools/privacy-scrubber)
- [Textavia CSV to JSON converter](https://textavia.com/tools/csv-to-json)

## Privacy

Standard commands process input locally. No account, API key, telemetry, or
silent network access is required.
