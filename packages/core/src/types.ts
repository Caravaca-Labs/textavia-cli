/**
 * @fileoverview Core tool type contracts for Textavia.
 *
 * This module is intentionally pure: it must not import Node built-ins
 * (fs, process, stream, crypto) or any CLI framework. Node-specific runtime
 * behavior is expressed through adapter interfaces that the
 * @textavia/node-adapters package implements.
 */

import type { ZodType } from 'zod';

/** Input shapes a tool can accept. */
export type ToolInputKind =
  | 'text'
  | 'bytes'
  | 'file'
  | 'files'
  | 'json'
  | 'csv'
  | 'table'
  | 'image'
  | 'pdf'
  | 'generated';

/** Output shapes a tool can produce. */
export type ToolOutputKind =
  | 'text'
  | 'bytes'
  | 'json'
  | 'csv'
  | 'markdown'
  | 'html'
  | 'image'
  | 'pdf'
  | 'file'
  | 'summary';

/** Top-level grouping for discovery and manifest generation. */
export type ToolCategory =
  | 'text'
  | 'case'
  | 'lines'
  | 'encoding'
  | 'data'
  | 'dev'
  | 'format'
  | 'random'
  | 'media'
  | 'style'
  | 'unicode'
  | 'recipe'
  | 'agent';

/**
 * Stability labels govern how consumers may rely on a tool.
 *
 * - stable: public API; canonical id will not be renamed casually.
 * - experimental: may change between minor releases; clearly marked in docs.
 * - future: declared in the registry but no executor yet.
 * - web-only: exists on the website but intentionally not in the CLI.
 * - deprecated: still discoverable with migration guidance until removed.
 */
export type ToolStability =
  | 'stable'
  | 'experimental'
  | 'future'
  | 'web-only'
  | 'deprecated';

/** Where a resolved input value originated. */
export type InputSource =
  | 'input'
  | 'file'
  | 'files'
  | 'positional'
  | 'stdin'
  | 'generated'
  | 'prompt';

/**
 * Text encodings supported at runtime. Mirrors the subset of Node
 * BufferEncoding values that are safe for text tools. Defined here so core
 * does not import Node types.
 */
export type TextEncoding =
  | 'utf8'
  | 'utf-8'
  | 'ascii'
  | 'latin1'
  | 'binary'
  | 'ucs2'
  | 'ucs-2'
  | 'utf16le';

/** A worked example shown in generated docs and discovery output. */
export interface ToolExample {
  readonly title: string;
  readonly command: string;
  readonly input?: string;
  readonly output?: string;
  readonly notes?: string;
}

/** A file resolved by the input resolver for a batch-capable tool. */
export interface ResolvedFileInput {
  readonly path: string;
  readonly text?: string;
  readonly bytes?: Uint8Array;
  readonly encoding: TextEncoding;
}

/**
 * Normalized input handed to a tool executor.
 *
 * A resolver fills exactly one payload carrier for a given source. Tools must
 * read the carrier they expect and fail loudly (via {@link requireText} or
 * similar) if it is absent rather than coercing undefined to empty data.
 */
export interface ResolvedInput {
  readonly source: InputSource;
  readonly kind: ToolInputKind;
  readonly encoding: TextEncoding;
  /** Decoded text payload, present for text/file/positional/stdin text sources. */
  readonly text?: string;
  /** Raw byte payload, present for byte-oriented sources. */
  readonly bytes?: Uint8Array;
  /** Streamed text chunks for streaming-capable consumers. */
  readonly textStream?: AsyncIterable<string>;
  /** Streamed byte chunks for byte consumers (hashing, base64 of files). */
  readonly byteStream?: AsyncIterable<Uint8Array>;
  /** Resolved file inputs for batch tools. */
  readonly files?: readonly ResolvedFileInput[];
  /** Original file name when a single file was resolved. */
  readonly fileName?: string;
}

/** Minimal async text stream contract that Node Readable streams satisfy. */
export interface TextStreamLike extends AsyncIterable<string> {
  readonly readable?: boolean;
}

/** Minimal async byte stream contract that Node Readable streams satisfy. */
export interface ByteStreamLike extends AsyncIterable<Uint8Array> {
  readonly readable?: boolean;
}

