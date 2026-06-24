import { createToolRegistry } from '@textavia/core';
import { registerStandardTools } from '@textavia/plugin-standard';
import { describe, expect, it } from 'vitest';
import { registerStyleTools } from '../src/index.js';

describe('style plugin', () => {
  it('replaces style placeholders with executors', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registerStandardTools(registry);
    expect(registry.get('style.bold')?.execute).toBeUndefined();

    registerStyleTools(registry);

    expect(registry.get('style.bold')?.execute).toBeDefined();
    expect(registry.resolveCommand('style', 'bold')?.id).toBe('style.bold');
    expect(registry.resolveCommand('symbols', 'search')?.id).toBe(
      'style.symbols.search',
    );
  });

  it('styles text locally', async () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registerStandardTools(registry);
    registerStyleTools(registry);
    const tool = registry.get('style.bold');
    const result = await tool?.execute?.(
      { source: 'input', kind: 'text', encoding: 'utf8', text: 'Hi' },
      {},
      {
        toolId: 'style.bold',
        cwd: process.cwd(),
        mode: 'human',
        allowFilesystem: true,
        allowNetwork: false,
        allowUnsafe: false,
      },
    );
    expect(result?.output).not.toBe('Hi');
  });
});
