/**
 * @fileoverview Parent-side helper that runs a regex evaluation in an isolated
 * worker thread with a hard timeout and optional abort signal.
 *
 * Catastrophic backtracking can make a regex run effectively forever. Running
 * it in a worker lets us terminate the worker when the timeout elapses and
 * surface a {@link TransformError} instead of hanging the CLI.
 *
 * The worker body is inlined as a self-contained source string so it works
 * identically when executed from compiled output (`dist`) and from source
 * under Vitest, avoiding worker-file resolution ambiguity between `.js`/`.ts`.
 */

import { Worker } from 'node:worker_threads';
import { TransformError } from '@textavia/core';
import type { RegexWorkerResult, RegexWorkerTask } from './regex-task.js';

const DEFAULT_TIMEOUT_MS = 1000;
const DEFAULT_MAX_MATCHES = 10_000;

/**
 * Self-contained worker source (plain script, run with `eval: true`).
 * Mirrors the {@link RegexWorkerResult} contract from regex-task.ts.
 */
const WORKER_SOURCE = `
const { parentPort, workerData } = require('node:worker_threads');
function runRegex(task) {
  const re = new RegExp(task.pattern, task.flags);
  const matches = [];
  if (task.global) {
    const flags = task.flags.indexOf('g') >= 0 ? task.flags : task.flags + 'g';
    const globalRe = new RegExp(task.pattern, flags);
    globalRe.lastIndex = 0;
    let guard = 0;
    let match;
    while ((match = globalRe.exec(task.input)) !== null) {
      matches.push({ index: match.index, value: match[0], groups: match.slice(1) });
      if (match[0] === '') { globalRe.lastIndex += 1; }
      guard += 1;
      if (guard > task.maxMatches) {
        throw new Error('Exceeded maxMatches limit (' + task.maxMatches + ').');
      }
    }
  } else {
    var single = re.exec(task.input);
    if (single !== null) {
      matches.push({ index: single.index, value: single[0], groups: single.slice(1) });
    }
  }
  return { matched: matches.length > 0, matches: matches, inputLength: task.input.length };
}
try {
  parentPort.postMessage(runRegex(workerData));
} catch (error) {
  parentPort.postMessage({ error: (error && error.message) ? error.message : String(error) });
}
`;

/** Options for {@link runRegexWithTimeout}. */
export interface RegexRunOptions {
  readonly timeoutMs?: number;
  readonly maxMatches?: number;
  readonly signal?: AbortSignal;
}

/**
 * Evaluates a regex against `input` in a worker, resolving with structured
 * match details. Rejects with {@link TransformError} on timeout or worker
 * failure, and with an interrupted error if the abort signal fires.
 */
export function runRegexWithTimeout(
  pattern: string,
  flags: string,
  input: string,
  options: RegexRunOptions = {},
): Promise<RegexWorkerResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxMatches = options.maxMatches ?? DEFAULT_MAX_MATCHES;
  const global = flags.includes('g');

  const task: RegexWorkerTask = { pattern, flags, input, global, maxMatches };

  return new Promise<RegexWorkerResult>((resolve, reject) => {
    const worker = new Worker(WORKER_SOURCE, { eval: true, workerData: task });

    let settled = false;

    const cleanup = (): void => {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', onAbort);
      if (!settled) {
        void worker.terminate().catch(() => {
          // Termination failure is best-effort; nothing useful to do here.
        });
      }
    };

    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(
        new TransformError(
          `Regex evaluation timed out after ${timeoutMs}ms (likely catastrophic backtracking).`,
          { hint: 'Simplify the pattern or increase --timeout.' },
        ),
      );
    }, timeoutMs);

    const onAbort = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(new TransformError('Regex evaluation was interrupted.'));
    };

    if (options.signal !== undefined) {
      if (options.signal.aborted) {
        onAbort();
        return;
      }
      options.signal.addEventListener('abort', onAbort, { once: true });
    }

    worker.on('message', (message: RegexWorkerResult | { error: string }) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      if ('error' in message) {
        reject(new TransformError(`Regex evaluation failed: ${message.error}`));
      } else {
        resolve(message);
      }
    });

    worker.on('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(new TransformError('Regex worker crashed.', { cause: error }));
    });

    worker.on('exit', (code) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(
        new TransformError(
          `Regex worker exited unexpectedly with code ${code}.`,
        ),
      );
    });
  });
}
