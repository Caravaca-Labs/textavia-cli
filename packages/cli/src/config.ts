/**
 * @fileoverview Config loader and defaults merging.
 *
 * Search order: explicit `--config <path>`, then `textavia.config.json`,
 * `.textaviarc`, `.textaviarc.json` in the current working directory. Config
 * files are external input and validated with the schemas package.
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ParseError, type TextaviaConfig } from '@textavia/core';
import { TextaviaConfigSchema } from '@textavia/schemas';

const CONFIG_CANDIDATES = [
  'textavia.config.json',
  '.textaviarc',
  '.textaviarc.json',
] as const;

/** Built-in defaults (lowest precedence). */
export const BUILTIN_DEFAULTS: Readonly<Record<string, unknown>> = {
  indent: 2,
  'slug-separator': '-',
};

/** Returns a parsed config or null when no config file is found. */
export async function loadConfig(
  cwd: string,
  explicitPath?: string,
): Promise<TextaviaConfig | null> {
  if (explicitPath !== undefined) {
    return parseConfigFile(explicitPath);
  }
  for (const candidate of CONFIG_CANDIDATES) {
    const path = join(cwd, candidate);
    const parsed = await parseConfigFileOptional(path);
    if (parsed !== null) {
      return parsed;
    }
  }
  return null;
}

async function parseConfigFile(path: string): Promise<TextaviaConfig> {
  const content = await readConfigContent(path);
  return parseConfigJson(content, path);
}

async function parseConfigFileOptional(
  path: string,
): Promise<TextaviaConfig | null> {
  const content = await readConfigContentOptional(path);
  if (content === null) {
    return null;
  }
  return parseConfigJson(content, path);
}

async function readConfigContent(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    throw new ParseError(`Failed to read config file: ${path}`, {
      cause: error,
    });
  }
}

async function readConfigContentOptional(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (isFileNotFoundError(error)) {
      return null;
    }
    throw new ParseError(`Failed to read config file: ${path}`, {
      cause: error,
    });
  }
}

function isFileNotFoundError(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

function parseConfigJson(content: string, path: string): TextaviaConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new ParseError(`Config file is not valid JSON: ${path}`, {
      cause: error,
    });
  }
  return TextaviaConfigSchema.parse(parsed);
}

/**
 * Merges built-in defaults, config defaults, and a tool-specific defaults
 * override into a single defaults map. Explicit CLI flags are applied by the
 * caller (they are highest precedence) because the caller knows which flags
 * were present.
 */
export function mergeDefaults(
  config: TextaviaConfig | null,
  toolDefaults?: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const configDefaults = normalizeConfigDefaults(config?.defaults ?? {});
  return {
    ...BUILTIN_DEFAULTS,
    ...configDefaults,
    ...(toolDefaults ?? {}),
  };
}

function normalizeConfigDefaults(
  defaults: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const normalized = { ...defaults };
  copyDefault(defaults, normalized, 'json.indent', 'indent');
  copyDefault(defaults, normalized, 'case.locale', 'locale');
  copyDefault(defaults, normalized, 'slug.separator', 'separator');
  return normalized;
}

function copyDefault(
  source: Readonly<Record<string, unknown>>,
  target: Record<string, unknown>,
  from: string,
  to: string,
): void {
  if (source[from] !== undefined && target[to] === undefined) {
    target[to] = source[from];
  }
}
