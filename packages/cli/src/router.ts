/**
 * @fileoverview Command router.
 *
 * Dispatches parsed argv to meta commands (run, tools, recipe, agent) or to
 * dynamic `txv <namespace> <operation> [input]` tool execution. Tool aliases
 * route through registry metadata, not one-off command files.
 */

import {
  type AgentManifest,
  PluginMissingError,
  type ToolRegistry,
  UsageError,
} from '@textavia/core';
import { type ParsedArgs, parseArgs } from './argv.js';
import { loadConfig, mergeDefaults } from './config.js';
import { type ProcessSurface, executeTool } from './execute.js';
import { type PromptFn, resolveInput } from './input.js';
import { writeError } from './output.js';
import { runRecipe } from './recipes.js';

/** Dependencies injected into the router for testability. */
export interface RouterDeps {
  readonly registry: ToolRegistry;
  readonly version: string;
  readonly proc: ProcessSurface;
  readonly prompt?: PromptFn;
  readonly loader?: typeof import('./registry-builder.js').loadOptionalPlugin;
}

/** Runs the CLI for a given argv and returns the process exit code. */
export async function runCli(
  argv: readonly string[],
  deps: RouterDeps,
): Promise<number> {
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(argv);
  } catch (error) {
    return writeError(error, {
      mode: argv.includes('--json') ? 'agent' : 'human',
      json: argv.includes('--json'),
      debug: argv.includes('--debug'),
      stderr: deps.proc.stderr,
    });
  }
  const startedAt = Date.now();
  const cwd = deps.proc.cwd;

  let config = null;
  try {
    config = await loadConfig(cwd, parsed.globals.config);
  } catch (error) {
    return writeError(error, {
      mode: 'human',
      json: parsed.globals.json === true,
      debug: parsed.globals.debug === true,
      stderr: deps.proc.stderr,
    });
  }

  parsed = applyConfigAliasesAndGlobalDefaults(parsed, config);

  const allowNetwork =
    config?.network?.allow === true || parsed.globals.allowNetwork === true;
  const allowUnsafe = parsed.globals.unsafe === true;
  const command = parsed.positionals[0];

  try {
    switch (command) {
      case undefined:
        printHelp(deps);
        return 0;
      case 'help':
        printHelp(deps);
        return 0;
      case 'version':
        deps.proc.stdout.write(`${deps.version}\n`);
        return 0;
      case 'tools':
        return runDiscovery(parsed, deps);
      case 'agent':
        return await runAgent(
          parsed,
          deps,
          allowNetwork,
          allowUnsafe,
          config,
          startedAt,
        );
      case 'run':
        return await runCanonical(
          parsed,
          deps,
          allowNetwork,
          allowUnsafe,
          config,
          startedAt,
        );
      case 'recipe':
        return await runRecipe({
          registry: deps.registry,
          parsed,
          config,
          proc: deps.proc,
          prompt: deps.prompt,
          startedAt,
          allowNetwork,
          allowUnsafe,
        });
      default:
        return await runNamespaceCommand(
          parsed,
          deps,
          allowNetwork,
          allowUnsafe,
          config,
          startedAt,
        );
    }
  } catch (error) {
    return writeError(error, {
      mode: parsed.globals.json === true ? 'agent' : 'human',
      json: parsed.globals.json === true,
      debug: parsed.globals.debug === true,
      stderr: deps.proc.stderr,
    });
  }
}

async function runCanonical(
  parsed: ParsedArgs,
  deps: RouterDeps,
  allowNetwork: boolean,
  allowUnsafe: boolean,
  config: Awaited<ReturnType<typeof loadConfig>>,
  startedAt: number,
): Promise<number> {
  const toolId = parsed.positionals[1];
  if (toolId === undefined) {
    throw new UsageError('txv run requires a tool id.', {
      hint: 'Example: txv run case.slug "Hello World"',
    });
  }
  const tool = deps.registry.get(toolId) ?? deps.registry.resolveAlias(toolId);
  if (tool === undefined) {
    throw new UsageError(`Unknown tool: ${toolId}`, {
      hint: 'Run `txv tools list` to see available tools.',
    });
  }
  return executeTool({
    registry: deps.registry,
    tool,
    parsed,
    positionalInput: positionalInputFrom(parsed, 2),
    mode: parsed.globals.json === true ? 'agent' : 'human',
    proc: deps.proc,
    prompt: deps.prompt,
    startedAt,
    allowNetwork,
    allowUnsafe,
    configDefaults: mergeDefaults(config),
  });
}

