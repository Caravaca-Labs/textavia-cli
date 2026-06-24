/**
 * @fileoverview Input resolver.
 *
 * Resolves input by priority: --input, --file, positional, stdin, interactive
 * prompt (human mode only). Agent and JSON modes never prompt. Byte-capable
 * tools receive bytes and a streaming byte source so large files stay bounded.
 */

import {
  type ExecutionMode,
  type ResolvedInput,
  type TextEncoding,
  type TextaviaToolDefinition,
  UsageError,
} from '@textavia/core';
import {
  bytesFromFile,
  readBytesFile,
  readTextFile,
} from '@textavia/node-adapters';

/** Request payload for the input resolver. */
export interface InputRequest {
  readonly globals: {
    readonly input?: string;
    readonly file?: string;
    readonly files?: string;
    readonly stdin?: boolean;
    readonly encoding?: string;
  };
  readonly positional?: string;
  readonly mode: ExecutionMode;
  readonly stdin: StdinSource;
  /** Max input bytes for agent/mcp contexts; undefined disables the limit. */
  readonly maxInputBytes?: number;
}

/** Injectable prompt function for interactive human mode. */
export type PromptFn = (question: string) => Promise<string>;

/** Descriptor for the process stdin used by the resolver. */
export interface StdinSource {
  readonly stream: NodeJS.ReadableStream;
  readonly isTty: boolean;
}

/** True when the tool should receive bytes rather than decoded text. */
function prefersBytes(tool: TextaviaToolDefinition): boolean {
  return (
    tool.inputKind.includes('bytes') &&
    !tool.inputKind.includes('text') &&
    !tool.inputKind.includes('json')
  );
}

function prefersFileBytes(tool: TextaviaToolDefinition): boolean {
  return tool.inputKind.includes('bytes');
}

function resolveEncoding(encoding: string | undefined): TextEncoding {
  const value = encoding ?? 'utf8';
  // Narrow to a supported encoding; default to utf8 for anything unexpected.
  const allowed: readonly string[] = [
    'utf8',
    'utf-8',
    'ascii',
    'latin1',
    'binary',
    'ucs2',
    'ucs-2',
    'utf16le',
  ];
  return (allowed.includes(value) ? value : 'utf8') as TextEncoding;
}

function assertSize(byteLength: number, limit?: number): void {
  if (limit !== undefined && byteLength > limit) {
    throw new UsageError(
      `Input exceeds the maximum of ${limit} bytes for this context.`,
    );
  }
}

/**
 * Resolves a {@link ResolvedInput} according to the priority rules. Throws
 * {@link UsageError} when no input is available and prompting is disabled.
 */
export async function resolveInput(
  request: InputRequest,
  tool: TextaviaToolDefinition,
  prompt?: PromptFn,
): Promise<ResolvedInput> {
  const encoding = resolveEncoding(request.globals.encoding);

  if (request.globals.input !== undefined) {
    return {
      source: 'input',
      kind: 'text',
      encoding,
      text: request.globals.input,
    };
  }

  if (request.globals.file !== undefined) {
    return resolveFile(
      request.globals.file,
      tool,
      encoding,
      request.maxInputBytes,
    );
  }

  if (request.positional !== undefined) {
    return {
      source: 'positional',
      kind: 'text',
      encoding,
      text: request.positional,
    };
  }

  if (tool.inputKind.includes('generated')) {
    return { source: 'generated', kind: 'generated', encoding };
  }

  if (request.globals.stdin || !request.stdin.isTty) {
    if (prefersBytes(tool)) {
      const bytes = await readStreamBytes(request.stdin.stream);
      assertSize(bytes.byteLength, request.maxInputBytes);
      return { source: 'stdin', kind: 'bytes', encoding, bytes };
    }
    const text = await readStreamText(
      request.stdin.stream,
      encoding as BufferEncoding,
    );
    assertSize(
      Buffer.byteLength(text, encoding as BufferEncoding),
      request.maxInputBytes,
    );
    return { source: 'stdin', kind: 'text', encoding, text };
  }

  const interactive = request.mode === 'human' && request.stdin.isTty;
  if (interactive && prompt !== undefined) {
    const text = await prompt('Enter text: ');
    return { source: 'prompt', kind: 'text', encoding, text };
  }

  throw new UsageError('No input provided.', {
    hint: 'Pass text as an argument, pipe stdin, or use --file/--input.',
  });
}

async function resolveFile(
  path: string,
  tool: TextaviaToolDefinition,
  encoding: TextEncoding,
  maxInputBytes?: number,
): Promise<ResolvedInput> {
  if (prefersFileBytes(tool)) {
    const bytes = await readBytesFile(path);
    assertSize(bytes.byteLength, maxInputBytes);
    return {
      source: 'file',
      kind: 'bytes',
      encoding,
      bytes,
      byteStream: bytesFromFile(path),
      fileName: path,
    };
  }
  const text = await readTextFile(path, encoding);
  assertSize(
    Buffer.byteLength(text, encoding as BufferEncoding),
    maxInputBytes,
  );
  return { source: 'file', kind: 'text', encoding, text, fileName: path };
}

/** Reads all data from a readable stream as decoded text. */
function readStreamText(
  stream: NodeJS.ReadableStream,
  encoding: BufferEncoding,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString(encoding));
    });
    stream.on('error', (error: unknown) => {
      reject(error);
    });
  });
}

/** Reads all data from a readable stream as raw bytes. */
function readStreamBytes(stream: NodeJS.ReadableStream): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    stream.on('error', (error: unknown) => {
      reject(error);
    });
  });
}
