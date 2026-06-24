/**
 * @fileoverview Sitemap importer.
 *
 * Reads a remote or local sitemap XML and emits candidate records mapping each
 * website page to a suggested CLI tool. Supports collapsed mapping where many
 * website variants (e.g. multiple Base64 pages) map to one CLI primitive.
 */

import { writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

/** Status of a website page relative to the CLI. */
export type CliStatus =
  | 'candidate'
  | 'covered'
  | 'web-only'
  | 'future'
  | 'ignored';

/** A candidate mapping record emitted by the importer. */
export interface SitemapToolCandidate {
  readonly slug: string;
  readonly webUrl: string;
  readonly suggestedCategory: string;
  readonly suggestedToolId: string | null;
  readonly cliStatus: CliStatus;
}

/** Maps a URL path slug to a category and canonical tool id when known. */
const SLUG_MAP: Readonly<Record<string, { category: string; toolId: string }>> =
  {
    slug: { category: 'case', toolId: 'case.slug' },
    lowercase: { category: 'case', toolId: 'case.lower' },
    uppercase: { category: 'case', toolId: 'case.upper' },
    camelcase: { category: 'case', toolId: 'case.camel' },
    'reverse-text': { category: 'text', toolId: 'text.reverse' },
    'clean-text': { category: 'text', toolId: 'text.clean' },
    'word-count': { category: 'text', toolId: 'text.stats' },
    'base64-encode': { category: 'encoding', toolId: 'encoding.base64.encode' },
    'base64-decode': { category: 'encoding', toolId: 'encoding.base64.decode' },
    'url-encode': { category: 'encoding', toolId: 'encoding.url.encode' },
    'url-decode': { category: 'encoding', toolId: 'encoding.url.decode' },
    'json-formatter': { category: 'dev', toolId: 'dev.json.format' },
    'md5-hash': { category: 'dev', toolId: 'dev.hash.md5' },
    'sha256-hash': { category: 'dev', toolId: 'dev.hash.sha256' },
    'uuid-generator': { category: 'random', toolId: 'random.uuid' },
    'password-generator': { category: 'random', toolId: 'random.password' },
    'remove-duplicate-lines': { category: 'lines', toolId: 'lines.unique' },
    'unicode-normalizer': { category: 'unicode', toolId: 'unicode.normalize' },
  };

/** Extracts <loc> URLs from sitemap XML. */
export function extractSitemapUrls(xml: string): string[] {
  const urls: string[] = [];
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/g;
  let match = re.exec(xml);
  while (match !== null) {
    const url = match[1];
    if (url !== undefined) {
      urls.push(url);
    }
    match = re.exec(xml);
  }
  return urls;
}

function slugFromUrl(url: string): string {
  const path = url.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '');
  const last = path
    .split(/[/?#]/)
    .filter((part) => part.length > 0)
    .pop();
  if (last === undefined) {
    return '';
  }
  return decodeURIComponent(last)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Maps website URLs to CLI tool candidates. Collapses multiple website variants
 * onto a single canonical tool id when the slug matches a known primitive.
 */
export function buildCandidates(
  urls: readonly string[],
): SitemapToolCandidate[] {
  const seen = new Set<string>();
  const out: SitemapToolCandidate[] = [];
  for (const url of urls) {
    const slug = slugFromUrl(url);
    if (slug.length === 0 || seen.has(slug)) {
      continue;
    }
    seen.add(slug);
    const mapping = SLUG_MAP[slug];
    if (mapping !== undefined) {
      out.push({
        slug,
        webUrl: url,
        suggestedCategory: mapping.category,
        suggestedToolId: mapping.toolId,
        cliStatus: 'covered',
      });
    } else {
      out.push({
        slug,
        webUrl: url,
        suggestedCategory: inferCategory(slug),
        suggestedToolId: null,
        cliStatus: 'candidate',
      });
    }
  }
  return out;
}

function inferCategory(slug: string): string {
  if (/hash|hmac/.test(slug)) {
    return 'dev';
  }
  if (/case|slug|camel|snake|kebab/.test(slug)) {
    return 'case';
  }
  if (/base64|url|hex|encode|decode/.test(slug)) {
    return 'encoding';
  }
  if (/line|sort|unique|duplicate/.test(slug)) {
    return 'lines';
  }
  if (/uuid|password|random/.test(slug)) {
    return 'random';
  }
  return 'candidate';
}

async function readSitemap(source: string): Promise<string> {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch sitemap: ${response.status} ${response.statusText}`,
      );
    }
    return response.text();
  }
  return readFile(source, 'utf8');
}

/** CLI entrypoint: `pnpm import:sitemap <source> [--out <path>]`. */
export async function importSitemap(args: readonly string[]): Promise<void> {
  const source = args[0];
  const outIndex = args.indexOf('--out');
  const outPath = outIndex !== -1 ? args[outIndex + 1] : undefined;
  if (source === undefined) {
    throw new Error('Usage: import:sitemap <url-or-path> [--out <path>]');
  }
  const xml = await readSitemap(source);
  const urls = extractSitemapUrls(xml);
  const candidates = buildCandidates(urls);
  const json = JSON.stringify(
    { source, count: candidates.length, candidates },
    null,
    2,
  );
  if (outPath !== undefined) {
    writeFileSync(outPath, json);
    process.stdout.write(
      `Wrote ${candidates.length} candidates to ${outPath}\n`,
    );
  } else {
    process.stdout.write(`${json}\n`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (
    args[0] === undefined ||
    args[0] === resolve(basename(process.argv[1] ?? ''))
  ) {
    // no-op guard
  }
  importSitemap(args).catch((error: unknown) => {
    process.stderr.write(
      `Error: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
