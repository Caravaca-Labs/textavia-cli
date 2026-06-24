import { createToolRegistry } from '@textavia/core';
import { registerStandardTools } from '@textavia/plugin-standard';
import { describe, expect, it } from 'vitest';
import { registerFormatterTools } from '../src/index.js';

describe('formatter plugin', () => {
  it('replaces standard formatter placeholders with executors', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registerStandardTools(registry);
    expect(registry.get('format.ts')?.execute).toBeUndefined();

    registerFormatterTools(registry);

    const tool = registry.get('format.ts');
    expect(tool?.execute).toBeDefined();
    expect(tool?.stability).toBe('stable');
    expect(registry.resolveCommand('format', 'ts')?.id).toBe('format.ts');
  });

  it('formats CSS-like input deterministically', async () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registerStandardTools(registry);
    registerFormatterTools(registry);
    const tool = registry.get('format.css');
    const result = await tool?.execute?.(
      {
        source: 'input',
        kind: 'text',
        encoding: 'utf8',
        text: 'a{color:red;}',
      },
      {},
      {
        toolId: 'format.css',
        cwd: process.cwd(),
        mode: 'human',
        allowFilesystem: true,
        allowNetwork: false,
        allowUnsafe: false,
      },
    );
    expect(result?.output).toBe('a {\n  color: red;\n}\n');
  });
});
