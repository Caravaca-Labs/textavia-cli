import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createToolRegistry } from '@textavia/core';
import {
  AgentManifestSchema,
  ToolDefinitionMetadataSchema,
} from '@textavia/schemas';
import { describe, expect, it } from 'vitest';
import { registerStandardTools } from '../src/index.js';

const testDir = fileURLToPath(new URL('.', import.meta.url));

function buildRegistry() {
  const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
  registerStandardTools(registry);
  return registry;
}

describe('standard registry definition of done', () => {
  it('validates implemented tool metadata and docs fields', () => {
    const registry = buildRegistry();
    const implemented = registry
      .all()
      .filter((tool) => tool.execute !== undefined);
    expect(implemented.length).toBeGreaterThan(0);

    for (const tool of implemented) {
      const metadata = {
        id: tool.id,
        name: tool.name,
        aliases: tool.aliases,
        category: tool.category,
        summary: tool.summary,
        description: tool.description,
        inputKind: tool.inputKind,
        outputKind: tool.outputKind,
        webUrl: tool.webUrl,
        docsUrl: tool.docsUrl,
        stability: tool.stability,
        requiresNetwork: tool.requiresNetwork,
        requiresFilesystem: tool.requiresFilesystem,
        requiresOptionalPlugin: tool.requiresOptionalPlugin,
        installHint: tool.installHint,
        streaming: tool.streaming,
        fullFile: tool.fullFile,
        examples: tool.examples,
      };
      expect(
        () => ToolDefinitionMetadataSchema.parse(metadata),
        tool.id,
      ).not.toThrow();
      expect(
        tool.examples.length,
        `${tool.id} must include examples`,
      ).toBeGreaterThan(0);
      expect(
        tool.webUrl ?? tool.docsUrl,
        `${tool.id} must link to web or developer docs`,
      ).toBeDefined();
      expect(
        tool.optionsSchema,
        `${tool.id} must declare an option schema`,
      ).toBeDefined();
    }
  });

  it('validates every manifest entry against the public schema', () => {
    const registry = buildRegistry();
    expect(() =>
      AgentManifestSchema.parse(
        registry.manifest({
          includeExperimental: true,
          includeUnavailable: true,
        }),
      ),
    ).not.toThrow();
  });

  it('preserves committed stable canonical tool ids', () => {
    const baseline = JSON.parse(
      readFileSync(join(testDir, 'fixtures', 'stable-tool-ids.json'), 'utf8'),
    ) as string[];
    const registry = buildRegistry();
    for (const id of baseline) {
      expect(
        registry.get(id),
        `stable id was removed or renamed: ${id}`,
      ).toBeDefined();
    }
  });
});
