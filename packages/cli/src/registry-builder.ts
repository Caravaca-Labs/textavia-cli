/**
 * @fileoverview Builds the CLI registry, bundling the standard plugin and
 * attempting to load optional formatter and media plugins when installed.
 *
 * Optional plugin resolution is best-effort: a missing plugin is not an error
 * here. Tools that declare `requiresOptionalPlugin` surface a
 * {@link PluginMissingError} when invoked.
 */

import {
  type RegistryVersion,
  type ToolRegistry,
  createToolRegistry,
} from '@textavia/core';
import { standardPlugin } from '@textavia/plugin-standard';

interface TextaviaPluginModule {
  readonly standardPlugin?: { register(registry: ToolRegistry): void };
  readonly formatterPlugin?: { register(registry: ToolRegistry): void };
  readonly mediaPlugin?: { register(registry: ToolRegistry): void };
  readonly stylePlugin?: { register(registry: ToolRegistry): void };
  readonly dataPlugin?: { register(registry: ToolRegistry): void };
  readonly registerStandardTools?: (registry: ToolRegistry) => void;
  readonly default?: {
    name: string;
    register(registry: ToolRegistry): void;
  };
}

/** Builds a registry with the standard plugin and any installed optional plugins. */
export function buildCliRegistry(version: RegistryVersion): ToolRegistry {
  const registry = createToolRegistry(version);
  standardPlugin.register(registry);
  return registry;
}

/**
 * Attempts to load an optional plugin package and register its tools. Returns
 * true when the plugin was loaded. Missing packages are ignored.
 */
export async function loadOptionalPlugin(
  registry: ToolRegistry,
  packageName: string,
): Promise<boolean> {
  try {
    const module = (await import(packageName)) as TextaviaPluginModule;
    const plugin =
      module.default ??
      module.standardPlugin ??
      module.formatterPlugin ??
      module.mediaPlugin ??
      module.stylePlugin ??
      module.dataPlugin;
    if (plugin !== undefined && typeof plugin.register === 'function') {
      plugin.register(registry);
      return true;
    }
    if (module.registerStandardTools !== undefined) {
      module.registerStandardTools(registry);
      return true;
    }
    return false;
  } catch (error) {
    if (isMissingPackageError(error, packageName)) {
      return false;
    }
    throw error;
  }
}

function isMissingPackageError(error: unknown, packageName: string): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const code =
    'code' in error && typeof error.code === 'string' ? error.code : undefined;
  return (
    (code === 'ERR_MODULE_NOT_FOUND' || code === 'MODULE_NOT_FOUND') &&
    error.message.includes(packageName)
  );
}
