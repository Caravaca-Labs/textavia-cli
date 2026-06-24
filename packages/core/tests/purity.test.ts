import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const coreDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

/** Modules that must never be imported by pure core code. */
const FORBIDDEN = [
  /^node:fs/,
  /^node:os/,
  /^node:child_process/,
  /^node:net/,
  /^node:http/,
  /^node:https/,
  /^node:path/,
  /^node:crypto$/,
  /^node:stream$/,
  /^node:process$/,
  /^fs$/,
  /^os$/,
  /^child_process$/,
  /^process$/,
  /^commander$/,
  /^zod-to-json-schema$/,
];

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listTsFiles(full));
    } else if (entry.name.endsWith('.ts')) {
      out.push(full);
    }
  }
  return out;
}

describe('core purity', () => {
  it('does not import Node runtime or CLI framework modules', () => {
    const offenders: string[] = [];
    for (const file of listTsFiles(coreDir)) {
      const source = readFileSync(file, 'utf8');
      const importLines =
        source.match(/^\s*import[^;]*from\s+['"][^'"]+['"]/gm) ?? [];
      for (const line of importLines) {
        const specifier = line.match(/from\s+['"]([^'"]+)['"]/)?.[1];
        if (specifier === undefined) {
          continue;
        }
        if (FORBIDDEN.some((re) => re.test(specifier))) {
          offenders.push(`${file}: ${specifier}`);
        }
      }
    }
    expect(
      offenders,
      `Forbidden imports found:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});
