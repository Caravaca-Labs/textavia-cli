/**
 * @fileoverview Recipe runner for named registry pipelines.
 *
 * Recipes are deliberately expressed as canonical tool IDs plus options. The
 * runner validates every step before execution so aliases cannot bypass the
 * registry contract.
 */

import {
  PluginMissingError,
  type RecipeDefinition,
  type ResolvedInput,
  type TextaviaConfig,
  type TextaviaToolDefinition,
  type ToolExecutionContext,
  type ToolExecutionResult,
  type ToolRegistry,
  UsageError,
} from '@textavia/core';
import {
  nodeCryptoAdapter,
  nodeFileAdapter,
  nodeStreamAdapter,
} from '@textavia/node-adapters';
import type { z } from 'zod';
import type { GlobalOptions, ParsedArgs } from './argv.js';
import { mergeDefaults } from './config.js';
import { type ProcessSurface, assertCapabilityGates } from './execute.js';
import { type PromptFn, resolveInput } from './input.js';
import { type OutputContext, writeSuccess } from './output.js';

/** Built-in pipelines available without config. */
export const BUILTIN_RECIPES: readonly RecipeDefinition[] = [
  {
    id: 'seo-slugs',
    name: 'SEO slugs',
    description: 'Clean text and convert each line/title to URL slugs.',
    streaming: true,
    steps: [
      ['text.clean', {}],
      ['case.slug', { separator: '-' }],
    ],
  },
  {
    id: 'clean-keywords',
    name: 'Clean keywords',
    description: 'Lowercase, trim, remove empty lines, dedupe, and sort.',
    steps: [
      ['text.lower', {}],
      ['lines.trim', {}],
      ['lines.remove-empty', {}],
      ['lines.unique', {}],
      ['lines.sort', {}],
    ],
  },
  {
    id: 'normalize-lines',
    name: 'Normalize lines',
    description: 'Trim every line and remove empty lines.',
    streaming: true,
    steps: [
      ['lines.trim', {}],
      ['lines.remove-empty', {}],
    ],
  },
  {
    id: 'safe-filenames',
    name: 'Safe filenames',
    description: 'Clean text and convert it to filesystem-safe slugs.',
    streaming: true,
    steps: [
      ['text.clean', {}],
      ['case.slug', { separator: '-' }],
    ],
  },
  {
    id: 'json-api',
    name: 'JSON API',
    description: 'Pretty-format JSON for API fixtures and examples.',
    steps: [['dev.json.format', { indent: 2 }]],
  },
  {
    id: 'csv-clean',
    name: 'CSV clean',
    description: 'Normalize CSV whitespace and remove empty rows.',
    steps: [['data.csv.clean', {}]],
  },
];

interface RecipeRunParams {
  readonly registry: ToolRegistry;
  readonly parsed: ParsedArgs;
  readonly config: TextaviaConfig | null;
  readonly proc: ProcessSurface;
  readonly prompt?: PromptFn;
  readonly startedAt: number;
  readonly allowNetwork: boolean;
  readonly allowUnsafe: boolean;
}

/** Runs `txv recipe <name>` using built-in and config-defined recipes. */
export async function runRecipe(params: RecipeRunParams): Promise<number> {
  const recipeName = params.parsed.positionals[1];
  if (recipeName === undefined) {
    throw new UsageError('txv recipe requires a recipe name.', {
      hint: `Built-ins: ${BUILTIN_RECIPES.map((recipe) => recipe.id).join(', ')}`,
    });
  }

  const recipe = resolveRecipe(recipeName, params.config);
  if (recipe === undefined) {
    throw new UsageError(`Unknown recipe: ${recipeName}`, {
      hint: `Built-ins: ${BUILTIN_RECIPES.map((item) => item.id).join(', ')}`,
    });
  }

  const steps = validateRecipeSteps(recipe, params);
  const firstTool = steps[0]?.tool;
  if (firstTool === undefined) {
    throw new UsageError(`Recipe "${recipe.id}" has no steps.`);
  }
  const inferredInput = inferFileInputForWrite(
    params.parsed.globals,
    positionalInputFrom(params.parsed, 2),
  );

  const initial = await resolveInput(
    {
      globals: inferredInput.globals,
      positional: inferredInput.positional,
      mode: params.parsed.globals.json === true ? 'agent' : 'human',
      stdin: {
        stream: params.proc.stdin,
        isTty: Boolean(
          (params.proc.stdin as NodeJS.ReadableStream & { isTTY?: boolean })
            .isTTY,
        ),
      },
    },
    firstTool,
    params.prompt,
  );

  const contextBase = buildContext(params, `recipe.${recipe.id}`);
  let currentInput = initial;
  let currentResult: ToolExecutionResult | undefined;
  const configDefaults = mergeDefaults(params.config);

  for (const step of steps) {
    const executor = step.tool.execute;
    if (executor === undefined) {
      throw new UsageError(`Recipe step "${step.tool.id}" has no executor.`);
    }
    const options = parseStepOptions(step.tool, {
      ...configDefaults,
      ...(step.options ?? {}),
    });
    currentResult = await executor(currentInput, options, {
      ...contextBase,
      toolId: step.tool.id,
    });
    currentInput = resultToGeneratedInput(currentResult);
  }

  if (currentResult === undefined) {
    throw new UsageError(`Recipe "${recipe.id}" produced no result.`);
  }

  const outputContext: OutputContext = {
    toolId: `recipe.${recipe.id}`,
    mode: params.parsed.globals.json === true ? 'agent' : 'human',
    json: params.parsed.globals.json === true,
    quiet: params.parsed.globals.quiet === true,
    out: params.parsed.globals.out,
    outDir: params.parsed.globals.outDir,
    write: params.parsed.globals.write === true,
    dryRun: params.parsed.globals.dryRun === true,
    backup: params.parsed.globals.backup === true,
    sourceFile: initial.fileName,
    inputType: initial.kind,
    startedAt: params.startedAt,
    streams: { stdout: params.proc.stdout, stderr: params.proc.stderr },
  };
  const resultWithExplanation =
    params.parsed.globals.explain === true &&
    currentResult.explanation === undefined
      ? {
          ...currentResult,
          explanation: `Ran recipe "${recipe.id}" with ${steps.length} registry step(s).`,
        }
      : currentResult;
  const writeResult = await writeSuccess(resultWithExplanation, outputContext);
  return writeResult.exitCode;
}

