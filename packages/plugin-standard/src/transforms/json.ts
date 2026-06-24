/**
 * @fileoverview JSON format, minify, and validate transforms.
 *
 * Parsing surfaces precise parse diagnostics (line and column) so the CLI can
 * report exit code 3 with an actionable error.
 */

import { ParseError } from '@textavia/core';

export interface ParseDiagnostic {
  readonly message: string;
  readonly position?: number;
  readonly line?: number;
  readonly column?: number;
}

/**
 * Parses JSON with a diagnostic error on failure. Throws {@link ParseError}
 * (exit code 3) so callers map it consistently.
 */
export function parseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const diagnostic = positionDiagnostic(input, message);
    throw new ParseError(`Invalid JSON: ${diagnostic.message}`, {
      hint: 'Validate the structure and quoting before retrying.',
      details: {
        position: diagnostic.position,
        line: diagnostic.line,
        column: diagnostic.column,
      },
      cause: error,
    });
  }
}

function positionDiagnostic(input: string, message: string): ParseDiagnostic {
  const match = /position (\d+)/.exec(message);
  if (match === null) {
    return { message };
  }
  const position = Number(match[1]);
  if (!Number.isFinite(position)) {
    return { message };
  }
  const upTo = input.slice(0, position);
  const line = upTo.split('\n').length;
  const lastNewline = upTo.lastIndexOf('\n');
  const column = position - lastNewline;
  return { message, position, line, column };
}

/** Formats JSON with the given indentation (default 2 spaces). */
export function formatJson(input: string, indent = 2): string {
  const parsed = parseJson(input);
  return JSON.stringify(parsed, null, indent);
}

/** Minifies JSON by parsing and re-stringifying with no indentation. */
export function minifyJson(input: string): string {
  const parsed = parseJson(input);
  return JSON.stringify(parsed);
}

/** Validates JSON, returning a diagnostic instead of throwing. */
export function validateJson(
  input: string,
): { valid: true } | { valid: false; diagnostic: ParseDiagnostic } {
  try {
    parseJson(input);
    return { valid: true };
  } catch (error) {
    if (error instanceof ParseError) {
      return {
        valid: false,
        diagnostic: {
          message: error.message,
          ...(error.details as {
            position?: number;
            line?: number;
            column?: number;
          }),
        },
      };
    }
    return { valid: false, diagnostic: { message: String(error) } };
  }
}
