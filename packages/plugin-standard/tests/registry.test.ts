import { createToolRegistry } from '@textavia/core';
import { describe, expect, it } from 'vitest';
import {
  registerStandardTools,
  standardToolDefinitions,
} from '../src/index.js';

function buildRegistry() {
  const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
  registerStandardTools(registry);
  return registry;
}

describe('standard plugin registry assembly', () => {
  it('registers every definition without duplicate ids or alias collisions', () => {
    const registry = buildRegistry();
    expect(registry.size()).toBe(standardToolDefinitions.length);
  });

  it('resolves core v0.1 canonical ids', () => {
    const registry = buildRegistry();
    const expected = [
      'case.camel',
      'case.slug',
      'text.clean',
      'lines.unique',
      'encoding.base64.encode',
      'encoding.base64.decode',
      'encoding.base64.validate',
      'encoding.url.encode',
      'encoding.url.decode',
      'dev.json.format',
      'dev.json.minify',
      'dev.json.validate',
      'dev.hash.md5',
      'dev.hash.sha1',
      'dev.hash.sha256',
      'dev.hash.sha512',
      'random.uuid',
      'random.password',
      'dev.timestamp.now',
      'unicode.normalize',
      'unicode.inspect',
    ];
    for (const id of expected) {
      expect(registry.get(id), `missing ${id}`).toBeDefined();
    }
  });

  it('routes namespace.operation commands through the registry', () => {
    const registry = buildRegistry();
    expect(registry.resolveCommand('case', 'slug')?.id).toBe('case.slug');
    expect(registry.resolveCommand('json', 'format')?.id).toBe(
      'dev.json.format',
    );
    expect(registry.resolveCommand('hash', 'sha256')?.id).toBe(
      'dev.hash.sha256',
    );
  });

  it('resolves bare aliases like slug and uuid', () => {
    const registry = buildRegistry();
    expect(registry.resolveAlias('slug')?.id).toBe('case.slug');
    expect(registry.resolveAlias('uuid')?.id).toBe('random.uuid');
  });

  it('marks future base64 tools as unavailable and excludes them from the manifest', () => {
    const registry = buildRegistry();
    const normalize = registry.get('encoding.base64.normalize');
    expect(normalize?.stability).toBe('future');
    const manifest = registry.manifest();
    expect(
      manifest.tools.find((t) => t.id === 'encoding.base64.normalize'),
    ).toBeUndefined();
  });

  it('generates a manifest with available tools only', () => {
    const registry = buildRegistry();
    const manifest = registry.manifest();
    expect(manifest.cli).toBe('txv');
    expect(manifest.tools.length).toBeGreaterThan(0);
    for (const tool of manifest.tools) {
      expect(tool.command).toMatch(/^txv run /);
    }
  });
});
