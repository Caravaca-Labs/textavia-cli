/**
 * @fileoverview Zod schemas and JSON schema export helpers.
 *
 * These schemas validate untrusted external payloads (config files, manifest
 * consumers) at boundaries. Registry definitions are validated structurally by
 * core; here we describe the wire shapes for consumers and generation.
 */

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const ToolCategoryEnum = z.enum([
  'text',
  'case',
  'lines',
  'encoding',
  'data',
  'dev',
  'format',
  'random',
  'media',
  'style',
  'unicode',
  'recipe',
  'agent',
]);

const ToolStabilityEnum = z.enum([
  'stable',
  'experimental',
  'future',
  'web-only',
  'deprecated',
]);

const ToolInputKindEnum = z.enum([
  'text',
  'bytes',
  'file',
  'files',
  'json',
  'csv',
  'table',
  'image',
  'pdf',
  'generated',
]);

const ToolOutputKindEnum = z.enum([
  'text',
  'bytes',
  'json',
  'csv',
  'markdown',
  'html',
  'image',
  'pdf',
  'file',
  'summary',
]);

/** Schema for a worked example as it appears in config and docs. */
export const ToolExampleSchema = z.object({
  title: z.string().min(1),
  command: z.string().min(1),
  input: z.string().optional(),
  output: z.string().optional(),
  notes: z.string().optional(),
});

/** Schema for the metadata portion of a tool definition used in generation. */
export const ToolDefinitionMetadataSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:\.[a-z0-9-]+)*$/, 'lowercase namespace.operation'),
  name: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  category: ToolCategoryEnum,
  summary: z.string().min(1),
  description: z.string().min(1),
  inputKind: z.array(ToolInputKindEnum).min(1),
  outputKind: z.array(ToolOutputKindEnum).min(1),
  webUrl: z.string().url().optional(),
  docsUrl: z.string().url().optional(),
  stability: ToolStabilityEnum,
  requiresNetwork: z.boolean().optional(),
  requiresFilesystem: z.boolean().optional(),
  requiresOptionalPlugin: z.string().optional(),
  installHint: z.string().optional(),
  streaming: z.boolean().optional(),
  fullFile: z.boolean().optional(),
  examples: z.array(ToolExampleSchema).default([]),
});

/** Schema for the JSON success output object. */
export const JsonSuccessSchema = z.object({
  ok: z.literal(true),
  tool: z.string(),
  inputType: z.string(),
  outputType: z.string(),
  output: z.unknown(),
  meta: z.object({
    durationMs: z.number().nonnegative(),
    warnings: z.array(z.string()).optional(),
    explanation: z.string().optional(),
    writtenFiles: z.array(z.string()).optional(),
  }),
});

/** Schema for the JSON error output object. */
export const JsonErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    hint: z.string().optional(),
    plugin: z.string().optional(),
    install: z.string().optional(),
    details: z.unknown().optional(),
  }),
});

/** Schema for a single recipe step: either `[id]` or `[id, options]`. */
export const RecipeStepSchema = z.union([
  z.tuple([z.string().min(1)]),
  z.tuple([z.string().min(1), z.record(z.string(), z.unknown())]),
]);

/** Schema for the project config file. */
export const TextaviaConfigSchema = z
  .object({
    defaults: z.record(z.string(), z.unknown()).optional(),
    aliases: z.record(z.string(), z.string()).optional(),
    recipes: z.record(z.string(), z.array(RecipeStepSchema)).optional(),
    network: z.object({ allow: z.boolean() }).optional(),
  })
  .strict();

/** Schema for a single agent manifest tool entry. */
export const AgentManifestToolSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  category: ToolCategoryEnum,
  inputKind: z.array(z.string()),
  outputKind: z.array(z.string()),
  command: z.string(),
  stability: ToolStabilityEnum,
  webUrl: z.string().optional(),
  docsUrl: z.string().optional(),
  requiresNetwork: z.boolean().optional(),
  requiresFilesystem: z.boolean().optional(),
  requiresOptionalPlugin: z.string().optional(),
  available: z.boolean(),
});

/** Schema for the full agent manifest. */
export const AgentManifestSchema = z.object({
  cli: z.string(),
  version: z.string(),
  tools: z.array(AgentManifestToolSchema),
});

/**
 * Converts a Zod schema into a plain JSON Schema (draft-07) object for MCP and
 * external consumers. Accepts unknown input and returns a structured object so
 * the result can be serialized safely.
 */
export function toJsonSchema(
  schema: z.ZodType<unknown>,
): Record<string, unknown> {
  return zodToJsonSchema(schema, { target: 'jsonSchema7' }) as Record<
    string,
    unknown
  >;
}

export {
  ToolCategoryEnum,
  ToolStabilityEnum,
  ToolInputKindEnum,
  ToolOutputKindEnum,
};
