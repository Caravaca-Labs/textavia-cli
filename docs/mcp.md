# Textavia MCP

`@textavia/mcp` exposes Textavia registry tools through the Model Context
Protocol. It is a thin server layer over the same tool implementations used by
the CLI.

Run the server:

```bash
npx @textavia/mcp
```

Or install it globally:

```bash
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

## Registry metadata

MCP Registry server name:

```text
io.github.caravaca-labs/textavia-mcp
```

Package: `@textavia/mcp`

Transport: `stdio`

Default behavior is local-first. Network-required tools are hidden by default in
the published stdio command.

## What it exposes

Tools are generated from canonical registry IDs. Examples:

- `textavia.json_format`
- `textavia.json_validate`
- `textavia.json_repair`
- `textavia.json_to_types`
- `textavia.base64_encode`
- `textavia.base64_decode`
- `textavia.csv_to_json`
- `textavia.markdown_table_to_json`
- `textavia.regex_test`
- `textavia.text_clean`
- `textavia.text_privacy_scrub`
- `textavia.case_slug`
- `textavia.hash_sha256`
- `textavia.random_uuid`

All MCP execution calls the same registry executors used by the CLI.

Each MCP tool accepts:

```json
{
  "input": "text to process",
  "file": "optional/path/to/file.txt",
  "options": {}
}
```

Use `input` for direct text. Use `file` when the agent should read from disk.
Options are validated against each tool's registry schema.

## Safety model

- Standard tools run locally.
- Network-required tools are hidden by default.
- File input is explicit through the MCP `file` argument.
- The package does not include postinstall scripts.
- The package does not require telemetry to run.
- JSON outputs are deterministic and use the same error codes/contracts as the
  CLI where applicable.

The library API exports `createTextaviaMcpServer`, `buildMcpRegistry`, and
`executeMcpTool` for hosts that want tighter filtering, category selection,
network gating, filesystem policy, or maximum input size limits.

## Online tools

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

## Related docs

- [Repo docs index](README.md)
- [Tool registry](registry.md)
- [CLI commands](cli.md)