async function runNamespaceCommand(
  parsed: ParsedArgs,
  deps: RouterDeps,
  allowNetwork: boolean,
  allowUnsafe: boolean,
  config: Awaited<ReturnType<typeof loadConfig>>,
  startedAt: number,
): Promise<number> {
  const namespace = parsed.positionals[0];
  if (namespace === undefined) {
    printHelp(deps);
    return 0;
  }
  // Per R4.5: a bare alias like "slug" resolves to a tool, and the next
  // positional is treated as text input (never as a file path).
  const aliasTool = deps.registry.resolveAlias(namespace);
  if (aliasTool !== undefined) {
    return executeTool({
      registry: deps.registry,
      tool: aliasTool,
      parsed,
      positionalInput: positionalInputFrom(parsed, 1),
      mode: parsed.globals.json === true ? 'agent' : 'human',
      proc: deps.proc,
      prompt: deps.prompt,
      startedAt,
      allowNetwork,
      allowUnsafe,
      configDefaults: mergeDefaults(config),
    });
  }
  // Otherwise interpret as <namespace> <operation> [input].
  const operation = parsed.positionals[1];
  const tool =
    operation === undefined
      ? undefined
      : deps.registry.resolveCommand(namespace, operation);
  if (tool === undefined) {
    throw new UsageError(
      `Unknown command: ${namespace}${operation ? ` ${operation}` : ''}`,
      {
        hint: 'Run `txv tools list` to see available tools.',
      },
    );
  }
  return executeTool({
    registry: deps.registry,
    tool,
    parsed,
    positionalInput: positionalInputFrom(parsed, 2),
    mode: parsed.globals.json === true ? 'agent' : 'human',
    proc: deps.proc,
    prompt: deps.prompt,
    startedAt,
    allowNetwork,
    allowUnsafe,
    configDefaults: mergeDefaults(config),
  });
}

function runDiscovery(parsed: ParsedArgs, deps: RouterDeps): number {
  const sub = parsed.positionals[1] ?? 'list';
  const json = parsed.globals.json === true;
  switch (sub) {
    case 'list':
      return emitTools(deps, parsed, json);
    case 'search':
      return emitSearch(deps, parsed, json);
    case 'info':
      return emitInfo(deps, parsed, json);
    case 'docs':
      return emitDocs(deps, parsed, json);
    default:
      throw new UsageError(`Unknown tools subcommand: ${sub}`, {
        hint: 'Use list, search, info, or docs.',
      });
  }
}

function emitTools(
  deps: RouterDeps,
  parsed: ParsedArgs,
  json: boolean,
): number {
  const category = findOption(parsed, 'category');
  const tools = deps.registry.list({
    category: category as never,
    includeUnavailable: findFlag(parsed, 'all'),
  });
  if (json) {
    deps.proc.stdout.write(`${JSON.stringify({ tools }, null, 2)}\n`);
  } else {
    for (const tool of tools) {
      deps.proc.stdout.write(`${tool.id.padEnd(28)} ${tool.summary}\n`);
    }
  }
  return 0;
}

function emitSearch(
  deps: RouterDeps,
  parsed: ParsedArgs,
  json: boolean,
): number {
  const query = parsed.positionals[2];
  if (query === undefined) {
    throw new UsageError('txv tools search requires a query.');
  }
  const tools = deps.registry.search(query);
  if (json) {
    deps.proc.stdout.write(
      `${JSON.stringify({ query, tools: tools.map((t) => t.id) }, null, 2)}\n`,
    );
  } else {
    for (const tool of tools) {
      deps.proc.stdout.write(`${tool.id.padEnd(28)} ${tool.summary}\n`);
    }
  }
  return 0;
}

function emitInfo(deps: RouterDeps, parsed: ParsedArgs, json: boolean): number {
  const id = parsed.positionals[2];
  if (id === undefined) {
    throw new UsageError('txv tools info requires a tool id.');
  }
  const tool = deps.registry.get(id) ?? deps.registry.resolveAlias(id);
  if (tool === undefined) {
    throw new UsageError(`Unknown tool: ${id}`);
  }
  if (json) {
    deps.proc.stdout.write(`${JSON.stringify(tool, null, 2)}\n`);
  } else {
    deps.proc.stdout.write(`${tool.id} — ${tool.name}\n${tool.description}\n`);
    deps.proc.stdout.write(
      `category: ${tool.category}  stability: ${tool.stability}\n`,
    );
    if (tool.webUrl !== undefined) {
      deps.proc.stdout.write(`web: ${tool.webUrl}\n`);
    }
    deps.proc.stdout.write(`command: txv run ${tool.id}\n`);
  }
  return 0;
}

