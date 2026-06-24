/**
 * @fileoverview The tool registry: the single source of truth for tools.
 *
 * The CLI router, docs generator, MCP server, and agent manifest all consume
 * the registry rather than duplicating command definitions.
 */

import type {
  TextaviaToolDefinition,
  ToolCategory,
  ToolStability,
} from './types.js';

/** Filters for {@link ToolRegistry.list}. */
export interface ToolListFilters {
  readonly category?: ToolCategory;
  readonly stability?: ToolStability;
  /** Include future/web-only/deprecated entries that have no executor. */
  readonly includeUnavailable?: boolean;
}

/** Filters for {@link ToolRegistry.search}. */
export interface ToolSearchFilters extends ToolListFilters {
  readonly category?: ToolCategory;
}

/** Options controlling which tools appear in an agent manifest. */
export interface ManifestOptions {
  readonly includeExperimental?: boolean;
  readonly includeUnavailable?: boolean;
}

/** A single tool's compact manifest entry. */
export interface AgentManifestTool {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ToolCategory;
  readonly inputKind: readonly string[];
  readonly outputKind: readonly string[];
  readonly command: string;
  readonly stability: ToolStability;
  readonly webUrl?: string;
  readonly docsUrl?: string;
  readonly requiresNetwork?: boolean;
  readonly requiresFilesystem?: boolean;
  readonly requiresOptionalPlugin?: string;
  readonly available: boolean;
}

/** Top-level agent manifest emitted by `txv agent manifest --json`. */
export interface AgentManifest {
  readonly cli: string;
  readonly version: string;
  readonly tools: readonly AgentManifestTool[];
}

/** Version injected by callers so core stays free of a package.json import. */
export interface RegistryVersion {
  readonly cliName: string;
  readonly version: string;
}

/**
 * Thrown when a definition is structurally invalid at registration time.
 * Kept as a plain Error (not a TextaviaError) because registry assembly is a
 * maintainer-time concern, not a CLI exit-code concern.
 */
export class RegistryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistryValidationError';
  }
}

/** Registry interface consumed by the CLI, docs, and MCP layers. */
export interface ToolRegistry {
  register(tool: TextaviaToolDefinition): void;
  get(id: string): TextaviaToolDefinition | undefined;
  resolveCommand(
    namespace: string,
    operation?: string,
  ): TextaviaToolDefinition | undefined;
  resolveAlias(alias: string): TextaviaToolDefinition | undefined;
  list(filters?: ToolListFilters): readonly TextaviaToolDefinition[];
  search(
    query: string,
    filters?: ToolSearchFilters,
  ): readonly TextaviaToolDefinition[];
  manifest(options?: ManifestOptions): AgentManifest;
  size(): number;
  all(): readonly TextaviaToolDefinition[];
}

function isAvailable(tool: TextaviaToolDefinition): boolean {
  return (
    tool.execute !== undefined &&
    tool.stability !== 'future' &&
    tool.stability !== 'web-only'
  );
}

function assertValidDefinition(tool: TextaviaToolDefinition): void {
  if (typeof tool.id !== 'string' || tool.id.length === 0) {
    throw new RegistryValidationError('Tool id must be a non-empty string.');
  }
  if (!/^[a-z0-9]+(?:\.[a-z0-9-]+)*$/.test(tool.id)) {
    throw new RegistryValidationError(
      `Tool id "${tool.id}" must match <namespace>.<operation> (lowercase).`,
    );
  }
  if (typeof tool.name !== 'string' || tool.name.length === 0) {
    throw new RegistryValidationError(
      `Tool "${tool.id}" must have a non-empty name.`,
    );
  }
  if (tool.inputKind.length === 0 || tool.outputKind.length === 0) {
    throw new RegistryValidationError(
      `Tool "${tool.id}" must declare at least one input and output kind.`,
    );
  }
  if (tool.optionsSchema === undefined) {
    throw new RegistryValidationError(
      `Tool "${tool.id}" must declare an optionsSchema.`,
    );
  }
  if (tool.stability === 'future' && tool.execute !== undefined) {
    throw new RegistryValidationError(
      `Tool "${tool.id}" is marked future but has an executor.`,
    );
  }
}

function canReplaceOptionalPlaceholder(
  existing: TextaviaToolDefinition,
  replacement: TextaviaToolDefinition,
): boolean {
  return (
    existing.id === replacement.id &&
    existing.execute === undefined &&
    replacement.execute !== undefined &&
    existing.requiresOptionalPlugin !== undefined &&
    existing.requiresOptionalPlugin === replacement.requiresOptionalPlugin
  );
}

