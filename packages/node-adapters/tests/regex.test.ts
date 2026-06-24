import { TransformError } from '@textavia/core';
import { describe, expect, it } from 'vitest';
import { runRegexWithTimeout } from '../src/index.js';

describe('runRegexWithTimeout', () => {
  it('returns match details for a matching pattern', async () => {
    const result = await runRegexWithTimeout('l(o+)', '', 'hellooo', {
      timeoutMs: 2000,
    });
    expect(result.matched).toBe(true);
    expect(result.matches[0]?.value).toBe('looo');
    expect(result.matches[0]?.groups).toEqual(['ooo']);
  });

  it('reports no match for non-matching input', async () => {
    const result = await runRegexWithTimeout('xyz', '', 'hello');
    expect(result.matched).toBe(false);
    expect(result.matches).toHaveLength(0);
  });

  it('collects global matches', async () => {
    const result = await runRegexWithTimeout('\\d+', 'g', 'a1b22c333');
    expect(result.matches.map((m) => m.value)).toEqual(['1', '22', '333']);
  });

  it('times out on catastrophic backtracking', async () => {
    // Classic catastrophic backtracking: (a+)+ against many a's then no match.
    const evil = 'a'.repeat(30);
    await expect(
      runRegexWithTimeout('(a+)+b', '', evil, { timeoutMs: 200 }),
    ).rejects.toThrowError(TransformError);
  }, 5000);

  it('surfaces invalid regex as a TransformError', async () => {
    await expect(
      runRegexWithTimeout('(unclosed', '', 'input'),
    ).rejects.toThrowError(TransformError);
  });

  it('aborts when the signal fires', async () => {
    const controller = new AbortController();
    const promise = runRegexWithTimeout('(a+)+b', '', 'a'.repeat(30), {
      timeoutMs: 2000,
      signal: controller.signal,
    });
    controller.abort();
    await expect(promise).rejects.toThrowError(TransformError);
  });
});
