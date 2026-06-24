/**
 * @fileoverview Docs generator.
 *
 * Reads the registry and generates README command sections, docs/cli.md, and
 * per-tool developer docs data from a single source of truth. Fails when an
 * example references a tool id or command that is not registered, so docs
 * cannot drift from the implementation.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { buildCliRegistry } from '../packages/cli/src/index.ts';
import { BUILTIN_RECIPES } from '../packages/cli/src/recipes.ts';
import type { TextaviaToolDefinition } from '../packages/core/src/index.ts';

const REPO_ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const DOCS_DIR = join(REPO_ROOT, 'docs');

/** Builds the registry used for generation. */
export function buildRegistryForDocs() {
  return buildCliRegistry({ cliName: 'txv', version: '0.1.0' });
}

/** Extracts the canonical tool id from a `txv run <id>` example command. */
function exampleToolId(command: string): string | null {
  const match = /txv\s+run\s+([a-z0-9][a-z0-9.-]*)/.exec(command);
  return match === null ? null : (match[1] ?? null);
}

/** Validates that every `txv run <id>` example references a registered tool id. */
export function validateExamples(
  tools: readonly TextaviaToolDefinition[],
): string[] {
  const ids = new Set(tools.map((tool) => tool.id));
  const aliases = new Set(tools.flatMap((tool) => tool.aliases));
  const errors: string[] = [];
  for (const tool of tools) {
    for (const example of tool.examples) {
      const referenced = exampleToolId(example.command);
      if (referenced === null) {
        continue;
      }
      if (!ids.has(referenced) && !aliases.has(referenced)) {
        errors.push(
          `Tool "${tool.id}" example references unknown tool "${referenced}": ${example.command}`,
        );
      }
    }
  }
  return errors;
}

function renderCliDoc(tools: readonly TextaviaToolDefinition[]): string {
  const lines: string[] = [
    '# Textavia CLI Commands',
    '',
    'Generated from the tool registry. Do not edit by hand; run `pnpm generate:docs`.',
    '',
    '| Tool | Category | Summary | Command |',
    '|------|----------|---------|---------|',
  ];
  for (const tool of tools) {
    const command = `\`txv run ${tool.id}\``;
    lines.push(
      `| ${tool.name} | ${tool.category} | ${tool.summary} | ${command} |`,
    );
  }
  return `${lines.join('\n')}\n`;
}