/** Creates a fresh, isolated tool registry. */
export function createToolRegistry(version: RegistryVersion): ToolRegistry {
  const byId = new Map<string, TextaviaToolDefinition>();
  const byAlias = new Map<string, string>();

  function register(tool: TextaviaToolDefinition): void {
    assertValidDefinition(tool);
    const existing = byId.get(tool.id);
    if (existing !== undefined) {
      if (canReplaceOptionalPlaceholder(existing, tool)) {
        replaceTool(existing, tool);
        return;
      }
      throw new RegistryValidationError(
        `Duplicate canonical tool id: "${tool.id}".`,
      );
    }
    for (const alias of tool.aliases) {
      if (alias === tool.id) {
        continue;
      }
      const conflict = byAlias.get(alias);
      if (conflict !== undefined && conflict !== tool.id) {
        throw new RegistryValidationError(
          `Alias "${alias}" for tool "${tool.id}" already belongs to "${conflict}".`,
        );
      }
    }
    byId.set(tool.id, tool);
    for (const alias of tool.aliases) {
      byAlias.set(alias, tool.id);
    }
  }

  function replaceTool(
    existing: TextaviaToolDefinition,
    replacement: TextaviaToolDefinition,
  ): void {
    for (const alias of replacement.aliases) {
      if (alias === replacement.id) {
        continue;
      }
      const conflict = byAlias.get(alias);
      if (conflict !== undefined && conflict !== existing.id) {
        throw new RegistryValidationError(
          `Alias "${alias}" for tool "${replacement.id}" already belongs to "${conflict}".`,
        );
      }
    }
    for (const alias of existing.aliases) {
      byAlias.delete(alias);
    }
    byId.set(replacement.id, replacement);
    for (const alias of replacement.aliases) {
      byAlias.set(alias, replacement.id);
    }
  }

  function get(id: string): TextaviaToolDefinition | undefined {
    return byId.get(id);
  }

  function resolveAlias(alias: string): TextaviaToolDefinition | undefined {
    const id = byAlias.get(alias) ?? alias;
    return byId.get(id);
  }

  function resolveCommand(
    namespace: string,
    operation?: string,
  ): TextaviaToolDefinition | undefined {
    if (operation === undefined) {
      // Bare namespace resolves through aliases (e.g. "slug" -> case.slug).
      return resolveAlias(namespace);
    }
    const direct = byId.get(`${namespace}.${operation}`);
    if (direct !== undefined) {
      return direct;
    }
    // Canonical ids may carry a category prefix (e.g. dev.json.format). Match
    // a tool whose id ends with ".<namespace>.<operation>" so user commands
    // like "json format" resolve to dev.json.format. Return undefined when
    // more than one tool matches to surface ambiguous usage.
    const suffix = `.${namespace}.${operation}`;
    const matches: TextaviaToolDefinition[] = [];
    for (const tool of byId.values()) {
      if (tool.id.endsWith(suffix)) {
        matches.push(tool);
      }
    }
    if (matches.length === 1) {
      return matches[0];
    }
    // Fall back to alias for "<namespace> <operation>" style invocations.
    return resolveAlias(`${namespace} ${operation}`);
  }

  function matchesFilters(
    tool: TextaviaToolDefinition,
    filters?: ToolListFilters,
  ): boolean {
    if (filters?.category !== undefined && tool.category !== filters.category) {
      return false;
    }
    if (
      filters?.stability !== undefined &&
      tool.stability !== filters.stability
    ) {
      return false;
    }
    if (!filters?.includeUnavailable && !isAvailable(tool)) {
      return false;
    }
    return true;
  }

  function list(filters?: ToolListFilters): readonly TextaviaToolDefinition[] {
    const tools = Array.from(byId.values()).sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    return tools.filter((tool) => matchesFilters(tool, filters));
  }

  function search(
    query: string,
    filters?: ToolSearchFilters,
  ): readonly TextaviaToolDefinition[] {
    const q = query.trim().toLowerCase();
    if (q.length === 0) {
      return [];
    }
    const base = list({ ...filters, includeUnavailable: true });
    return base.filter((tool) => {
      const haystack = [
        tool.id,
        tool.name,
        tool.summary,
        tool.description,
        ...tool.aliases,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  function manifest(options?: ManifestOptions): AgentManifest {
    const includeUnavailable = options?.includeUnavailable === true;
    const includeExperimental = options?.includeExperimental === true;
    const tools = Array.from(byId.values())
      .sort((a, b) => a.id.localeCompare(b.id))
      .filter((tool) => {
        if (!isAvailable(tool)) {
          return includeUnavailable;
        }
        if (tool.stability === 'experimental') {
          return includeExperimental;
        }
        return true;
      });

    const entries: AgentManifestTool[] = tools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      inputKind: tool.inputKind,
      outputKind: tool.outputKind,
      command: `txv run ${tool.id}`,
      stability: tool.stability,
      webUrl: tool.webUrl,
      docsUrl: tool.docsUrl,
      requiresNetwork: tool.requiresNetwork,
      requiresFilesystem: tool.requiresFilesystem,
      requiresOptionalPlugin: tool.requiresOptionalPlugin,
      available: isAvailable(tool),
    }));

    return {
      cli: version.cliName,
      version: version.version,
      tools: entries,
    };
  }

  return {
    register,
    get,
    resolveCommand,
    resolveAlias,
    list,
    search,
    manifest,
    size: () => byId.size,
    all: () => Array.from(byId.values()),
  };
}
