import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(new URL('../../..', import.meta.url).pathname);

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

describe('release readiness metadata', () => {
  it('keeps required root quality scripts wired', () => {
    const pkg = readJson(resolve(root, 'package.json'));
    const scripts = pkg.scripts as Record<string, string>;
    expect(scripts.build).toBe('pnpm -r run build');
    expect(scripts.test).toContain('vitest run');
    expect(scripts.lint).toContain('biome check');
    expect(scripts.typecheck).toBe('pnpm -r run typecheck');
    expect(scripts['generate:docs']).toContain('scripts/generate-docs.ts');
    expect(scripts['generate:skills']).toContain(
      'scripts/generate-agent-skills.ts',
    );
    expect(scripts['import:sitemap']).toContain('scripts/import-sitemap.ts');
  });

  it('keeps the preferred npm package name and CLI bins', () => {
    const pkg = readJson(resolve(root, 'packages/cli/package.json'));
    expect(pkg.name).toBe('textavia');
    expect(pkg.bin).toEqual({
      textavia: './dist/cli.js',
      txv: './dist/cli.js',
    });
    expect(pkg.exports).toEqual({
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
        default: './dist/index.js',
      },
    });
    expect(pkg.files).toEqual(['dist']);
  });

  it('keeps MCP and agent packages publishable through generated artifacts', () => {
    const mcp = readJson(resolve(root, 'packages/mcp/package.json'));
    const skills = readJson(
      resolve(root, 'packages/agent-skills/package.json'),
    );
    expect(mcp.bin).toEqual({ 'textavia-mcp': './dist/server.js' });
    expect(mcp.files).toEqual(['dist']);
    expect(skills.files).toEqual(['dist', 'skills']);
  });
});
