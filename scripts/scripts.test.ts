import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateAgentSkills } from './generate-agent-skills.js';
import { buildRegistryForDocs, validateExamples } from './generate-docs.js';
import { buildCandidates, extractSitemapUrls } from './import-sitemap.js';

const FIXTURE_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset>
  <url><loc>https://textavia.com/tools/slug</loc></url>
  <url><loc>https://textavia.com/tools/base64-encode</loc></url>
  <url><loc>https://textavia.com/tools/base64-decode</loc></url>
  <url><loc>https://textavia.com/tools/uuid-generator</loc></url>
  <url><loc>https://textavia.com/tools/some-future-tool</loc></url>
</urlset>`;

describe('sitemap importer', () => {
  it('extracts loc urls from sitemap xml', () => {
    expect(extractSitemapUrls(FIXTURE_SITEMAP)).toHaveLength(5);
  });

  it('maps known slugs to canonical tool ids and collapses variants', () => {
    const candidates = buildCandidates(extractSitemapUrls(FIXTURE_SITEMAP));
    const bySlug = new Map(candidates.map((c) => [c.slug, c]));
    expect(bySlug.get('slug')?.suggestedToolId).toBe('case.slug');
    expect(bySlug.get('slug')?.cliStatus).toBe('covered');
    expect(bySlug.get('base64-encode')?.suggestedToolId).toBe(
      'encoding.base64.encode',
    );
    expect(bySlug.get('base64-decode')?.suggestedToolId).toBe(
      'encoding.base64.decode',
    );
    expect(bySlug.get('uuid-generator')?.cliStatus).toBe('covered');
  });

  it('marks unknown pages as candidates', () => {
    const candidates = buildCandidates(extractSitemapUrls(FIXTURE_SITEMAP));
    const future = candidates.find((c) => c.slug === 'some-future-tool');
    expect(future?.cliStatus).toBe('candidate');
    expect(future?.suggestedToolId).toBeNull();
  });
});

describe('docs generator validation', () => {
  it('passes example validation against the real registry', () => {
    const registry = buildRegistryForDocs();
    const tools = registry.list({ includeUnavailable: true });
    const errors = validateExamples(tools);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  it('reports an error when an example references a missing tool', () => {
    const errors = validateExamples([
      {
        id: 'case.slug',
        name: 'Slug',
        aliases: [],
        category: 'case',
        summary: 'slug',
        description: 'slug',
        inputKind: ['text'],
        outputKind: ['text'],
        optionsSchema: { parse: () => ({}) } as never,
        examples: [
          { title: 'bad', command: 'txv run nope.does-not-exist "x"' },
        ],
        stability: 'stable',
      },
    ]);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('agent skill generator', () => {
  it('generates implemented skill files from registry metadata', () => {
    const outputDir = mkdtempSync(join(tmpdir(), 'textavia-skills-'));
    try {
      expect(() => generateAgentSkills({ outputDir })).not.toThrow();
      const skillPath = join(outputDir, 'json-formatter', 'SKILL.md');
      expect(existsSync(skillPath)).toBe(true);
      expect(readFileSync(skillPath, 'utf8')).toContain('txv json format');
      const markdownSkillPath = join(outputDir, 'markdown-table', 'SKILL.md');
      expect(existsSync(markdownSkillPath)).toBe(true);
      expect(readFileSync(markdownSkillPath, 'utf8')).toContain(
        'txv table create',
      );
    } finally {
      rmSync(outputDir, { recursive: true, force: true });
    }
  });
});
