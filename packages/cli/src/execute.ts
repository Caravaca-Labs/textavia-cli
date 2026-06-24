/**
 * @fileoverview Tool invocation orchestration.
 *
 * Given a resolved tool and parsed args, this validates availability and
 * capability gates, resolves input, parses options against the tool schema,
 * executes, and writes output. All Textavia errors map to stable exit codes.
 */

import type { Dirent, Stats } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  EXIT_CODES,
  FileIoError,
  NetworkRequiredError,
  PluginMissingError,
  type ResolvedInput,
  type TextaviaToolDefinition,
  type ToolExecutionContext,
  type ToolExecutionResult,
  type ToolRegistry,
  UsageError,
  ValidationError,
  toStructuredError,
} from '@textavia/core';
import {
  nodeCryptoAdapter,
  nodeFileAdapter,
  nodeStreamAdapter,
} from '@textavia/node-adapters';
import type { z } from 'zod';
import type { GlobalOptions, ParsedArgs } from './argv.js';
import { type PromptFn, resolveInput } from './input.js';
import {
  type OutputContext,
  buildJsonSuccessPayload,
  writeError,
  writeSuccess,
} from './output.js';

/** Injectable process surface so the CLI is testable without globals. */
export interface ProcessSurface {
  readonly cwd: string;
  readonly stdin: NodeJS.ReadableStream;
  readonly stdout: NodeJS.WritableStream;
  readonly stderr: NodeJS.WritableStream;
}

/** Parameters for a single tool invocation. */
export interface InvocationParams {
  readonly registry: ToolRegistry;
  readonly tool: TextaviaToolDefinition;
  readonly parsed: ParsedArgs;
  readonly positionalInput?: string;
  readonly mode: ToolExecutionContext['mode'];
  readonly proc: ProcessSurface;
  readonly prompt?: PromptFn;
  readonly startedAt: number;
  readonly allowNetwork: boolean;
  readonly allowUnsafe: boolean;
  readonly configDefaults?: Readonly<Record<string, unknown>>;
}

/** Runs a single tool invocation end to end and returns the process exit code. */
export async function executeTool(params: InvocationParams): Promise<number> {
  const { tool, parsed, proc } = params;

  assertAvailable(tool);
  assertCapabilityGates(tool, params.allowNetwork, params.allowUnsafe);

  if (parsed.globals.files !== undefined) {
    return executeBatch(params);
  }

  const context = buildExecutionContext(params);
  const inputRequest = inferFileInputForWrite(
    parsed.globals,
    params.positionalInput,
  );

  const resolved = await resolveInput(
    {
      globals: inputRequest.globals,
      positional: inputRequest.positional,
      mode: params.mode,
      stdin: {
        stream: proc.stdin,
        isTty: Boolean(
          (proc.stdin as NodeJS.ReadableStream & { isTTY?: boolean }).isTTY,
        ),
      },
    },
    tool,
    params.prompt,
  );

  const options = await parseOptions(
    tool,
    parsed.toolOptions,
    params.configDefaults,
  );

  try {
    const executor = tool.execute;
    if (executor === undefined) {
      throw new UsageError(`Tool "${tool.id}" has no executor.`);
    }
    const result = addExplanationIfRequested(
      await executor(resolved, options, context),
      tool,
      parsed.globals.explain === true,
    );
    const outputContext: OutputContext = {
      toolId: tool.id,
      mode: params.mode,
      json: parsed.globals.json === true,
      quiet: parsed.globals.quiet === true,
      out: parsed.globals.out,
      outDir: parsed.globals.outDir,
      write: parsed.globals.write === true,
      dryRun: parsed.globals.dryRun === true,
      backup: parsed.globals.backup === true,
      sourceFile: resolved.fileName,
      inputType: inputTypeName(resolved),
      startedAt: params.startedAt,
      streams: { stdout: proc.stdout, stderr: proc.stderr },
    };
    const writeResult = await writeSuccess(result, outputContext);
    return writeResult.exitCode;
  } catch (error) {
    return writeError(error, {
      mode: params.mode,
      json: parsed.globals.json === true,
      debug: parsed.globals.debug === true,
      stderr: proc.stderr,
    });
  }
}

