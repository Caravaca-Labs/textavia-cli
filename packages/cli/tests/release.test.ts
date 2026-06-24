import { mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { isDirectCliEntry } from '../src/cli.js';

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
    expect(pkg.files).toEqual(['dist', 'skills', 'README.md', 'LICENSE']);
    expect(pkg.pi).toEqual({ skills: ['./skills'] });
    expect(pkg.keywords).toContain('agent-skills');
    expect(pkg.keywords).toContain('pi-package');
  });

  it('detects npm bin symlinks as direct CLI execution', () => {
    const dir = mkdtempSync(join(tmpdir(), 'txv-bin-'));
    try {
      const target = resolve(root, 'packages/cli/src/cli.ts');
      const link = join(dir, 'txv');
      symlinkSync(target, link);
      expect(isDirectCliEntry(pathToFileURL(target).href, link)).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('keeps MCP publishable and agent skills bundled in textavia', () => {
    const mcp = readJson(resolve(root, 'packages/mcp/package.json'));
    const skills = readJson(
      resolve(root, 'packages/agent-skills/package.json'),
    );
    expect(mcp.bin).toEqual({ 'textavia-mcp': './dist/server.js' });
    expect(mcp.files).toEqual(['dist']);
    expect(mcp.homepage).toBe('https://textavia.com/developers/mcp');
    expect(mcp.keywords).toContain('model-context-protocol');
    expect(skills.private).toBe(true);
  });

  it('keeps generated skills in the textavia package and repo mirror', () => {
    const packageSkill = readFileSync(
      resolve(root, 'packages/cli/skills/textavia-json-tools/SKILL.md'),
      'utf8',
    );
    const rootSkill = readFileSync(
      resolve(root, 'skills/textavia-json-tools/SKILL.md'),
      'utf8',
    );
    expect(packageSkill).toContain('name: textavia-json-tools');
    expect(packageSkill).toContain('metadata:');
    expect(packageSkill).toContain('txv json format');
    expect(rootSkill).toBe(packageSkill);
  });
});