function emitDocs(deps: RouterDeps, parsed: ParsedArgs, json: boolean): number {
  const id = parsed.positionals[2];
  if (id === undefined) {
    throw new UsageError('txv tools docs requires a tool id.');
  }
  const tool = deps.registry.get(id) ?? deps.registry.resolveAlias(id);
  if (tool === undefined) {
    throw new UsageError(`Unknown tool: ${id}`);
  }
  const doc = {
    id: tool.id,
    name: tool.name,
    summary: tool.summary,
    description: tool.description,
    examples: tool.examples,
    webUrl: tool.webUrl,
    docsUrl: tool.docsUrl,
  };
  if (json) {
    deps.proc.stdout.write(`${JSON.stringify(doc, null, 2)}\n`);
  } else {
    deps.proc.stdout.write(`# ${tool.name}\n\n${tool.description}\n\n`);
    for (const example of tool.examples) {
      deps.proc.stdout.write(
        `## ${example.title}\n\n    ${example.command}\n\n`,
      );
    }
  }
  return 0;
}

async function runAgent(
  parsed: ParsedArgs,
  deps: RouterDeps,
  allowNetwork: boolean,
  allowUnsafe: boolean,
  config: Awaited<ReturnType<typeof loadConfig>>,
  startedAt: number,
): Promise<number> {
  const sub = parsed.positionals[1];
  if (sub === 'manifest') {
    const manifest: AgentManifest = deps.registry.manifest({
      includeExperimental: findFlag(parsed, 'experimental'),
      includeUnavailable: findFlag(parsed, 'all'),
    });
    deps.proc.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
    return 0;
  }
  if (sub === 'run') {
    const toolId = parsed.positionals[2];
    if (toolId === undefined) {
      throw new UsageError('txv agent run requires a tool id.');
    }
    const tool =
      deps.registry.get(toolId) ?? deps.registry.resolveAlias(toolId);
    if (tool === undefined) {
      throw new UsageError(`Unknown tool: ${toolId}`);
    }
    // Agent mode forces JSON, quiet, no color, and no prompts.
    const agentParsed: ParsedArgs = {
      ...parsed,
      globals: { ...parsed.globals, json: true, quiet: true, noColor: true },
    };
    return executeTool({
      registry: deps.registry,
      tool,
      parsed: agentParsed,
      positionalInput: positionalInputFrom(parsed, 3),
      mode: 'agent',
      proc: deps.proc,
      startedAt,
      allowNetwork,
      allowUnsafe,
      configDefaults: mergeDefaults(config),
    });
  }
  throw new UsageError(`Unknown agent subcommand: ${sub ?? ''}`, {
    hint: 'Use `agent run <tool-id>` or `agent manifest`.',
  });
}

function printHelp(deps: RouterDeps): void {
  const out = deps.proc.stdout;
  out.write(`Textavia CLI v${deps.version}\n\n`);
  out.write('Usage: txv <namespace> <operation> [input] [options]\n');
  out.write('       txv run <tool-id> [input] [options]\n');
  out.write('       txv tools list|search|info|docs\n');
  out.write('       txv recipe <name> [input] [options]\n');
  out.write('       txv agent run <tool-id> | txv agent manifest\n\n');
  out.write('Run `txv tools list` to see available tools.\n');
}

function findOption(parsed: ParsedArgs, name: string): string | undefined {
  const value = parsed.toolOptions[name];
  return typeof value === 'string' ? value : undefined;
}

function findFlag(parsed: ParsedArgs, name: string): boolean {
  return parsed.toolOptions[name] === true;
}

function applyConfigAliasesAndGlobalDefaults(
  parsed: ParsedArgs,
  config: Awaited<ReturnType<typeof loadConfig>>,
): ParsedArgs {
  const command = parsed.positionals[0];
  const alias = command === undefined ? undefined : config?.aliases?.[command];
  const aliasParsed =
    command === undefined || alias === undefined
      ? undefined
      : parseAliasDefinition(command, alias);
  return {
    ...parsed,
    globals: {
      ...parsed.globals,
      ...(parsed.globals.json !== true &&
      config?.defaults?.['output.json'] === true
        ? { json: true }
        : {}),
    },
    positionals:
      aliasParsed === undefined
        ? parsed.positionals
        : [...aliasParsed.positionals, ...parsed.positionals.slice(1)],
  };
}

function parseAliasDefinition(aliasName: string, alias: string): ParsedArgs {
  const tokens = alias.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    throw new UsageError(`Config alias "${aliasName}" is empty.`);
  }
  const parsed = parseArgs(tokens);
  if (
    Object.keys(parsed.globals).length > 0 ||
    Object.keys(parsed.toolOptions).length > 0
  ) {
    throw new UsageError(
      `Config alias "${aliasName}" must contain command words only.`,
    );
  }
  return parsed;
}

function positionalInputFrom(
  parsed: ParsedArgs,
  startIndex: number,
): string | undefined {
  const values = parsed.positionals.slice(startIndex);
  return values.length === 0 ? undefined : values.join('\n');
}

// Re-exported so the unused PluginMissingError import stays meaningful for the
// optional-plugin error path documented in the executor.
export { PluginMissingError };
export { resolveInput };
