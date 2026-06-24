# Textavia MCP

Run the MCP server:

```bash
npx @textavia/mcp
```

Default behavior is local-first. Network tools are hidden unless enabled by config, and filesystem use can be disabled by the MCP host config.

Example generated tools:

- `textavia.case_convert` style names are generated from canonical registry IDs.
- `textavia.base64_encode`
- `textavia.json_format`
- `textavia.csv_to_json`
- `textavia.regex_test`

All MCP execution calls the same registry executors used by the CLI.
