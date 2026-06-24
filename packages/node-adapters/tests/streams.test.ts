import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  bytesFromFile,
  linesFromFile,
  lowerLine,
  removeEmptyLine,
  replaceLine,
  transformLines,
  trimLine,
  upperLine,
} from '../src/index.js';

let workDir = '';

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'textavia-stream-'));
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

async function collect<T>(iter: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const item of iter) {
    out.push(item);
  }
  return out;
}

describe('line streaming', () => {
  it('streams lines from a file', async () => {
    const path = join(workDir, 'lines.txt');
    await writeFile(path, 'a\nb\nc\n');
    expect(await collect(linesFromFile(path))).toEqual(['a', 'b', 'c']);
  });

  it('applies a pipeline of line transforms', async () => {
    const path = join(workDir, 'lines.txt');
    await writeFile(path, ' Apple \n\nBanana\n');
    const result = await collect(transformLines(path, (line) => line.trim()));
    expect(result).toEqual(['Apple', '', 'Banana']);
  });

  it('trim, remove-empty, lower, upper, replace transforms', () => {
    expect(trimLine('  hi  ')).toBe('hi');
    expect(removeEmptyLine('   ')).toBeNull();
    expect(removeEmptyLine('x')).toBe('x');
    expect(lowerLine('AbC')).toBe('abc');
    expect(upperLine('AbC')).toBe('ABC');
    expect(replaceLine('a', 'b')('banana')).toBe('bbnbnb');
  });
});

describe('byte streaming', () => {
  it('streams raw byte chunks from a file', async () => {
    const path = join(workDir, 'bytes.bin');
    await writeFile(path, Buffer.from([1, 2, 3, 4, 5]));
    const chunks = await collect(bytesFromFile(path));
    const all = chunks.reduce<number[]>((acc, c) => {
      for (const b of c) {
        acc.push(b);
      }
      return acc;
    }, []);
    expect(all).toEqual([1, 2, 3, 4, 5]);
  });
});
