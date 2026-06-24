# Textavia MCP

`@textavia/mcp` exposes the Textavia developer tool registry through the Model
Context Protocol. It lets MCP-capable agents call local Textavia utilities for
JSON, Base64, CSV, Markdown tables, regex checks, hashing, text cleanup, case
conversion, random values, timestamps, and privacy scrubbing.

The MCP package is a thin stdio server over the same registry and executors used
by the `textavia` / `txv` CLI. It is designed for agents that need dependable
local text and data transformations without copying user data into a web app.

## Quick Start

```sh
npx @textavia/mcp
```

Or install it globally:

```sh
npm install -g @textavia/mcp
textavia-mcp
```

Use this MCP server config in clients that accept stdio server definitions:

```json
{
  "mcpServers": {
    "textavia": {
      "command": "npx",
      "args": ["-y", "@textavia/mcp"]
    }
  }
}
```

If you install globally, you can use the binary directly:

```json
{
  "mcpServers": {
    "textavia": {
      "command": "textavia-mcp"
    }
  }
}
```

## Registry Metadata

MCP Registry server name:

```text
io.github.caravaca-labs/textavia-mcp
```

Package:

```text
@textavia/mcp
```

Transport:

```text
stdio
```

Repository:

```text
https://github.com/Caravaca-Labs/textavia-cli
```

## What It Exposes

MCP tool names are generated from Textavia registry IDs. The package keeps the
Textavia namespace and uses underscore-separated operation names:

| MCP tool | Backing registry tool | Typical use |
| --- | --- | --- |
| `textavia.json_format` | `dev.json.format` | Pretty-print JSON from text or a file. |
| `textavia.json_validate` | `dev.json.validate` | Validate JSON and return diagnostics. |
| `textavia.json_repair` | `dev.json.repair` | Repair common malformed JSON output. |
| `textavia.json_to_types` | `dev.json.to-types` | Generate TypeScript types from sample JSON. |
| `textavia.base64_encode` | `encoding.base64.encode` | Encode text or bytes as Base64. |
| `textavia.base64_decode` | `encoding.base64.decode` | Decode Base64 to text or bytes. |
| `textavia.csv_to_json` | `data.csv.to-json` | Convert CSV text to JSON rows. |
| `textavia.markdown_table_to_json` | `data.markdown.table-to-json` | Convert Markdown tables to JSON. |
| `textavia.regex_test` | `dev.regex.test` | Test a JavaScript regex against input text. |
| `textavia.text_clean` | `text.clean` | Collapse whitespace and normalize pasted text. |
| `textavia.text_privacy_scrub` | `text.privacy-scrub` | Redact emails, phones, URLs, IPs, and similar data. |
| `textavia.case_slug` | `case.slug` | Create URL slugs from titles or labels. |
| `textavia.hash_sha256` | `dev.hash.sha256` | Compute SHA-256 digests for text or files. |
| `textavia.random_uuid` | `random.uuid` | Generate UUIDs. |

Each MCP tool accepts the same argument shape:

```json
{
  "input": "text to process",
  "file": "optional/path/to/file.txt",
  "options": {
    "toolSpecificOption": "value"
  }
}
```

Use `input` for direct text. Use `file` when the agent should read from disk.
Options are validated against each tool's registry schema.

## Example Agent Calls

Format JSON:

```json
{
  "input": "{\"name\":\"Ada\",\"tools\":[\"Textavia\"]}",
  "options": {
    "indent": 2
  }
}
```

Convert CSV to JSON:

```json
{
  "input": "name,role\nAda,engineer",
  "options": {
    "delimiter": ","
  }
}
```

Test a regex:

```json
{
  "input": "Textavia 2026",
  "options": {
    "pattern": "\\d+",
    "flags": "g"
  }
}
```

Scrub private text:

```json
{
  "input": "Email ada@example.com or call 555-123-4567"
}
```

## Safety Model

- Standard tools run locally in the MCP server process.
- The published stdio command uses local-first defaults.
- Network-required tools are hidden by default.
- Tool arguments are parsed with Zod schemas before execution.
- File input is explicit through the MCP `file` argument.
- The package does not include postinstall scripts.
- The package does not require telemetry to run.

The library API exports `createTextaviaMcpServer`, `buildMcpRegistry`, and
`executeMcpTool` for hosts that want tighter filtering, category selection,
network gating, filesystem policy, or maximum input size limits.

## Online Tools

Prefer a browser UI or want to inspect a matching web tool? Start here:

- [Textavia](https://textavia.com)
- [Textavia JSON formatter](https://textavia.com/tools/json-formatter)
- [Textavia JSON validator](https://textavia.com/tools/json-validator)
- [Textavia JSON repair](https://textavia.com/tools/json-repair)
- [Textavia JSON to TypeScript](https://textavia.com/tools/json-to-types)
- [Textavia Base64 tools](https://textavia.com/tools/base64)
- [Textavia Base64 encoder](https://textavia.com/tools/base64-encode)
- [Textavia Base64 decoder](https://textavia.com/tools/base64-decode)
- [Textavia CSV to JSON converter](https://textavia.com/tools/csv-to-json)
- [Textavia Markdown to HTML converter](https://textavia.com/tools/markdown-to-html)
- [Textavia regex tester](https://textavia.com/tools/regex-tester)
- [Textavia SHA-256 hash tool](https://textavia.com/tools/sha256-hash)
- [Textavia privacy scrubber](https://textavia.com/tools/data-privacy)
- [Textavia clean text tool](https://textavia.com/tools/clean-text)
- [Textavia lowercase converter](https://textavia.com/tools/lowercase)
- [Textavia uppercase converter](https://textavia.com/tools/uppercase)
- [Textavia title case converter](https://textavia.com/tools/title-case)
- [Textavia glitch text converter](https://textavia.com/tools/glitch-text-converter)
- [Textavia Discord fonts generator](https://textavia.com/tools/discord-fonts-generator)
- [Textavia mirror text generator](https://textavia.com/tools/mirror-text-generator)
- [Textavia aesthetic text generator](https://textavia.com/tools/aesthetic-text-generator)
- [Textavia Instagram fonts](https://textavia.com/tools/instagram-fonts)
- [Textavia invisible text generator](https://textavia.com/tools/invisible-text-generator)
- [Textavia remove underscores tool](https://textavia.com/tools/remove-underscores)
- [Textavia wide text generator](https://textavia.com/tools/wide-text)
- [Textavia Zalgo text generator](https://textavia.com/tools/zalgo)

## Repo Docs

- [Repo MCP docs](https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/mcp.md)
- [Repo tool registry](https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/registry.md)
- [Textavia CLI docs](https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/cli.md)

## Related Packages

- `textavia` - CLI package with `textavia` and `txv` binaries, plus bundled
  agent skills.
- `@textavia/mcp` - this MCP stdio server package.
- `@textavia/core` - registry contracts and shared execution types.
- `@textavia/plugin-standard` - built-in local-first tools exposed by the CLI
  and MCP server.
