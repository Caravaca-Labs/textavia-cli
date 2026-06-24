/**
 * @fileoverview Advisory performance smoke checks for built CLI artifacts.
 *
 * Run after `pnpm build`. Thresholds are reported but not treated as hard CI
 * failures until project-specific baselines are collected.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

interface SmokeResult {
  readonly name: string;
  readonly durationMs: number;
  readonly advisoryMs: number;
}

const root = resolve(new URL('..', import.meta.url).pathname);
const cliPath = join(root, 'packages', 'cli', 'dist', 'cli.js');

/** Runs the advisory smoke suite against `packages/cli/dist/cli.js`. */
export function runPerformanceSmoke(): readonly SmokeResult[] {
  if (!existsSync(cliPath)) {
    throw new Error('Built CLI artifact is missing. Run `pnpm build` first.');
  }

  const tmp = mkdtempSync(join(tmpdir(), 'txv-perf-'));
  try {
    const largeLines = Array.from({ length: 50_000 }, (_, index) => {
      return `  keyword-${index % 1000}  `;
    }).join('\n');
    const largePath = join(tmp, 'large-lines.txt');
    writeFileSync(largePath, largeLines);

    return [
      measure('cold case transform', 300, ['case', 'lower', 'HELLO WORLD']),
      measure('large line trim', 1500, ['lines', 'trim', '--file', largePath]),
      measure('large hash file', 1500, ['hash', 'sha256', '--file', largePath]),
      measure('large base64 file', 1500, [
        'base64',
        'encode',
        '--file',
        largePath,
      ]),
    ];
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function measure(
  name: string,
  advisoryMs: number,
  args: readonly string[],
): SmokeResult {
  const start = performance.now();
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  const durationMs = Math.round(performance.now() - start);
  if (result.status !== 0) {
    throw new Error(
      `${name} failed with exit ${result.status}: ${result.stderr}`,
    );
  }
  return { name, durationMs, advisoryMs };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const results = runPerformanceSmoke();
  for (const result of results) {
    const status =
      result.durationMs <= result.advisoryMs ? 'ok' : 'advisory-slow';
    process.stdout.write(
      `${status} ${result.name}: ${result.durationMs}ms (target ${result.advisoryMs}ms)\n`,
    );
  }
}
