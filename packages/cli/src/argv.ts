/**
 * @fileoverview Manual argv parser.
 *
 * Commander renders help/version, but the dynamic `txv <namespace> <operation>
 * [input] [tool-options]` grammar with passthrough tool options is easier to
 * keep deterministic and fully tested with a small dedicated parser.
 */

import { UsageError } from '@textavia/core';
import { GLOBAL_OPTIONS } from './global-options.js';

/** Strongly typed global options parsed from argv. */
export interface GlobalOptions {
  readonly input?: string;
  readonly file?: string;
  readonly files?: string;
  readonly stdin?: boolean;
  readonly out?: string;
  readonly outDir?: string;
  readonly write?: boolean;
  readonly dryRun?: boolean;
  readonly backup?: boolean;
  readonly encoding?: string;
  readonly json?: boolean;
  readonly ndjson?: boolean;
  readonly quiet?: boolean;
  readonly noColor?: boolean;
  readonly explain?: boolean;
  readonly config?: string;
  readonly allowNetwork?: boolean;
  readonly unsafe?: boolean;
  readonly debug?: boolean;
}

/** Parsed result of the full argv. */
export interface ParsedArgs {
  readonly globals: GlobalOptions;
  readonly positionals: readonly string[];
  readonly toolOptions: Readonly<Record<string, string | boolean>>;
}

const VALUE_FLAGS = new Set(
  GLOBAL_OPTIONS.filter((option) => option.takesValue).map(
    (option) => option.flag,
  ),
);
const BOOLEAN_FLAGS = new Set(
  GLOBAL_OPTIONS.filter((option) => !option.takesValue).map(
    (option) => option.flag,
  ),
);
const GLOBAL_FLAG_TO_KEY = new Map(
  GLOBAL_OPTIONS.map((option) => [option.flag, option.key]),
);

function looksLikeFlag(token: string): boolean {
  return token.startsWith('-') && token !== '-' && token !== '--';
}

/** Strips leading `--`/`-` and returns the canonical option name. */
function optionName(flag: string): string {
  return flag.replace(/^--?/, '');
}

/**
 * Parses argv into globals, positionals, and passthrough tool options.
 *
 * Value options consume the next token as their value. Unknown options are
 * collected into `toolOptions`: `--opt=value` becomes a string, a bare `--opt`
 * followed by a non-flag token becomes a string, otherwise a boolean.
 */
export function parseArgs(argv: readonly string[]): ParsedArgs {
  const globals: Record<string, string | boolean> = {};
  const toolOptions: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  let i = 0;
  let onlyPositionals = false;

  while (i < argv.length) {
    const token = argv[i];
    if (token === undefined) {
      i += 1;
      continue;
    }

    if (onlyPositionals) {
      positionals.push(token);
      i += 1;
      continue;
    }

    if (token === '--') {
      onlyPositionals = true;
      i += 1;
      continue;
    }

    if (token.startsWith('--') && token.includes('=')) {
      const [flag, value] = splitOnce(token, '=');
      const key = GLOBAL_FLAG_TO_KEY.get(flag ?? '');
      if (key !== undefined) {
        globals[key] = value ?? '';
      } else {
        toolOptions[optionName(flag ?? '')] = value ?? '';
      }
      i += 1;
      continue;
    }

    if (VALUE_FLAGS.has(token)) {
      const value = argv[i + 1];
      const key = GLOBAL_FLAG_TO_KEY.get(token);
      if (key !== undefined) {
        if (value === undefined || looksLikeFlag(value)) {
          throw new UsageError(`Option ${token} requires a value.`);
        }
        globals[key] = value;
      }
      i += 2;
      continue;
    }

    if (BOOLEAN_FLAGS.has(token)) {
      const key = GLOBAL_FLAG_TO_KEY.get(token);
      if (key !== undefined) {
        globals[key] = true;
      }
      i += 1;
      continue;
    }

    if (token.startsWith('--')) {
      // Unknown (tool) option.
      const next = argv[i + 1];
      if (next !== undefined && !looksLikeFlag(next)) {
        toolOptions[optionName(token)] = next;
        i += 2;
      } else {
        toolOptions[optionName(token)] = true;
        i += 1;
      }
      continue;
    }

    if (token.startsWith('-') && token.length > 1) {
      // Treat short unknown flags as boolean tool options.
      toolOptions[optionName(token)] = true;
      i += 1;
      continue;
    }

    positionals.push(token);
    i += 1;
  }

  return { globals, positionals, toolOptions };
}

function splitOnce(
  value: string,
  separator: string,
): [string, string | undefined] {
  const index = value.indexOf(separator);
  if (index === -1) {
    return [value, undefined];
  }
  return [value.slice(0, index), value.slice(index + 1)];
}