function renderRegistryDoc(tools: readonly TextaviaToolDefinition[]): string {
  const lines: string[] = [
    '# Tool Registry',
    '',
    'The registry is the single source of truth for tools, options, examples, and docs.',
    '',
  ];
  for (const tool of tools) {
    lines.push(`## ${tool.id}`, '', `${tool.description}`, '');
    lines.push(`- **Stability:** ${tool.stability}`);
    lines.push(`- **Category:** ${tool.category}`);
    lines.push(`- **Input:** ${tool.inputKind.join(', ')}`);
    lines.push(`- **Output:** ${tool.outputKind.join(', ')}`);
    if (tool.webUrl !== undefined) {
      lines.push(`- **Web:** ${tool.webUrl}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function writeDoc(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function renderRecipesDoc(): string {
  const lines = [
    '# Recipes',
    '',
    'Generated from built-in recipe definitions. Config recipes use the same `[toolId, options]` step format.',
    '',
  ];
  for (const recipe of BUILTIN_RECIPES) {
    lines.push(`## ${recipe.id}`, '', recipe.description ?? recipe.name, '');
    lines.push('| Step | Tool | Options |', '|------|------|---------|');
    recipe.steps.forEach(([toolId, options], index) => {
      lines.push(
        `| ${index + 1} | \`${toolId}\` | \`${JSON.stringify(options ?? {})}\` |`,
      );
    });
    lines.push('');
  }
  return `${lines.join('\n')}`;
}

function renderMcpDoc(): string {
  return `# Textavia MCP

\`@textavia/mcp\` exposes Textavia registry tools through the Model Context
Protocol. It is a thin server layer over the same tool implementations used by
the CLI.

Run the server:

\`\`\`bash
npx @textavia/mcp
\`\`\`

Or install it globally:

\`\`\`bash
npm install -g @textavia/mcp
textavia-mcp
\`\`\`

Use this MCP server config in clients that accept stdio server definitions:

\`\`\`json
{
  "mcpServers": {
    "textavia": {
      "command": "npx",
      "args": ["-y", "@textavia/mcp"]
    }
  }
}
\`\`\`

## Registry metadata

MCP Registry server name:

\`\`\`text
io.github.caravaca-labs/textavia-mcp
\`\`\`

Package: \`@textavia/mcp\`

Transport: \`stdio\`

Default behavior is local-first. Network-required tools are hidden by default in
the published stdio command.

## What it exposes

Tools are generated from canonical registry IDs. Examples:

- \`textavia.json_format\`
- \`textavia.json_validate\`
- \`textavia.json_repair\`
- \`textavia.json_to_types\`
- \`textavia.base64_encode\`
- \`textavia.base64_decode\`
- \`textavia.csv_to_json\`
- \`textavia.markdown_table_to_json\`
- \`textavia.regex_test\`
- \`textavia.text_clean\`
- \`textavia.text_privacy_scrub\`
- \`textavia.case_slug\`
- \`textavia.hash_sha256\`
- \`textavia.random_uuid\`

All MCP execution calls the same registry executors used by the CLI.

Each MCP tool accepts:

\`\`\`json
{
  "input": "text to process",
  "file": "optional/path/to/file.txt",
  "options": {}
}
\`\`\`

Use \`input\` for direct text. Use \`file\` when the agent should read from disk.
Options are validated against each tool's registry schema.

## Safety model

- Standard tools run locally.
- Network-required tools are hidden by default.
- File input is explicit through the MCP \`file\` argument.
- The package does not include postinstall scripts.
- The package does not require telemetry to run.
- JSON outputs are deterministic and use the same error codes/contracts as the
  CLI where applicable.

The library API exports \`createTextaviaMcpServer\`, \`buildMcpRegistry\`, and
\`executeMcpTool\` for hosts that want tighter filtering, category selection,
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
`;
}

function writeDeveloperToolData(
  tools: readonly TextaviaToolDefinition[],
): void {
  for (const tool of tools) {
    writeDoc(
      join(DOCS_DIR, 'developer-tools', `${tool.id}.json`),
      `${JSON.stringify(
        {
          id: tool.id,
          name: tool.name,
          summary: tool.summary,
          description: tool.description,
          category: tool.category,
          command: `txv run ${tool.id}`,
          aliases: tool.aliases,
          examples: tool.examples,
          webUrl: tool.webUrl,
          docsUrl: tool.docsUrl,
          inputKind: tool.inputKind,
          outputKind: tool.outputKind,
          stability: tool.stability,
          requiresNetwork: tool.requiresNetwork === true,
          requiresFilesystem: tool.requiresFilesystem === true,
          requiresOptionalPlugin: tool.requiresOptionalPlugin,
        },
        null,
        2,
      )}\n`,
    );
  }
}

function writeDeveloperHubData(): void {
  writeDoc(
    join(DOCS_DIR, 'developers.json'),
    `${JSON.stringify(
      {
        title: 'Textavia for Developers',
        sections: [
          'CLI',
          'npm package',
          'core library',
          'MCP server',
          'agent skills',
          'GitHub',
          'examples',
          'privacy/local-first',
        ],
        privacy: {
          telemetry: false,
          accountRequired: false,
          apiKeyRequired: false,
          networkDefault: false,
        },
        links: {
          docs: 'https://github.com/Caravaca-Labs/textavia-cli/tree/main/docs',
          tools: 'https://textavia.com/tools',
          cli: 'https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/cli.md',
          mcp: 'https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/mcp.md',
          agentSkills:
            'https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/agent-skills.md',
        },
      },
      null,
      2,
    )}\n`,
  );
}

/** Main generation entrypoint. Throws on example validation failures. */
export function generateDocs(): void {
  const registry = buildRegistryForDocs();
  const tools = registry.list({ includeUnavailable: true });

  const errors = validateExamples(tools);
  if (errors.length > 0) {
    throw new Error(
      `Docs generation aborted: examples reference missing tools.\n${errors.join('\n')}`,
    );
  }

  writeDoc(join(DOCS_DIR, 'cli.md'), renderCliDoc(tools));
  writeDoc(join(DOCS_DIR, 'registry.md'), renderRegistryDoc(tools));
  writeDoc(
    join(DOCS_DIR, 'adding-tools.md'),
    '# Adding Tools\n\nSee `docs/registry.md` for the current registry. New tools are added by registering a `TextaviaToolDefinition` in `@textavia/plugin-standard` and writing a test.\n',
  );
  writeDoc(join(DOCS_DIR, 'recipes.md'), renderRecipesDoc());
  writeDoc(join(DOCS_DIR, 'mcp.md'), renderMcpDoc());
  writeDeveloperToolData(tools);
  writeDeveloperHubData();
}

// When run directly via tsx, generate docs.
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDocs();
  process.stdout.write('Docs generated.\n');
}