async function executeBatch(params: InvocationParams): Promise<number> {
  const { tool, parsed, proc } = params;
  if (parsed.globals.out !== undefined) {
    throw new UsageError('--out cannot be used with --files; use --out-dir.');
  }

  const files = await expandFiles(parsed.globals.files ?? '', proc.cwd);
  if (files.length === 0) {
    throw new UsageError(`No files matched pattern: ${parsed.globals.files}`);
  }

  const options = await parseOptions(
    tool,
    parsed.toolOptions,
    params.configDefaults,
  );
  const ndjson = parsed.globals.ndjson === true;
  const json = parsed.globals.json === true;
  const jsonResults: unknown[] = [];
  let finalCode: number = EXIT_CODES.SUCCESS;

  for (const file of files) {
    const startedAt = Date.now();
    const itemParsed: ParsedArgs = {
      ...parsed,
      globals: {
        ...parsed.globals,
        input: undefined,
        files: undefined,
        file,
        stdin: undefined,
      },
    };
    try {
      const resolved = await resolveInput(
        {
          globals: itemParsed.globals,
          positional: undefined,
          mode: params.mode,
          stdin: { stream: proc.stdin, isTty: true },
        },
        tool,
        params.prompt,
      );
      const context = buildExecutionContext(params);
      const executor = tool.execute;
      if (executor === undefined) {
        throw new UsageError(`Tool "${tool.id}" has no executor.`);
      }
      const result = addExplanationIfRequested(
        await executor(resolved, options, context),
        tool,
        parsed.globals.explain === true,
      );
      const outputContext: OutputContext = {
        toolId: tool.id,
        mode: params.mode,
        json,
        quiet: parsed.globals.quiet === true,
        out: undefined,
        outDir: parsed.globals.outDir,
        write: parsed.globals.write === true,
        dryRun: parsed.globals.dryRun === true,
        backup: parsed.globals.backup === true,
        sourceFile: resolved.fileName,
        inputType: inputTypeName(resolved),
        startedAt,
        streams: { stdout: proc.stdout, stderr: proc.stderr },
      };

      if (ndjson) {
        const payload = buildJsonSuccessPayload(result, outputContext, {
          durationMs: Date.now() - startedAt,
          inputPath: file,
        });
        proc.stdout.write(`${JSON.stringify(payload)}\n`);
      } else if (json) {
        jsonResults.push(
          buildJsonSuccessPayload(result, outputContext, {
            durationMs: Date.now() - startedAt,
            inputPath: file,
          }),
        );
      } else {
        const writeResult = await writeSuccess(result, outputContext);
        if (writeResult.writtenFiles.length === 0 && !outputContext.quiet) {
          // writeSuccess already wrote human output. This branch is retained so
          // batch control flow stays explicit when file outputs are added.
        }
      }
    } catch (error) {
      const structured = toStructuredError(error);
      const code = exitCodeFromStructuredCode(structured.code);
      if (finalCode === EXIT_CODES.SUCCESS) {
        finalCode = code;
      }
      if (ndjson) {
        proc.stdout.write(
          `${JSON.stringify({ ok: false, inputPath: file, error: structured })}\n`,
        );
        continue;
      }
      if (json) {
        jsonResults.push({ ok: false, inputPath: file, error: structured });
        continue;
      }
      return writeError(error, {
        mode: params.mode,
        json: false,
        debug: parsed.globals.debug === true,
        stderr: proc.stderr,
      });
    }
  }

  if (json && !ndjson) {
    proc.stdout.write(
      `${JSON.stringify({ ok: finalCode === 0, results: jsonResults }, null, 2)}\n`,
    );
  }
  return finalCode;
}

async function expandFiles(pattern: string, cwd: string): Promise<string[]> {
  if (pattern.trim() === '') {
    throw new UsageError('--files requires a glob or path.');
  }

  if (!hasGlobSyntax(pattern)) {
    const target = resolve(cwd, pattern);
    let info: Stats;
    try {
      info = await stat(target);
    } catch (error) {
      throw new FileIoError(`Cannot read --files path: ${pattern}`, {
        cause: error,
      });
    }
    if (info.isFile()) {
      return [target];
    }
    if (!info.isDirectory()) {
      throw new FileIoError(
        `--files path is not a file or directory: ${pattern}`,
      );
    }
    const files: string[] = [];
    await collectFiles(target, files);
    return files.sort();
  }

  const absolutePattern = normalizePath(resolve(cwd, pattern));
  const matcher = globToRegExp(absolutePattern);
  const root = globSearchRoot(pattern, cwd);
  const files: string[] = [];
  await collectMatchingFiles(root, matcher, files);
  return files.sort();
}

async function collectFiles(dir: string, files: string[]): Promise<void> {
  let entries: Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    throw new FileIoError(`Cannot read directory: ${dir}`, { cause: error });
  }

  for (const entry of entries) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(path, files);
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
}

async function collectMatchingFiles(
  dir: string,
  matcher: RegExp,
  files: string[],
): Promise<void> {
  let entries: Dirent[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    throw new FileIoError(`Cannot read directory for --files: ${dir}`, {
      cause: error,
    });
  }

  for (const entry of entries) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      await collectMatchingFiles(path, matcher, files);
    } else if (entry.isFile() && matcher.test(normalizePath(path))) {
      files.push(path);
    }
  }
}

function globSearchRoot(pattern: string, cwd: string): string {
  const normalized = normalizePath(pattern);
  const globIndex = normalized.search(/[*?[\]]/);
  if (globIndex < 0) {
    return resolve(cwd, pattern);
  }
  const slashIndex = normalized.lastIndexOf('/', globIndex);
  if (slashIndex < 0) {
    return cwd;
  }
  const staticPrefix = normalized.slice(0, slashIndex);
  return resolve(cwd, staticPrefix === '' ? '/' : staticPrefix);
}

