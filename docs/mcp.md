# Textavia MCP

`@textavia/mcp` exposes Textavia registry tools through the Model Context
Protocol. It is a thin server layer over the same tool implementations used by
the CLI.

Run the server:

```bash
npx @textavia/mcp
```

Default behavior is local-first. Network tools are hidden unless enabled by config, and filesystem use can be disabled by the MCP host config.

## What it exposes

Tools are generated from canonical registry IDs. Examples:

- `textavia.case_convert` style names are generated from canonical registry IDs.
- `textavia.base64_encode`
- `textavia.json_format`
- `textavia.csv_to_json`
- `textavia.regex_test`

All MCP execution calls the same registry executors used by the CLI.

## Safety model

- Standard tools run locally.
- Network tools are opt-in.
- Filesystem access can be disabled by the MCP host config.
- JSON outputs are deterministic and use the same error codes/contracts as the
  CLI where applicable.

## Related docs

- [Repo docs index](README.md)
- [Tool registry](registry.md)
- [CLI commands](cli.md)
- [Website MCP docs](https://textavia.com/developers/mcp)
