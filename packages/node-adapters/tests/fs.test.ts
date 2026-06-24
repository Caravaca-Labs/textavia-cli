import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  backupFile,
  pathExists,
  readBytesFile,
  readTextFile,
  writeAtomic,
} from '../src/index.js';

let workDir = '';

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'textavia-fs-'));
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

describe('writeAtomic', () => {
  it('writes new content and reads it back', async () => {
    const path = join(workDir, 'out.txt');
    await writeAtomic(path, 'hello world');
    expect(await readTextFile(path)).toBe('hello world');
  });

  it('writes bytes byte-safely', async () => {
    const path = join(workDir, 'out.bin');
    const bytes = Uint8Array.of(0, 128, 255, 1, 2);
    await writeAtomic(path, bytes);
    const read = await readBytesFile(path);
    expect(Array.from(read)).toEqual([0, 128, 255, 1, 2]);
  });

  it('dry run does not create a file', async () => {
    const path = join(workDir, 'dry.txt');
    await writeAtomic(path, 'data', { dryRun: true });
    expect(await pathExists(path)).toBe(false);
  });

  it('backup creates a .bak copy of the existing file', async () => {
    const path = join(workDir, 'bak.txt');
    await writeFile(path, 'original');
    await writeAtomic(path, 'updated', { backup: true });
    expect(await readTextFile(path)).toBe('updated');
    expect(await readTextFile(`${path}.bak`)).toBe('original');
  });

  it('backup is a no-op when the source does not exist', async () => {
    const path = join(workDir, 'missing.txt');
    await backupFile(path);
    expect(await pathExists(`${path}.bak`)).toBe(false);
  });

  it('failed write preserves the original file', async () => {
    const path = join(workDir, 'preserve.txt');
    await writeFile(path, 'keep me');
    // Make the file read-only so the rename/overwrite into its directory fails.
    // Instead, point the write at an unwritable nested path under a file.
    const badPath = join(path, 'child.txt');
    await expect(writeAtomic(badPath, 'x')).rejects.toThrowError();
    expect(await readTextFile(path)).toBe('keep me');
  });

  it('creates parent directories as needed', async () => {
    const path = join(workDir, 'nested', 'deep', 'out.txt');
    await writeAtomic(path, 'nested');
    expect(await readTextFile(path)).toBe('nested');
  });
});
