import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));
const pkg = (name: string) =>
  resolve(root, 'packages', name, 'src', 'index.ts');

// biome-ignore lint/style/noDefaultExport: Vitest config files are loaded via default export.
export default defineConfig({
  resolve: {
    alias: {
      '@textavia/core': pkg('core'),
      '@textavia/schemas': pkg('schemas'),
      '@textavia/node-adapters': pkg('node-adapters'),
      '@textavia/plugin-standard': pkg('plugin-standard'),
      '@textavia/plugin-formatters': pkg('plugin-formatters'),
      '@textavia/plugin-media': pkg('plugin-media'),
      '@textavia/plugin-style': pkg('plugin-style'),
      '@textavia/plugin-data': pkg('plugin-data'),
      '@textavia/mcp': pkg('mcp'),
      textavia: pkg('cli'),
    },
  },
  test: {
    include: [
      'packages/**/tests/**/*.test.ts',
      'packages/**/src/**/*.test.ts',
      'scripts/**/*.test.ts',
    ],
    environment: 'node',
    globals: false,
  },
});
