/**
 * @fileoverview Output writer.
 *
 * Converts a {@link ToolExecutionResult} into human text, structured JSON,
 * NDJSON, or file output. Errors are routed to stderr with stable exit codes.
 * Color, spinners, and prompts are disabled in agent and --no-color modes.
 */

import { writeFileSync } from 'node:fs';
import {
  EXIT_CODES,
  type ExecutionMode,
  type JsonErrorOutput,
  type JsonSuccessOutput,
  TextaviaError,
  type ToolExecutionResult,
  UsageError,
  type WrittenFile,
  toStructuredError,
} from '@textavia/core';
import { writeAtomic } from '@textavia/node-adapters';

/** Configuration for a single write operation. */
export interface OutputContext {
  readonly toolId: string;
  readonly mode: ExecutionMode;
  readonly json: boolean;
  readonly quiet: boolean;
  readonly out?: string;
  readonly outDir?: string;
  readonly write: boolean;
  readonly dryRun: boolean;
  readonly backup: boolean;
  readonly sourceFile?: string;
  readonly inputType: string;
  readonly startedAt: number;
  readonly streams: {
    stdout: NodeJS.WritableStream;
    stderr: NodeJS.WritableStream;
  };
}

/** Result of writing a successful execution. */
export interface WriteResult {
  readonly exitCode: number;
  readonly writtenFiles: readonly string[];
}

/** Additional per-item metadata for batch/NDJSON output. */
export interface JsonPayloadOptions {
  readonly durationMs: number;
  readonly writtenPaths?: readonly string[];
  readonly inputPath?: string;
}

function isBytes(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array;
}

function serializeForJson(output: unknown, outputKind: string): unknown {
  if (outputKind === 'bytes' && isBytes(output)) {
    return { encoding: 'base64', data: Buffer.from(output).toString('base64') };
  }
  return output;
}

function renderHuman(output: unknown, outputKind: string): string {
  if (outputKind === 'json') {
    return JSON.stringify(output, null, 2);
  }
  if (outputKind === 'bytes' && isBytes(output)) {
    return `<${output.byteLength} bytes>`;
  }
  if (typeof output === 'string') {
    return output;
  }
  return JSON.stringify(output, null, 2);
}

/** Writes a successful execution result and returns the success exit code. */
export async function writeSuccess(
  result: ToolExecutionResult,
  context: OutputContext,
): Promise<WriteResult> {
  const durationMs = Date.now() - context.startedAt;
  const writtenFiles = await writeOutputFiles(result, context);
  const writtenPaths = writtenFiles.map((file) => file.path);

  if (context.json) {
    const payload = buildJsonSuccessPayload(result, context, {
      durationMs,
      writtenPaths,
    });
    writeToStdout(context, `${JSON.stringify(payload, null, 2)}\n`);
    return { exitCode: EXIT_CODES.SUCCESS, writtenFiles: writtenPaths };
  }

  // Human mode.
  const wroteToFile = writtenPaths.length > 0;
  if (result.outputKind === 'bytes' && isBytes(result.output) && !wroteToFile) {
    context.streams.stdout.write(Buffer.from(result.output));
    return { exitCode: EXIT_CODES.SUCCESS, writtenFiles: writtenPaths };
  }

  if (!context.quiet) {
    const human = renderHuman(result.output, result.outputKind);
    if (!wroteToFile) {
      writeToStdout(context, human.endsWith('\n') ? human : `${human}\n`);
    } else {
      writeToStdout(context, `Wrote ${writtenPaths.join(', ')}\n`);
    }
  }

  if (
    result.warnings !== undefined &&
    result.warnings.length > 0 &&
    !context.quiet
  ) {
    for (const warning of result.warnings) {
      context.streams.stderr.write(`warning: ${warning}\n`);
    }
  }

  return { exitCode: EXIT_CODES.SUCCESS, writtenFiles: writtenPaths };
}

