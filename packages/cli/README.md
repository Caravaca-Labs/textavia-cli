# Textavia

[![Textavia CLI docs](https://img.shields.io/badge/docs-Textavia_CLI-155EEF)](https://textavia.com/developers/textavia-cli)
[![npm package](https://img.shields.io/npm/v/textavia?label=npm)](https://www.npmjs.com/package/textavia)
[![Pi package](https://img.shields.io/badge/Pi-package-3B82F6)](https://pi.dev/packages?search=textavia)
[![Agent skills](https://img.shields.io/badge/agent_skills-SKILL.md-0F766E)](https://textavia.com/developers/agent-skills)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Fast, local-first command-line toolkit for text, data, encoding, formatting,
and developer utilities.

```sh
npm install -g textavia
txv --version
```

The package installs both binaries:

- `txv`
- `textavia`

It also ships agent skills in `skills/` for Pi, Hermes, OpenClaw, and other
`SKILL.md`-based agent systems.

## Examples

```sh
txv run dev.json.format '{"a":1}'
txv run encoding.base64.encode "Hello"
txv run data.csv.to-json --file users.csv --json
txv run text.privacy-scrub --file support-log.txt
```

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

## Online tools

Prefer a browser UI or developer docs?

- [Textavia CLI docs](https://textavia.com/developers/textavia-cli)
- [Textavia](https://textavia.com)
- [Textavia agent skills](https://textavia.com/developers/agent-skills)
- [Textavia JSON formatter](https://textavia.com/tools/json-formatter)
- [Textavia Base64 tools](https://textavia.com/tools/base64)
- [Textavia text cleaner](https://textavia.com/tools/text-cleaner)
- [Textavia privacy scrubber](https://textavia.com/tools/privacy-scrubber)
- [Textavia CSV to JSON converter](https://textavia.com/tools/csv-to-json)

## Privacy

Standard commands process input locally. No account, API key, telemetry, or
silent network access is required.
