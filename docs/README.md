# Textavia Documentation

This directory contains the repo-native documentation for Textavia CLI, the
tool registry, recipes, MCP server, and bundled agent skills.

Textavia is a local-first developer toolkit for text, data, encoding,
formatting, and utility transformations. The same registry powers the CLI,
generated docs, MCP server, and `SKILL.md` agent instructions.

## Start here

- [CLI commands](cli.md) - generated command reference for every registry tool.
- [Tool registry](registry.md) - generated tool metadata, categories, input
  kinds, output kinds, stability, and related web tools.
- [Recipes](recipes.md) - built-in multi-step pipelines such as keyword
  cleanup, safe filenames, JSON formatting, and CSV cleanup.
- [Agent skills](agent-skills.md) - bundled `SKILL.md` packages for Pi,
  Hermes, OpenClaw, and similar agent systems.
- [MCP server](mcp.md) - Model Context Protocol server usage and tool mapping.
- [Adding tools](adding-tools.md) - maintainer guide for adding registry-backed
  tools.

## Package layout

- `textavia` installs the `txv` and `textavia` binaries and includes bundled
  skills under `skills/`.
- `@textavia/core` contains registry types and shared execution contracts.
- `@textavia/node-adapters` contains Node filesystem, stream, crypto, and
  worker helpers.
- `@textavia/plugin-standard` contains the default lightweight tool set.
- `@textavia/schemas` exports Zod and JSON schema helpers.
- `@textavia/mcp` exposes the registry through MCP.

## Website tools

Textavia keeps developer documentation in this GitHub repo. Browser tools live
on the website:

- [Textavia](https://textavia.com)
- [Textavia JSON formatter](https://textavia.com/tools/json-formatter)
- [Textavia Base64 tools](https://textavia.com/tools/base64)
- [Textavia text cleaner](https://textavia.com/tools/text-cleaner)