function globToRegExp(pattern: string): RegExp {
  let source = '^';
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (char === undefined) {
      continue;
    }
    if (char === '*') {
      const next = pattern[index + 1];
      const afterNext = pattern[index + 2];
      if (next === '*') {
        if (afterNext === '/') {
          source += '(?:.*/)?';
          index += 2;
        } else {
          source += '.*';
          index += 1;
        }
      } else {
        source += '[^/]*';
      }
      continue;
    }
    if (char === '?') {
      source += '[^/]';
      continue;
    }
    if (char === '[') {
      const closing = pattern.indexOf(']', index + 1);
      if (closing > index + 1) {
        const classBody = pattern
          .slice(index + 1, closing)
          .replaceAll('\\', '\\\\');
        const normalizedClassBody = classBody.startsWith('!')
          ? `^${classBody.slice(1)}`
          : classBody;
        source += `[${normalizedClassBody}]`;
        index = closing;
        continue;
      }
    }
    source += escapeRegExp(char);
  }
  source += '$';
  return new RegExp(source);
}

function hasGlobSyntax(value: string): boolean {
  return /[*?[\]]/.test(value);
}

function normalizePath(path: string): string {
  return path.replaceAll('\\', '/');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function exitCodeFromStructuredCode(code: string): number {
  const map: Record<string, number> = {
    INVALID_USAGE: EXIT_CODES.USAGE_OR_VALIDATION,
    VALIDATION_ERROR: EXIT_CODES.USAGE_OR_VALIDATION,
    FILE_IO_ERROR: EXIT_CODES.FILE_IO,
    PARSE_ERROR: EXIT_CODES.PARSE,
    TRANSFORM_ERROR: EXIT_CODES.TRANSFORM,
    NETWORK_REQUIRED: EXIT_CODES.NETWORK_REQUIRED,
    UNSAFE_BLOCKED: EXIT_CODES.UNSAFE_BLOCKED,
    PLUGIN_MISSING: EXIT_CODES.PLUGIN_MISSING,
    INTERRUPTED: EXIT_CODES.INTERRUPTED,
  };
  return map[code] ?? EXIT_CODES.USAGE_OR_VALIDATION;
}

function addExplanationIfRequested(
  result: ToolExecutionResult,
  tool: TextaviaToolDefinition,
  explain: boolean,
): ToolExecutionResult {
  if (!explain || result.explanation !== undefined) {
    return result;
  }
  return {
    ...result,
    explanation: tool.summary,
  };
}

function buildExecutionContext(params: InvocationParams): ToolExecutionContext {
  return {
    toolId: params.tool.id,
    cwd: params.proc.cwd,
    mode: params.mode,
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

function assertAvailable(tool: TextaviaToolDefinition): void {
  if (tool.requiresOptionalPlugin !== undefined && tool.execute === undefined) {
    throw new PluginMissingError(
      `Tool "${tool.id}" requires the optional plugin "${tool.requiresOptionalPlugin}".`,
      {
        plugin: tool.requiresOptionalPlugin,
        install:
          tool.installHint ?? `npm install -g ${tool.requiresOptionalPlugin}`,
        hint: 'Install the plugin to enable this tool.',
      },
    );
  }
  if (tool.stability === 'future') {
    throw new UsageError(
      `Tool "${tool.id}" is planned but not yet implemented.`,
    );
  }
  if (tool.stability === 'web-only') {
    throw new UsageError(
      `Tool "${tool.id}" is only available on the website, not in the CLI.`,
    );
  }
}

export function assertCapabilityGates(
  tool: TextaviaToolDefinition,
  allowNetwork: boolean,
  _allowUnsafe: boolean,
): void {
  if (tool.requiresNetwork && !allowNetwork) {
    throw new NetworkRequiredError(
      `Tool "${tool.id}" requires network access.`,
      { hint: 'Re-run with --allow-network to permit network tools.' },
    );
  }
}

async function parseOptions(
  tool: TextaviaToolDefinition,
  raw: Readonly<Record<string, string | boolean>>,
  configDefaults?: Readonly<Record<string, unknown>>,
): Promise<unknown> {
  const merged = { ...(configDefaults ?? {}), ...coerceValues(raw) };
  const schema = tool.optionsSchema as z.ZodType<unknown>;
  const result = schema.safeParse(merged);
  if (!result.success) {
    const first = result.error.issues[0];
    const message =
      first === undefined
        ? 'Invalid options.'
        : `${first.path.join('.')}: ${first.message}`;
    throw new ValidationError(`Invalid options for "${tool.id}": ${message}`, {
      details: result.error.issues,
    });
  }
  return result.data;
}

function coerceValues(
  raw: Readonly<Record<string, string | boolean>>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    out[key] = value;
  }
  return out;
}

function inputTypeName(resolved: ResolvedInput): string {
  return resolved.kind;
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
