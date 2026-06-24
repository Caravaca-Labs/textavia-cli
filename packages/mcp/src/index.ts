/**
 * @fileoverview MCP adapter for the Textavia registry.
 *
 * The MCP server exposes tools generated from the same registry used by the
 * CLI. Execution calls tool executors directly with `mode: "mcp"` rather than
 * duplicating transform logic.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  NetworkRequiredError,
  PluginMissingError,
  type ResolvedInput,
  type TextaviaToolDefinition,
  type ToolCategory,
  type ToolExecutionResult,
  type ToolRegistry,
  UsageError,
  toStructuredError,
} from '@textavia/core';
import { createToolRegistry } from '@textavia/core';
import {
  nodeCryptoAdapter,
  nodeFileAdapter,
  nodeStreamAdapter,
} from '@textavia/node-adapters';
import { registerStandardTools } from '@textavia/plugin-standard';
import { z } from 'zod';

/** Runtime config for MCP exposure and execution. */
export interface TextaviaMcpConfig {
  readonly enabledCategories?: readonly ToolCategory[];
  readonly allowNetwork?: boolean;
  readonly allowFilesystem?: boolean;
  readonly maxInputBytes?: number;
}

/** MCP argument schema shared by every generated Textavia tool. */
export const McpToolInputSchema = z.object({
  input: z.string().optional(),
  file: z.string().optional(),
  options: z.record(z.unknown()).optional(),
});

export type McpToolInput = z.infer<typeof McpToolInputSchema>;

/** Tool definition shape used by tests and manifest generation. */
export interface GeneratedMcpTool {
  readonly name: string;
  readonly toolId: string;
  readonly description: string;
  readonly category: ToolCategory;
  readonly requiresNetwork: boolean;
  readonly requiresFilesystem: boolean;
}

/** Builds the default MCP registry. */
export function buildMcpRegistry(): ToolRegistry {
  const registry = createToolRegistry({
    cliName: 'textavia-mcp',
    version: '0.1.0',
  });
  registerStandardTools(registry);
  return registry;
}

/** Converts a canonical registry ID into an MCP-safe tool name. */
export function mcpToolName(toolId: string): string {
  const parts = toolId.split('.');
  const publicParts =
    parts.length > 2 &&
    ['data', 'dev', 'encoding', 'media'].includes(parts[0] ?? '')
      ? parts.slice(1)
      : parts;
  return `textavia.${publicParts.join('_').replaceAll('-', '_')}`;
}

/** Returns registry-generated MCP tool definitions after config filtering. */
export function buildMcpToolList(
  registry: ToolRegistry,
  config: TextaviaMcpConfig = {},
): readonly GeneratedMcpTool[] {
  return registry
    .list({ includeUnavailable: false })
    .filter((tool) => {
      if (
        config.enabledCategories !== undefined &&
        !config.enabledCategories.includes(tool.category)
      ) {
        return false;
      }
      if (tool.requiresNetwork === true && config.allowNetwork !== true) {
        return false;
      }
      if (
        tool.requiresFilesystem === true &&
        config.allowFilesystem === false
      ) {
        return false;
      }
      return true;
    })
    .map((tool) => ({
      name: mcpToolName(tool.id),
      toolId: tool.id,
      description: tool.description,
      category: tool.category,
      requiresNetwork: tool.requiresNetwork === true,
      requiresFilesystem: tool.requiresFilesystem === true,
    }));
}

/** Creates a high-level MCP server populated from the Textavia registry. */
export function createTextaviaMcpServer(
  config: TextaviaMcpConfig = {},
  registry = buildMcpRegistry(),
): McpServer {
  const server = new McpServer({ name: 'textavia', version: '0.1.0' });
  const toolsByName = new Map(
    buildMcpToolList(registry, config).map((tool) => [tool.name, tool.toolId]),
  );

  for (const generated of buildMcpToolList(registry, config)) {
    server.registerTool(
      generated.name,
      {
        title: generated.toolId,
        description: generated.description,
        inputSchema: McpToolInputSchema,
      },
      async (args) => {
        const toolId = toolsByName.get(generated.name);
        if (toolId === undefined) {
          throw new UsageError(`Unknown MCP tool: ${generated.name}`);
        }
        const result = await executeMcpTool(registry, toolId, args, config);
        return {
          content: [{ type: 'text' as const, text: renderMcpResult(result) }],
        };
      },
    );
  }
  return server;
}

