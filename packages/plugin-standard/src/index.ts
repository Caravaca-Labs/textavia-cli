/**
 * @fileoverview Public entrypoint for @textavia/plugin-standard.
 *
 * Registers the bundled lightweight default tools into a registry. The CLI and
 * MCP server consume this via {@link registerStandardTools}.
 */

import type { ToolRegistry } from '@textavia/core';
import { caseTools } from './tools/case-tools.js';
import { dataTools } from './tools/data-tools.js';
import { hashTools, jsonTools } from './tools/dev-tools.js';
import { devUtilityTools } from './tools/dev-utility-tools.js';
import { base64FutureTools, encodingTools } from './tools/encoding-tools.js';
import { extraTools } from './tools/extra-tools.js';
import { linesTools } from './tools/lines-tools.js';
import {
  dataPlaceholderTools,
  formatterPlaceholderTools,
  mediaPlaceholderTools,
  stylePlaceholderTools,
} from './tools/optional-tools.js';
import { randomTools } from './tools/random-tools.js';
import { textTools } from './tools/text-tools.js';
import { timestampTools } from './tools/timestamp-tools.js';
import { unicodeTools } from './tools/unicode-tools.js';

/** All standard tool definitions (implemented + future metadata). */
export const standardToolDefinitions = [
  ...caseTools,
  ...textTools,
  ...linesTools,
  ...unicodeTools,
  ...encodingTools,
  ...base64FutureTools,
  ...dataTools,
  ...jsonTools,
  ...hashTools,
  ...devUtilityTools,
  ...randomTools,
  ...timestampTools,
  ...extraTools,
  ...formatterPlaceholderTools,
  ...mediaPlaceholderTools,
  ...stylePlaceholderTools,
  ...dataPlaceholderTools,
];

/** Plugin descriptor consumed by the CLI plugin loader. */
export const standardPlugin = {
  name: '@textavia/plugin-standard',
  version: '0.1.0',
  register(registry: ToolRegistry): void {
    registerStandardTools(registry);
  },
};

/** Registers every standard tool definition into `registry`. */
export function registerStandardTools(registry: ToolRegistry): void {
  for (const tool of standardToolDefinitions) {
    registry.register(tool);
  }
}

export * from './tools/common.js';
export {
  caseTools,
  textTools,
  linesTools,
  unicodeTools,
  encodingTools,
  dataTools,
  jsonTools,
  hashTools,
  devUtilityTools,
  extraTools,
  randomTools,
  timestampTools,
  formatterPlaceholderTools,
  mediaPlaceholderTools,
  stylePlaceholderTools,
  dataPlaceholderTools,
};