function resolveRecipe(
  id: string,
  config: TextaviaConfig | null,
): RecipeDefinition | undefined {
  const builtin = BUILTIN_RECIPES.find((recipe) => recipe.id === id);
  if (builtin !== undefined) {
    return builtin;
  }
  const configSteps = config?.recipes?.[id];
  if (configSteps === undefined) {
    return undefined;
  }
  return {
    id,
    name: id,
    description: 'Project config recipe.',
    steps: configSteps,
  };
}

function validateRecipeSteps(
  recipe: RecipeDefinition,
  params: RecipeRunParams,
): readonly {
  readonly tool: TextaviaToolDefinition;
  readonly options: Readonly<Record<string, unknown>> | undefined;
}[] {
  return recipe.steps.map((step) => {
    const [toolId, options] = step;
    const tool = params.registry.get(toolId);
    if (tool === undefined) {
      throw new UsageError(
        `Recipe "${recipe.id}" references unknown tool "${toolId}".`,
      );
    }
    assertRecipeToolAvailable(tool);
    assertCapabilityGates(tool, params.allowNetwork, params.allowUnsafe);
    return { tool, options };
  });
}

function assertRecipeToolAvailable(tool: TextaviaToolDefinition): void {
  if (tool.requiresOptionalPlugin !== undefined && tool.execute === undefined) {
    throw new PluginMissingError(
      `Recipe tool "${tool.id}" requires optional plugin "${tool.requiresOptionalPlugin}".`,
      {
        plugin: tool.requiresOptionalPlugin,
        install:
          tool.installHint ?? `npm install -g ${tool.requiresOptionalPlugin}`,
        hint: 'Install the plugin or choose a standard-tool recipe.',
      },
    );
  }
  if (tool.stability === 'future' || tool.stability === 'web-only') {
    throw new UsageError(`Recipe tool "${tool.id}" is not available.`);
  }
}

function parseStepOptions(
  tool: TextaviaToolDefinition,
  raw: Readonly<Record<string, unknown>>,
): unknown {
  const schema = tool.optionsSchema as z.ZodType<unknown>;
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new UsageError(
      `Invalid options for recipe step "${tool.id}": ${
        issue?.message ?? 'unknown validation error'
      }`,
    );
  }
  return result.data;
}

function resultToGeneratedInput(result: ToolExecutionResult): ResolvedInput {
  if (result.output instanceof Uint8Array) {
    return {
      source: 'generated',
      kind: 'bytes',
      encoding: 'utf8',
      bytes: result.output,
    };
  }
  return {
    source: 'generated',
    kind: result.outputKind === 'json' ? 'json' : 'text',
    encoding: 'utf8',
    text:
      typeof result.output === 'string'
        ? result.output
        : JSON.stringify(result.output, null, 2),
  };
}

function buildContext(
  params: RecipeRunParams,
  toolId: string,
): ToolExecutionContext {
  return {
    toolId,
    cwd: params.proc.cwd,
    mode: params.parsed.globals.json === true ? 'agent' : 'human',
    allowNetwork: params.allowNetwork,
    allowFilesystem: true,
    allowUnsafe: params.allowUnsafe,
    adapters: {
      fs: nodeFileAdapter,
      streams: nodeStreamAdapter,
      crypto: nodeCryptoAdapter,
    },
  };
}

function positionalInputFrom(
  parsed: ParsedArgs,
  startIndex: number,
): string | undefined {
  const values = parsed.positionals.slice(startIndex);
  return values.length === 0 ? undefined : values.join('\n');
}

function inferFileInputForWrite(
  globals: GlobalOptions,
  positional: string | undefined,
): { globals: GlobalOptions; positional: string | undefined } {
  if (
    globals.write === true &&
    globals.file === undefined &&
    globals.input === undefined &&
    positional !== undefined
  ) {
    return {
      globals: { ...globals, file: positional },
      positional: undefined,
    };
  }
  return { globals, positional };
}