/**
 * Filesystem adapter surface exposed to executors. Implemented by
 * @textavia/node-adapters; absent in non-Node runtimes.
 */
export interface FileAdapter {
  readText(path: string, encoding: TextEncoding): Promise<string>;
  readBytes(path: string): Promise<Uint8Array>;
  writeAtomic(path: string, data: string | Uint8Array): Promise<string>;
  backup(path: string): Promise<string>;
  exists(path: string): Promise<boolean>;
}

/** Stream adapter surface for line and byte streaming transforms. */
export interface StreamAdapter {
  lines(path: string): AsyncIterable<string>;
  bytes(path: string): AsyncIterable<Uint8Array>;
}

/** Crypto adapter surface for secure randomness. */
export interface CryptoAdapter {
  randomBytes(length: number): Uint8Array;
}

/** Bundled adapter handles exposed through the execution context. */
export interface ToolAdapters {
  readonly fs?: FileAdapter;
  readonly streams?: StreamAdapter;
  readonly crypto?: CryptoAdapter;
}

/** The runtime mode shapes output and interaction rules. */
export type ExecutionMode = 'human' | 'script' | 'agent' | 'mcp';

/** Runtime context provided to every tool execution. */
export interface ToolExecutionContext {
  readonly toolId: string;
  readonly cwd: string;
  readonly mode: ExecutionMode;
  readonly allowNetwork: boolean;
  readonly allowFilesystem: boolean;
  readonly allowUnsafe: boolean;
  readonly signal?: AbortSignal;
  readonly adapters?: ToolAdapters;
  /** Maximum input bytes permitted; undefined means no limit. */
  readonly maxInputBytes?: number;
}

/** A file written by a tool, reported in structured output. */
export interface WrittenFile {
  readonly path: string;
  readonly bytes: number;
}

/** Value returned by a tool executor. */
export interface ToolExecutionResult<T = unknown> {
  readonly output: T;
  readonly outputKind: ToolOutputKind;
  readonly warnings?: readonly string[];
  readonly explanation?: string;
  readonly files?: readonly WrittenFile[];
  readonly meta?: Readonly<Record<string, unknown>>;
}

/**
 * Executor for a single tool. Implementations live in plugins or the CLI; core
 * only defines the contract.
 */
export type ToolExecutor<TOptions> = (
  input: ResolvedInput,
  options: TOptions,
  context: ToolExecutionContext,
) => Promise<ToolExecutionResult> | ToolExecutionResult;

/** Full metadata describing a registry tool. */
export interface TextaviaToolDefinition<TOptions = unknown> {
  readonly id: string;
  readonly name: string;
  readonly aliases: readonly string[];
  readonly category: ToolCategory;
  readonly summary: string;
  readonly description: string;
  readonly inputKind: readonly ToolInputKind[];
  readonly outputKind: readonly ToolOutputKind[];
  readonly webUrl?: string;
  readonly docsUrl?: string;
  readonly optionsSchema: ZodType<TOptions>;
  readonly examples: readonly ToolExample[];
  readonly stability: ToolStability;
  readonly requiresNetwork?: boolean;
  readonly requiresFilesystem?: boolean;
  readonly requiresOptionalPlugin?: string;
  /** Human-oriented install hint used when the plugin is missing. */
  readonly installHint?: string;
  readonly execute?: ToolExecutor<TOptions>;
  /** True when the transform is safe to stream (avoids loading full input). */
  readonly streaming?: boolean;
  /** True when the transform needs the entire input before producing output. */
  readonly fullFile?: boolean;
}

/** Returns the text payload or throws when a tool requires text but has none. */
export function requireText(input: ResolvedInput): string {
  if (input.text === undefined) {
    throw new Error(
      `Tool expected text input but source "${input.source}" provided none.`,
    );
  }
  return input.text;
}

/** Returns the byte payload or throws when a tool requires bytes but has none. */
export function requireBytes(input: ResolvedInput): Uint8Array {
  if (input.bytes === undefined) {
    throw new Error(
      `Tool expected byte input but source "${input.source}" provided none.`,
    );
  }
  return input.bytes;
}
