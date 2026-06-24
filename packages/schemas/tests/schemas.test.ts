import { describe, expect, it } from 'vitest';
import {
  AgentManifestSchema,
  JsonErrorSchema,
  JsonSuccessSchema,
  TextaviaConfigSchema,
  toJsonSchema,
} from '../src/index.js';

describe('TextaviaConfigSchema', () => {
  it('parses a valid config with defaults, aliases, and recipes', () => {
    const parsed = TextaviaConfigSchema.parse({
      defaults: { indent: 2 },
      aliases: { keywords: 'case.lower' },
      recipes: { 'clean-keywords': [['lines.unique'], ['case.lower']] },
      network: { allow: false },
    });
    expect(parsed.aliases?.keywords).toBe('case.lower');
  });

  it('rejects unknown top-level keys (strict)', () => {
    expect(() =>
      TextaviaConfigSchema.parse({ unknownField: true }),
    ).toThrowError();
  });

  it('rejects a recipe step that is not a [id, options] tuple', () => {
    expect(() =>
      TextaviaConfigSchema.parse({ recipes: { bad: ['justastring'] } }),
    ).toThrowError();
  });
});

describe('JSON output schemas', () => {
  it('parses a success object', () => {
    expect(
      JsonSuccessSchema.parse({
        ok: true,
        tool: 'case.lower',
        inputType: 'text',
        outputType: 'text',
        output: 'hello',
        meta: { durationMs: 1 },
      }).ok,
    ).toBe(true);
  });

  it('rejects a success object missing required meta.durationMs', () => {
    expect(() =>
      JsonSuccessSchema.parse({
        ok: true,
        tool: 'x',
        inputType: 'text',
        outputType: 'text',
        output: '',
        meta: {},
      }),
    ).toThrowError();
  });

  it('parses an error object with plugin/install fields', () => {
    const parsed = JsonErrorSchema.parse({
      ok: false,
      error: {
        code: 'PLUGIN_MISSING',
        message: 'missing',
        plugin: '@textavia/plugin-formatters',
        install: 'pnpm add @textavia/plugin-formatters',
      },
    });
    expect(parsed.error.plugin).toBe('@textavia/plugin-formatters');
  });
});

describe('AgentManifestSchema', () => {
  it('parses a minimal manifest', () => {
    const parsed = AgentManifestSchema.parse({
      cli: 'txv',
      version: '0.1.0',
      tools: [
        {
          id: 'case.lower',
          name: 'Lowercase',
          description: 'lower',
          category: 'case',
          inputKind: ['text'],
          outputKind: ['text'],
          command: 'txv run case.lower',
          stability: 'stable',
          available: true,
        },
      ],
    });
    expect(parsed.tools[0]?.command).toBe('txv run case.lower');
  });
});

describe('toJsonSchema', () => {
  it('returns a JSON schema object with a type property', () => {
    const schema = toJsonSchema(JsonSuccessSchema);
    expect(schema.type).toBe('object');
    expect(schema.properties).toBeDefined();
  });
});
