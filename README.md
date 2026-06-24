# Textavia CLI

Fast, local-first command-line toolkit for text, data, encoding, formatting, and developer utilities. Built on a shared tool registry so the CLI, docs, MCP server, and agent manifests never drift apart.

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
echo "HeLLo" | txv lower              # hello
txv hash sha256 abc                   # ba7816bf...
txv json format package.json --write  # pretty-print in place
txv base64 encode "Hello"             # SGVsbG8=
txv random uuid                       # a UUID v4
```

## Commands

```sh
txv <namespace> <operation> [input] [options]
txv run <tool-id> [input] [options]
txv tools list | search <q> | info <id> | docs <id>
txv agent run <tool-id> | txv agent manifest
```

Run `txv tools list` to see every tool. See [docs/cli.md](docs/cli.md) for the generated command reference and [docs/registry.md](docs/registry.md) for full registry metadata.

A positional string is treated as **text**, not a file path: `txv slug "my file.txt"` slugifies the string. Use `--file` to read a file.

## Input and output

Input priority: `--input`, `--file`, positional argument, stdin, interactive prompt (human mode only).

```sh
txv case upper --file notes.txt              # read a file
txv json format notes.json --write --backup  # in place with a .bak
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

## Online tools

The website hosts many SEO-specific pages. The CLI consolidates them into fewer, stronger primitives. Use `pnpm import:sitemap <url>` to see how website pages map to CLI commands.

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

The repo is a pnpm monorepo:

- `@textavia/core` — pure tool contracts and the registry.
- `@textavia/schemas` — Zod schemas and JSON schema exports.
- `@textavia/node-adapters` — filesystem, stream, crypto, and worker helpers.
- `@textavia/plugin-standard` — bundled default tools.
- `textavia` — the CLI package.
- `@textavia/plugin-formatters`, `@textavia/plugin-media` — optional plugins.
- `@textavia/mcp` — the MCP server.
- `textavia-agent-skills` — generated agent skills.

## License

MIT
