import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  RegistryValidationError,
  type TextaviaToolDefinition,
  createToolRegistry,
} from '../src/index.js';

function makeTool(
  overrides: Partial<TextaviaToolDefinition> = {},
): TextaviaToolDefinition {
  return {
    id: 'case.slug',
    name: 'Slug',
    aliases: ['slug'],
    category: 'case',
    summary: 'Slugify text.',
    description: 'Convert text to a URL slug.',
    inputKind: ['text'],
    outputKind: ['text'],
    optionsSchema: z.object({ separator: z.string().optional() }),
    examples: [{ title: 'Basic', command: 'txv slug "Hello World"' }],
    stability: 'stable',
    execute: () => ({ output: 'hello-world', outputKind: 'text' }),
    ...overrides,
  };
}

describe('ToolRegistry.register', () => {
  it('registers a valid tool and indexes it by id', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registry.register(makeTool());
    expect(registry.get('case.slug')?.id).toBe('case.slug');
    expect(registry.size()).toBe(1);
  });

  it('rejects duplicate canonical ids', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registry.register(makeTool());
    expect(() => registry.register(makeTool())).toThrowError(
      RegistryValidationError,
    );
  });

  it('allows optional plugin executors to replace missing-plugin placeholders', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registry.register(
      makeTool({
        id: 'format.ts',
        aliases: ['format ts'],
        category: 'format',
        stability: 'future',
        execute: undefined,
        requiresOptionalPlugin: '@textavia/plugin-formatters',
      }),
    );
    registry.register(
      makeTool({
        id: 'format.ts',
        aliases: ['format ts'],
        category: 'format',
        stability: 'stable',
        requiresOptionalPlugin: '@textavia/plugin-formatters',
        execute: () => ({ output: 'formatted', outputKind: 'text' }),
      }),
    );
    expect(registry.get('format.ts')?.stability).toBe('stable');
    expect(registry.resolveCommand('format', 'ts')?.execute).toBeDefined();
    expect(registry.size()).toBe(1);
  });

  it('rejects alias collisions across tools', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registry.register(makeTool({ id: 'case.slug', aliases: ['slug'] }));
    expect(() =>
      registry.register(
        makeTool({ id: 'case.kebab', aliases: ['slug', 'kebab'] }),
      ),
    ).toThrowError(/Alias "slug".*already belongs/);
  });

  it('rejects an invalid canonical id format', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    expect(() => registry.register(makeTool({ id: 'Bad ID' }))).toThrowError(
      RegistryValidationError,
    );
  });

  it('rejects a future tool that has an executor', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    expect(() =>
      registry.register(makeTool({ stability: 'future' })),
    ).toThrowError(/marked future but has an executor/);
  });
});

describe('ToolRegistry.resolveCommand', () => {
  it('resolves namespace.operation by canonical id', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registry.register(makeTool());
    expect(registry.resolveCommand('case', 'slug')?.id).toBe('case.slug');
  });

  it('resolves a bare namespace through aliases', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registry.register(makeTool({ aliases: ['slug'] }));
    expect(registry.resolveCommand('slug')?.id).toBe('case.slug');
  });
});

describe('ToolRegistry.list and search', () => {
  it('filters by category and excludes unavailable tools by default', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registry.register(makeTool({ id: 'case.slug', category: 'case' }));
    registry.register(
      makeTool({
        id: 'encoding.hex',
        category: 'encoding',
        stability: 'web-only',
        execute: undefined,
        aliases: ['hex'],
      }),
    );
    expect(registry.list().map((t) => t.id)).toEqual(['case.slug']);
    expect(
      registry.list({ includeUnavailable: true }).map((t) => t.id),
    ).toEqual(['case.slug', 'encoding.hex']);
    expect(registry.list({ category: 'encoding' })).toHaveLength(0);
    expect(
      registry.list({ category: 'encoding', includeUnavailable: true }).length,
    ).toBe(1);
  });

  it('searches across id, name, summary, description, and aliases', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registry.register(
      makeTool({
        id: 'case.slug',
        summary: 'URL slug generator',
        aliases: ['slug', 'sluggify'],
      }),
    );
    expect(registry.search('sluggify').map((t) => t.id)).toEqual(['case.slug']);
    expect(registry.search('')).toHaveLength(0);
  });
});

describe('ToolRegistry.manifest', () => {
  it('lists available stable tools with commands and metadata', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registry.register(
      makeTool({
        webUrl: 'https://textavia.com/slug',
        docsUrl:
          'https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs/developer-tools/case.slug.json',
      }),
    );
    const manifest = registry.manifest();
    expect(manifest.cli).toBe('txv');
    expect(manifest.version).toBe('0.1.0');
    expect(manifest.tools).toHaveLength(1);
    expect(manifest.tools[0]?.command).toBe('txv run case.slug');
    expect(manifest.tools[0]?.available).toBe(true);
  });

  it('omits experimental and unavailable tools unless requested', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registry.register(makeTool({ id: 'case.slug', stability: 'stable' }));
    registry.register(
      makeTool({
        id: 'case.experimental',
        stability: 'experimental',
        aliases: ['exp'],
      }),
    );
    registry.register(
      makeTool({
        id: 'case.future',
        stability: 'future',
        execute: undefined,
        aliases: ['fut'],
      }),
    );
    expect(registry.manifest().tools).toHaveLength(1);
    expect(
      registry.manifest({ includeExperimental: true, includeUnavailable: true })
        .tools.length,
    ).toBe(3);
  });
});
