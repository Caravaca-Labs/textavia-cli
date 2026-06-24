# Textavia CLI

[![Docs](https://img.shields.io/badge/docs-GitHub-24292F)](docs/README.md)
[![npm package](https://img.shields.io/npm/v/textavia?label=npm)](https://www.npmjs.com/package/textavia)
[![Pi package](https://img.shields.io/badge/Pi-package-3B82F6)](https://pi.dev/packages?search=textavia)
[![Agent skills](https://img.shields.io/badge/agent_skills-SKILL.md-0F766E)](docs/agent-skills.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](packages/cli/LICENSE)

Fast, local-first command-line toolkit for text, data, encoding, formatting, and developer utilities. Built on a shared tool registry so the CLI, docs, MCP server, and agent manifests never drift apart.

## What it is

Textavia is a set of small, composable developer tools exposed through one CLI.
It is meant for work that is too frequent to open a browser tab for and too
annoying to rewrite as one-off shell snippets: formatting JSON, decoding
Base64, cleaning pasted text, converting CSV, hashing files, testing regexes,
generating UUIDs, scrubbing private strings, and preparing agent-readable JSON
output.

The npm package is also an agent distribution asset. Installing `textavia`
ships the `txv` / `textavia` binaries plus bundled `SKILL.md` instructions for
Pi, Hermes, OpenClaw, and other skill-based agent systems.

## Why Textavia CLI

- **Local-first & private.** Standard commands process input locally. No account, no API key, no telemetry, no silent network access.
- **Composable.** Unix-friendly stdin/stdout, stable exit codes, and no surprising file interpretation.
- **Agent-ready.** Deterministic JSON output, stable tool IDs, and a registry-derived manifest.
- **Extensible.** Lightweight defaults; heavy formatters and media tools ship as optional plugins.

## Install

```sh
npm install -g textavia
# or
pnpm add -g textavia
```

The package exposes both `textavia` and `txv` binaries.

## Quick examples

```sh
txv case slug "Hello World!"          # hello-world
echo "HeLLo" | txv case lower         # hello
txv hash sha256 abc                   # ba7816bf...
txv json format --file package.json --write  # pretty-print in place
txv base64 encode "Hello"             # SGVsbG8=
txv random uuid                       # a UUID v4
```

## Command model

```sh
txv <namespace> <operation> [input] [options]
txv run <tool-id> [input] [options]
txv tools list | search <q> | info <id> | docs <id>
txv agent run <tool-id> | txv agent manifest
```

Use the short namespace form for humans:

```sh
txv json format '{"a":1}'
txv base64 decode SGVsbG8=
txv text clean --file notes.txt
```

Use canonical tool IDs for scripts and agents:

```sh
txv run dev.json.format '{"a":1}' --json
txv run encoding.base64.decode SGVsbG8= --json
txv run text.privacy-scrub --file support-log.txt --json
```

Run `txv tools list` to see every tool. See [docs/README.md](docs/README.md)
for repo docs, [docs/cli.md](docs/cli.md) for the generated command reference,
and [docs/registry.md](docs/registry.md) for full registry metadata.

## Tool families

Textavia currently covers these tool families:

| Family | Examples |
| --- | --- |
| Case and text | slug, camelCase, title case, cleanup, plain text, statistics, privacy scrubbing |
| Encoding | Base64, URL encoding, hex, binary, UTF-8, Roman numerals |
| Data formats | JSON, CSV, YAML, TOML, XML, HTML, Markdown tables |
| Developer utilities | hashes, JWT decode, regex test/explain, timestamps, cron, UTM URLs, QR SVG |
| Lines and lists | trim, sort, dedupe, compare, intersect, subtract, shuffle |
| Random generators | UUIDs, passwords, integers, dates, booleans, choices |
| Optional plugins | code formatters, Unicode/text styles, media/PDF/OCR helpers |

A positional string is treated as **text**, not a file path:

```sh
txv case slug "my file.txt"
```

This slugifies the literal string `my file.txt`. Use `--file` to read from
disk:

```sh
txv case slug --file title.txt
```

## Input and output

Input priority: `--input`, `--file`, positional argument, stdin, interactive prompt (human mode only).

```sh
txv case upper --file notes.txt              # read a file
txv json format --file notes.json --write --backup  # in place with a .bak
txv hash sha256 --file big.bin               # streamed, memory-bounded
txv case lower "Hi" --out result.txt         # write to a file
```

## JSON output

```sh
txv case lower "Hi" --json
```

```json
{
  "ok": true,
  "tool": "case.lower",
  "inputType": "text",
  "outputType": "text",
  "output": "hi",
  "meta": { "durationMs": 1 }
}
```

Errors are structured too. Exit codes: `0` success, `1` usage/validation, `2` file I/O, `3` parse, `4` transform, `5` network required, `6` unsafe blocked, `7` plugin missing, `130` interrupted.

## Recipes

Recipes are named pipelines of registry tool IDs (see [docs/recipes.md](docs/recipes.md)):

```sh
txv recipe clean-keywords --file keywords.txt
txv recipe json-api '{"name":"Ada"}' --json
```

Built-in recipes: `seo-slugs`, `clean-keywords`, `normalize-lines`,
`safe-filenames`, `json-api`, `csv-clean`.

## MCP server

The MCP package exposes registry-generated tools and executes the same core
tool implementations as the CLI.

```sh
npx @textavia/mcp
```

See [docs/mcp.md](docs/mcp.md).

## Agent skills

The `textavia` npm package bundles `SKILL.md` folders under `skills/`, and the
repo mirrors them at the root `skills/` directory for GitHub-based discovery.
Pi can load them directly from npm:

```sh
pi install npm:textavia
```

See [docs/agent-skills.md](docs/agent-skills.md) for the included skills,
runtime behavior, and safety rules.

## Online tools

Prefer a browser UI?

- [Textavia](https://textavia.com)
- [Textavia JSON formatter](https://textavia.com/tools/json-formatter)
- [Textavia Base64 tools](https://textavia.com/tools/base64)
- [Textavia text cleaner](https://textavia.com/tools/text-cleaner)
- [Textavia privacy scrubber](https://textavia.com/tools/privacy-scrubber)
- [Textavia CSV to JSON converter](https://textavia.com/tools/csv-to-json)

## Privacy

- Network is off by default; network tools require `--allow-network`.
- Passwords and UUIDs use cryptographically secure randomness.
- File writes are atomic (temp + rename); `--backup` creates a `.bak` first.
- JWT decode never implies signature verification; regex runs in an isolated worker with a timeout.

## Development

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
pnpm generate:docs
```

Maintainers can run `pnpm import:sitemap <url>` to inspect how website pages map
to CLI commands.

The repo is a pnpm monorepo:

- `@textavia/core` — pure tool contracts and the registry.
- `@textavia/schemas` — Zod schemas and JSON schema exports.
- `@textavia/node-adapters` — filesystem, stream, crypto, and worker helpers.
- `@textavia/plugin-standard` — bundled default tools.
- `textavia` — the CLI package, including bundled `skills/`.
- `@textavia/plugin-formatters` — optional formatter plugin.
- `@textavia/plugin-media` — optional media/PDF/OCR plugin.
- `@textavia/mcp` — the MCP server.

## License

MIT
