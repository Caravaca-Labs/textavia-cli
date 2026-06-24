/**
 * @fileoverview Helpers shared by standard tool definitions.
 */

import type {
  ResolvedInput,
  TextaviaToolDefinition,
  ToolExecutionResult,
} from '@textavia/core';
import { requireText } from '@textavia/core';

/** Base URL for matching online Textavia tools. */
export const WEB_BASE = 'https://textavia.com/tools';

/** Builds a tool-shaped success result for text output. */
export function textResult(
  output: string,
  extra?: Partial<ToolExecutionResult<string>>,
): ToolExecutionResult<string> {
  return { output, outputKind: 'text', ...extra };
}

/** Builds a tool-shaped success result for JSON output. */
export function jsonResult<T>(
  output: T,
  extra?: Partial<ToolExecutionResult<T>>,
): ToolExecutionResult<T> {
  return { output, outputKind: 'json', ...extra };
}

/** Executor that reads the resolved text payload and maps it through `fn`. */
export function mapText<T>(
  fn: (text: string) => ToolExecutionResult<T>,
): NonNullable<TextaviaToolDefinition['execute']> {
  return (input) => fn(requireText(input));
}

/** Reads the resolved text payload, throwing a clear error when absent. */
export function inputText(input: ResolvedInput): string {
  return requireText(input);
}

/**
 * Joins non-empty lines for full-file line tools. Accepts the resolved text and
 * returns the line array plus a join helper.
 */
export function inputLines(input: ResolvedInput): string[] {
  const text = requireText(input);
  return text.length === 0 ? [] : text.split('\n');
}

/** Joins lines back with newline separators. */
export function joinLines(lines: readonly string[]): string {
  return lines.join('\n');
}
