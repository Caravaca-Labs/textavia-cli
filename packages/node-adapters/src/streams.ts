/**
 * @fileoverview Stream and stdin adapters.
 *
 * Provides stdin detection, full stdin reads, async-iterable line and byte
 * streams from files, and composable line transforms that operate one line at
 * a time so large files stay memory-bounded.
 */

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import type { StreamAdapter } from '@textavia/core';

/** True when stdin is a TTY (no piped input available). */
export function isStdinTty(): boolean {
  return Boolean(process.stdin.isTTY);
}

/** True when stdin has piped data available. */
export function isStdinPiped(): boolean {
  return !isStdinTty();
}

/** Reads all of stdin as decoded text. Rejects on read failure. */
export function readStdinText(
  encoding: BufferEncoding = 'utf8',
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    process.stdin.on('end', () => {
      resolve(Buffer.concat(chunks).toString(encoding));
    });
    process.stdin.on('error', (error) => {
      reject(error);
    });
  });
}

/** Reads all of stdin as raw bytes. Rejects on read failure. */
export function readStdinBytes(): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    process.stdin.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    process.stdin.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Yields lines from a file one at a time, without loading the whole file.
 * Newline characters are stripped; empty lines are preserved as empty strings.
 */
export async function* linesFromFile(path: string): AsyncIterable<string> {
  const stream = createReadStream(path, { encoding: 'utf8' });
  const rl = createInterface({
    input: stream,
    crlfDelay: Number.POSITIVE_INFINITY,
  });
  try {
    for await (const line of rl) {
      yield line;
    }
  } finally {
    rl.close();
    stream.destroy();
  }
}

/** Yields raw byte chunks from a file for streaming hashes and base64. */
export async function* bytesFromFile(path: string): AsyncIterable<Uint8Array> {
  const stream = createReadStream(path);
  try {
    for await (const chunk of stream) {
      yield chunk as Uint8Array;
    }
  } finally {
    stream.destroy();
  }
}

/** A pure line transform applied to each line of a stream. */
export type LineTransform = (line: string, index: number) => string | null;

/**
 * Streams lines from `path`, applies `transform` per line, and yields the
 * transformed lines. A transform returning null drops the line entirely.
 */
export async function* transformLines(
  path: string,
  transform: LineTransform,
): AsyncIterable<string> {
  let index = 0;
  for await (const line of linesFromFile(path)) {
    const result = transform(line, index);
    if (result !== null) {
      yield result;
    }
    index += 1;
  }
}

/** Line transform: trims surrounding whitespace from each line. */
export const trimLine: LineTransform = (line) => line.trim();

/** Line transform: drops lines that are empty after trimming. */
export const removeEmptyLine: LineTransform = (line) =>
  line.trim().length === 0 ? null : line;

/** Line transform: lowercases each line. */
export const lowerLine: LineTransform = (line) => line.toLowerCase();

/** Line transform: uppercases each line. */
export const upperLine: LineTransform = (line) => line.toUpperCase();

/** Builds a line transform that replaces `search` with `replacement`. */
export function replaceLine(
  search: string,
  replacement: string,
): LineTransform {
  return (line) => line.split(search).join(replacement);
}

/** Core StreamAdapter implementation backed by Node streams. */
export const nodeStreamAdapter: StreamAdapter = {
  lines: (path) => linesFromFile(path),
  bytes: (path) => bytesFromFile(path),
};