/** Builds the stable JSON success payload without writing it. */
export function buildJsonSuccessPayload(
  result: ToolExecutionResult,
  context: Pick<OutputContext, 'toolId' | 'inputType'>,
  options: JsonPayloadOptions,
): JsonSuccessOutput {
  return {
    ok: true,
    tool: context.toolId,
    inputType: context.inputType,
    outputType: result.outputKind,
    output: serializeForJson(result.output, result.outputKind),
    meta: {
      durationMs: options.durationMs,
      ...(result.warnings !== undefined ? { warnings: result.warnings } : {}),
      ...(result.explanation !== undefined
        ? { explanation: result.explanation }
        : {}),
      ...(options.writtenPaths !== undefined && options.writtenPaths.length > 0
        ? { writtenFiles: options.writtenPaths }
        : {}),
      ...(options.inputPath !== undefined
        ? { inputPath: options.inputPath }
        : {}),
    },
  };
}

/** Renders a result for human stdout without writing files. */
export function renderResultForHuman(result: ToolExecutionResult): string {
  return renderHuman(result.output, result.outputKind);
}

async function writeOutputFiles(
  result: ToolExecutionResult,
  context: OutputContext,
): Promise<WrittenFile[]> {
  const target = resolveOutputPath(context);
  if (target === null) {
    return [];
  }
  const data = outputToBytes(result);
  await writeAtomic(target, data, {
    backup: context.backup,
    dryRun: context.dryRun,
  });
  return [{ path: target, bytes: data.byteLength }];
}

function resolveOutputPath(context: OutputContext): string | null {
  if (context.out !== undefined) {
    return context.out;
  }
  if (context.outDir !== undefined) {
    const base =
      context.sourceFile !== undefined
        ? basename(context.sourceFile)
        : `${context.toolId}.txt`;
    return joinPath(context.outDir, base);
  }
  if (context.write) {
    if (context.sourceFile === undefined) {
      throw new UsageError('--write requires a source file (use --file).');
    }
    return context.sourceFile;
  }
  return null;
}

function outputToBytes(result: ToolExecutionResult): Uint8Array {
  if (result.outputKind === 'bytes' && isBytes(result.output)) {
    return result.output;
  }
  if (typeof result.output === 'string') {
    return Buffer.from(result.output, 'utf8');
  }
  return Buffer.from(JSON.stringify(result.output, null, 2), 'utf8');
}

/** Writes an error to stderr in the appropriate mode and returns the exit code. */
export function writeError(
  error: unknown,
  context: {
    mode: ExecutionMode;
    json: boolean;
    debug: boolean;
    stderr: NodeJS.WritableStream;
  },
): number {
  const structured = toStructuredError(error);
  if (context.json || context.mode === 'agent' || context.mode === 'mcp') {
    const payload: JsonErrorOutput = { ok: false, error: structured };
    context.stderr.write(`${JSON.stringify(payload, null, 2)}\n`);
  } else {
    context.stderr.write(`error: ${structured.message}\n`);
    if (structured.hint !== undefined) {
      context.stderr.write(`hint: ${structured.hint}\n`);
    }
    if (structured.install !== undefined) {
      context.stderr.write(`install: ${structured.install}\n`);
    }
  }
  if (context.debug && error instanceof Error) {
    context.stderr.write(`${error.stack ?? ''}\n`);
  }
  return error instanceof TextaviaError
    ? exitCodeFromCode(structured.code)
    : EXIT_CODES.TRANSFORM;
}

function exitCodeFromCode(code: string): number {
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

function writeToStdout(context: OutputContext, text: string): void {
  context.streams.stdout.write(text);
}

function basename(path: string): string {
  const idx = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return idx >= 0 ? path.slice(idx + 1) : path;
}

function joinPath(dir: string, file: string): string {
  return dir.endsWith('/') || dir.endsWith('\\')
    ? `${dir}${file}`
    : `${dir}/${file}`;
}

/** Re-exported for callers that write a single file synchronously (e.g. QR SVG). */
export function writeBinarySync(path: string, bytes: Uint8Array): void {
  writeFileSync(path, bytes);
}
