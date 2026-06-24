/**
 * @fileoverview Shared error classes, codes, and exit code mapping.
 *
 * Every failure mode crosses a module boundary as one of these typed errors so
 * the CLI output writer can render consistent human and JSON error shapes.
 */

/** Stable machine-readable error codes (public API). */
export type TextaviaErrorCode =
  | 'INVALID_USAGE'
  | 'VALIDATION_ERROR'
  | 'FILE_IO_ERROR'
  | 'PARSE_ERROR'
  | 'TRANSFORM_ERROR'
  | 'NETWORK_REQUIRED'
  | 'UNSAFE_BLOCKED'
  | 'PLUGIN_MISSING'
  | 'INTERRUPTED';

/** Required exit code map (R6). */
export const EXIT_CODES = {
  SUCCESS: 0,
  USAGE_OR_VALIDATION: 1,
  FILE_IO: 2,
  PARSE: 3,
  TRANSFORM: 4,
  NETWORK_REQUIRED: 5,
  UNSAFE_BLOCKED: 6,
  PLUGIN_MISSING: 7,
  INTERRUPTED: 130,
} as const;

/** Structured error detail surfaced in JSON and agent output. */
export interface StructuredErrorDetail {
  readonly code: TextaviaErrorCode;
  readonly message: string;
  readonly hint?: string;
  readonly plugin?: string;
  readonly install?: string;
  readonly details?: unknown;
}

/** Base class for all Textavia failures. */
export class TextaviaError extends Error {
  readonly code: TextaviaErrorCode;
  readonly hint?: string;
  readonly details?: unknown;

  constructor(
    code: TextaviaErrorCode,
    message: string,
    options?: { hint?: string; details?: unknown; cause?: unknown },
  ) {
    super(
      message,
      options?.cause !== undefined ? { cause: options.cause } : undefined,
    );
    this.name = new.target.name;
    this.code = code;
    if (options?.hint !== undefined) {
      this.hint = options.hint;
    }
    if (options?.details !== undefined) {
      this.details = options.details;
    }
  }
}

/** Missing or malformed command usage (exit 1). */
export class UsageError extends TextaviaError {
  constructor(message: string, options?: { hint?: string; cause?: unknown }) {
    super('INVALID_USAGE', message, options);
  }
}

/** Option value failed schema validation (exit 1). */
export class ValidationError extends TextaviaError {
  constructor(
    message: string,
    options?: { hint?: string; details?: unknown; cause?: unknown },
  ) {
    super('VALIDATION_ERROR', message, options);
  }
}

/** File read/write failure or missing file (exit 2). */
export class FileIoError extends TextaviaError {
  constructor(message: string, options?: { hint?: string; cause?: unknown }) {
    super('FILE_IO_ERROR', message, options);
  }
}

/** Unparseable input such as invalid JSON (exit 3). */
export class ParseError extends TextaviaError {
  constructor(
    message: string,
    options?: { hint?: string; details?: unknown; cause?: unknown },
  ) {
    super('PARSE_ERROR', message, options);
  }
}

/** A transform failed at runtime, e.g. regex timeout (exit 4). */
export class TransformError extends TextaviaError {
  constructor(message: string, options?: { hint?: string; cause?: unknown }) {
    super('TRANSFORM_ERROR', message, options);
  }
}

/** A network tool was invoked without --allow-network (exit 5). */
export class NetworkRequiredError extends TextaviaError {
  constructor(message: string, options?: { hint?: string }) {
    super('NETWORK_REQUIRED', message, options);
  }
}

/** A risky operation was invoked without --unsafe (exit 6). */
export class UnsafeBlockedError extends TextaviaError {
  constructor(message: string, options?: { hint?: string }) {
    super('UNSAFE_BLOCKED', message, options);
  }
}

/** An optional plugin command was requested but is not installed (exit 7). */
export class PluginMissingError extends TextaviaError {
  readonly plugin?: string;
  readonly install?: string;

  constructor(
    message: string,
    options: { plugin?: string; install?: string; hint?: string },
  ) {
    super('PLUGIN_MISSING', message, { hint: options.hint });
    if (options.plugin !== undefined) {
      this.plugin = options.plugin;
    }
    if (options.install !== undefined) {
      this.install = options.install;
    }
  }
}

/** Execution was interrupted, typically by SIGINT (exit 130). */
export class InterruptedError extends TextaviaError {
  constructor(message = 'Execution interrupted.') {
    super('INTERRUPTED', message);
  }
}

/** Maps a Textavia error code to its process exit code. */
export function exitCodeForError(error: TextaviaError): number {
  switch (error.code) {
    case 'INVALID_USAGE':
    case 'VALIDATION_ERROR':
      return EXIT_CODES.USAGE_OR_VALIDATION;
    case 'FILE_IO_ERROR':
      return EXIT_CODES.FILE_IO;
    case 'PARSE_ERROR':
      return EXIT_CODES.PARSE;
    case 'TRANSFORM_ERROR':
      return EXIT_CODES.TRANSFORM;
    case 'NETWORK_REQUIRED':
      return EXIT_CODES.NETWORK_REQUIRED;
    case 'UNSAFE_BLOCKED':
      return EXIT_CODES.UNSAFE_BLOCKED;
    case 'PLUGIN_MISSING':
      return EXIT_CODES.PLUGIN_MISSING;
    case 'INTERRUPTED':
      return EXIT_CODES.INTERRUPTED;
    default: {
      // Exhaustiveness guard: a new code requires an explicit exit mapping.
      const exhaustive: never = error.code;
      throw new Error(`Unhandled error code: ${String(exhaustive)}`);
    }
  }
}

/**
 * Converts an arbitrary thrown value into a serializable structured detail.
 * Unknown non-Textavia errors become TRANSFORM_ERROR so callers always get a
 * stable shape rather than leaking raw values into JSON output.
 */
export function toStructuredError(thrown: unknown): StructuredErrorDetail {
  if (thrown instanceof TextaviaError) {
    const detail: StructuredErrorDetail = {
      code: thrown.code,
      message: thrown.message,
      ...(thrown.hint !== undefined ? { hint: thrown.hint } : {}),
      ...(thrown.details !== undefined ? { details: thrown.details } : {}),
    };
    if (
      thrown instanceof PluginMissingError &&
      thrown.plugin !== undefined &&
      thrown.install !== undefined
    ) {
      return {
        ...detail,
        plugin: thrown.plugin,
        install: thrown.install,
      };
    }
    return detail;
  }
  const message = thrown instanceof Error ? thrown.message : String(thrown);
  return { code: 'TRANSFORM_ERROR', message };
}

/** True when a thrown value is one of our typed errors. */
export function isTextaviaError(value: unknown): value is TextaviaError {
  return value instanceof TextaviaError;
}