/** Executes a registry tool from MCP arguments. */
export async function executeMcpTool(
  registry: ToolRegistry,
  toolId: string,
  args: unknown,
  config: TextaviaMcpConfig = {},
): Promise<ToolExecutionResult> {
  const tool = registry.get(toolId);
  if (tool === undefined) {
    throw new UsageError(`Unknown MCP tool id: ${toolId}`);
  }
  assertMcpToolAvailable(tool, config);
  const parsed = McpToolInputSchema.parse(args);
  const options = parseOptions(tool, parsed.options ?? {});
  const input = await resolveMcpInput(tool, parsed, config);
  const executor = tool.execute;
  if (executor === undefined) {
    throw new UsageError(`MCP tool "${tool.id}" has no executor.`);
  }
  return executor(input, options, {
    toolId: tool.id,
    cwd: process.cwd(),
    mode: 'mcp',
    allowNetwork: config.allowNetwork === true,
    allowFilesystem: config.allowFilesystem !== false,
    allowUnsafe: false,
    maxInputBytes: config.maxInputBytes,
    adapters: {
      fs: nodeFileAdapter,
      streams: nodeStreamAdapter,
      crypto: nodeCryptoAdapter,
    },
  });
}

/** Starts the Textavia MCP server over stdio. */
export async function startStdioServer(
  config: TextaviaMcpConfig = {},
): Promise<void> {
  const server = createTextaviaMcpServer(config);
  await server.connect(new StdioServerTransport());
}

function assertMcpToolAvailable(
  tool: TextaviaToolDefinition,
  config: TextaviaMcpConfig,
): void {
  if (tool.requiresOptionalPlugin !== undefined && tool.execute === undefined) {
    throw new PluginMissingError(
      `MCP tool "${tool.id}" requires optional plugin "${tool.requiresOptionalPlugin}".`,
      {
        plugin: tool.requiresOptionalPlugin,
        install:
          tool.installHint ?? `npm install -g ${tool.requiresOptionalPlugin}`,
      },
    );
  }
  if (tool.requiresNetwork === true && config.allowNetwork !== true) {
    throw new NetworkRequiredError(`MCP tool "${tool.id}" requires network.`);
  }
  if (tool.requiresFilesystem === true && config.allowFilesystem === false) {
    throw new UsageError(`MCP tool "${tool.id}" requires filesystem access.`);
  }
}

function parseOptions(
  tool: TextaviaToolDefinition,
  raw: Readonly<Record<string, unknown>>,
): unknown {
  const result = tool.optionsSchema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new UsageError(
      `Invalid MCP options for "${tool.id}": ${
        issue?.message ?? 'unknown validation error'
      }`,
    );
  }
  return result.data;
}

async function resolveMcpInput(
  tool: TextaviaToolDefinition,
  parsed: McpToolInput,
  config: TextaviaMcpConfig,
): Promise<ResolvedInput> {
  const allowFilesystem = config.allowFilesystem !== false;
  if (parsed.file !== undefined) {
    if (!allowFilesystem) {
      throw new UsageError('MCP filesystem input is disabled.');
    }
    if (prefersBytes(tool)) {
      const bytes = await nodeFileAdapter.readBytes(parsed.file);
      assertInputSize(bytes.byteLength, config.maxInputBytes);
      return {
        source: 'file',
        kind: 'bytes',
        encoding: 'utf8',
        bytes,
        fileName: parsed.file,
      };
    }
    const text = await nodeFileAdapter.readText(parsed.file, 'utf8');
    assertInputSize(Buffer.byteLength(text), config.maxInputBytes);
    return {
      source: 'file',
      kind: 'text',
      encoding: 'utf8',
      text,
      fileName: parsed.file,
    };
  }

  if (parsed.input !== undefined) {
    assertInputSize(Buffer.byteLength(parsed.input), config.maxInputBytes);
    return {
      source: 'input',
      kind: 'text',
      encoding: 'utf8',
      text: parsed.input,
    };
  }

  if (tool.inputKind.includes('generated')) {
    return { source: 'generated', kind: 'generated', encoding: 'utf8' };
  }
  throw new UsageError('MCP tool input is required.');
}

function assertInputSize(size: number, limit: number | undefined): void {
  if (limit !== undefined && size > limit) {
    throw new UsageError(`MCP input exceeds maxInputBytes (${limit}).`);
  }
}

function prefersBytes(tool: TextaviaToolDefinition): boolean {
  return (
    tool.inputKind.includes('bytes') &&
    !tool.inputKind.includes('text') &&
    !tool.inputKind.includes('json')
  );
}

function renderMcpResult(result: ToolExecutionResult): string {
  if (typeof result.output === 'string') {
    return result.output;
  }
  if (result.output instanceof Uint8Array) {
    return Buffer.from(result.output).toString('base64');
  }
  return JSON.stringify(result.output, null, 2);
}

/** Converts thrown MCP execution failures into structured JSON text. */
export function renderMcpError(error: unknown): string {
  return JSON.stringify({ ok: false, error: toStructuredError(error) });
}
