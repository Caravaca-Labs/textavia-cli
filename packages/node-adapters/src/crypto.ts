/**
 * @fileoverview Crypto, randomness, and hashing adapters.
 *
 * All randomness uses node:crypto so passwords and UUIDs are
 * cryptographically secure. Hashing supports streaming updates for large files.
 */

import {
  createHash,
  randomBytes as nodeRandomBytes,
  randomUUID,
} from 'node:crypto';
import type { CryptoAdapter } from '@textavia/core';

/** Algorithms supported by the hash tools. */
export type HashAlgorithm =
  | 'md5'
  | 'sha1'
  | 'sha224'
  | 'sha256'
  | 'sha384'
  | 'sha512';

const SUPPORTED_ALGORITHMS: readonly HashAlgorithm[] = [
  'md5',
  'sha1',
  'sha224',
  'sha256',
  'sha384',
  'sha512',
];

/** Throws when `algorithm` is not a supported hash algorithm. */
export function assertHashAlgorithm(
  algorithm: string,
): asserts algorithm is HashAlgorithm {
  if (!SUPPORTED_ALGORITHMS.includes(algorithm as HashAlgorithm)) {
    throw new Error(
      `Unsupported hash algorithm: "${algorithm}". Use one of: ${SUPPORTED_ALGORITHMS.join(', ')}.`,
    );
  }
}

/** Generates `length` cryptographically secure random bytes. */
export function secureRandomBytes(length: number): Uint8Array {
  if (!Number.isInteger(length) || length < 0) {
    throw new Error(
      `random byte length must be a non-negative integer, got ${length}`,
    );
  }
  return nodeRandomBytes(length);
}

/** Generates a cryptographically secure random UUID (RFC 4122 v4). */
export function secureUuid(): string {
  return randomUUID();
}

/** Default character pools for password generation. */
export const PASSWORD_POOLS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*-_=+?',
} as const;

/** Options for random password generation. */
export interface PasswordOptions {
  readonly length: number;
  readonly lower?: boolean;
  readonly upper?: boolean;
  readonly digits?: boolean;
  readonly symbols?: boolean;
  /** Require at least one character from every enabled pool. */
  readonly requireAll?: boolean;
}

/** Builds the active character pool from {@link PasswordOptions}. */
function buildPool(options: PasswordOptions): string {
  const parts: string[] = [];
  if (options.lower !== false) {
    parts.push(PASSWORD_POOLS.lower);
  }
  if (options.upper !== false) {
    parts.push(PASSWORD_POOLS.upper);
  }
  if (options.digits !== false) {
    parts.push(PASSWORD_POOLS.digits);
  }
  if (options.symbols === true) {
    parts.push(PASSWORD_POOLS.symbols);
  }
  return parts.join('');
}

/** Picks an unbiased random index into `pool` using rejection sampling. */
function unbiasedIndex(poolLength: number, bytes: () => number): number {
  const limit = Math.floor(0x100 / poolLength) * poolLength;
  let idx = bytes();
  while (idx >= limit) {
    idx = bytes();
  }
  return idx % poolLength;
}

/**
 * Generates a cryptographically secure password.
 *
 * By default the pool includes letters and digits. Symbols are opt-in. When
 * `requireAll` is set, the result is guaranteed to contain at least one
 * character from every enabled pool.
 */
export function generatePassword(options: PasswordOptions): string {
  if (!Number.isInteger(options.length) || options.length < 1) {
    throw new Error(
      `password length must be a positive integer, got ${options.length}`,
    );
  }
  const pool = buildPool(options);
  if (pool.length === 0) {
    throw new Error('at least one character pool must be enabled');
  }
  const activePools = getActivePools(options);
  if (options.requireAll === true && options.length < activePools.length) {
    throw new Error(
      `password length ${options.length} is too short to include all ${activePools.length} enabled character pools`,
    );
  }
  const randomBuffer = secureRandomBytes(options.length * 4);
  let cursor = 0;
  const nextByte = (): number => {
    const value = byteAt(randomBuffer, cursor % randomBuffer.length);
    cursor += 1;
    return value;
  };

  const chars: string[] = [];
  if (options.requireAll === true) {
    for (const requiredPool of activePools) {
      const idx = unbiasedIndex(requiredPool.length, nextByte);
      chars.push(charAt(requiredPool, idx));
    }
  }
  for (let i = chars.length; i < options.length; i += 1) {
    const idx = unbiasedIndex(pool.length, nextByte);
    chars.push(charAt(pool, idx));
  }
  if (options.requireAll === true) {
    shuffleInPlace(chars, nextByte);
  }
  return chars.join('');
}

function getActivePools(options: PasswordOptions): readonly string[] {
  const activePools: string[] = [];
  if (options.lower !== false) {
    activePools.push(PASSWORD_POOLS.lower);
  }
  if (options.upper !== false) {
    activePools.push(PASSWORD_POOLS.upper);
  }
  if (options.digits !== false) {
    activePools.push(PASSWORD_POOLS.digits);
  }
  if (options.symbols === true) {
    activePools.push(PASSWORD_POOLS.symbols);
  }
  return activePools;
}

function shuffleInPlace(chars: string[], nextByte: () => number): void {
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = unbiasedIndex(i + 1, nextByte);
    const current = chars[i];
    const replacement = chars[j];
    if (current === undefined || replacement === undefined) {
      throw new Error('password shuffle index out of range');
    }
    chars[i] = replacement;
    chars[j] = current;
  }
}

/** Returns the byte at `index`, throwing if out of range. */
function byteAt(buffer: Uint8Array, index: number): number {
  const value = buffer[index];
  if (value === undefined) {
    throw new Error('random buffer index out of range');
  }
  return value;
}

/** Returns the character at `index`, throwing if out of range. */
function charAt(pool: string, index: number): string {
  const value = pool[index];
  if (value === undefined) {
    throw new Error('character pool index out of range');
  }
  return value;
}

/** Hashes a text or byte payload to a hex digest. */
export function hashValue(
  algorithm: HashAlgorithm,
  data: string | Uint8Array,
  encoding: 'hex' | 'base64' = 'hex',
): string {
  const hash = createHash(algorithm);
  hash.update(Buffer.isBuffer(data) ? data : Buffer.from(data));
  return hash.digest(encoding);
}

/**
 * Hashes a streaming byte source to a hex (or base64) digest without loading
 * the full input into memory.
 */
export async function hashStream(
  algorithm: HashAlgorithm,
  stream: AsyncIterable<Uint8Array>,
  encoding: 'hex' | 'base64' = 'hex',
): Promise<string> {
  const hash = createHash(algorithm);
  for await (const chunk of stream) {
    hash.update(chunk);
  }
  return hash.digest(encoding);
}

/** Core CryptoAdapter implementation backed by node:crypto. */
export const nodeCryptoAdapter: CryptoAdapter = {
  randomBytes: (length) => secureRandomBytes(length),
};
