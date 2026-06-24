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

Run the MCP server:

\`\`\`bash
npx @textavia/mcp
\`\`\`

Default behavior is local-first. Network tools are hidden unless enabled by config, and filesystem use can be disabled by the MCP host config.

Example generated tools:

- \`textavia.case_convert\` style names are generated from canonical registry IDs.
- \`textavia.base64_encode\`
- \`textavia.json_format\`
- \`textavia.csv_to_json\`
- \`textavia.regex_test\`

All MCP execution calls the same registry executors used by the CLI.
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
          developers: 'https://textavia.com/developers',
          tools: 'https://textavia.com/tools',
          cli: 'https://textavia.com/developers/textavia-cli',
          mcp: 'https://textavia.com/developers/mcp',
          agentSkills: 'https://textavia.com/developers/agent-skills',
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
