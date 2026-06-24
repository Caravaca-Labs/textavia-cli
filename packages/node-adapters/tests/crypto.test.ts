import { describe, expect, it } from 'vitest';
import {
  assertHashAlgorithm,
  generatePassword,
  hashStream,
  hashValue,
  secureRandomBytes,
  secureUuid,
} from '../src/index.js';

describe('secureRandomBytes', () => {
  it('returns the requested length', () => {
    expect(secureRandomBytes(16).length).toBe(16);
  });

  it('produces different output across calls', () => {
    expect(Buffer.from(secureRandomBytes(32)).toString('hex')).not.toBe(
      Buffer.from(secureRandomBytes(32)).toString('hex'),
    );
  });

  it('rejects negative or non-integer lengths', () => {
    expect(() => secureRandomBytes(-1)).toThrowError();
    expect(() => secureRandomBytes(1.5)).toThrowError();
  });
});

describe('secureUuid', () => {
  it('returns a valid RFC 4122 v4 uuid', () => {
    const uuid = secureUuid();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});

describe('generatePassword', () => {
  it('respects length and default alphanumeric pool', () => {
    const password = generatePassword({ length: 20 });
    expect(password).toHaveLength(20);
    expect(password).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('includes symbols when requested', () => {
    const password = generatePassword({ length: 200, symbols: true });
    expect(password).toMatch(/[!@#$%^&*\-_=+?]/);
  });

  it('requireAll guarantees at least one of each enabled pool', () => {
    for (let i = 0; i < 50; i += 1) {
      const password = generatePassword({
        length: 12,
        symbols: true,
        requireAll: true,
      });
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[0-9]/);
      expect(password).toMatch(/[!@#$%^&*\-_=+?]/);
    }
  });

  it('rejects invalid lengths', () => {
    expect(() => generatePassword({ length: 0 })).toThrowError();
    expect(() => generatePassword({ length: 2.5 })).toThrowError();
  });

  it('rejects requireAll when length cannot cover enabled pools', () => {
    expect(() =>
      generatePassword({ length: 3, symbols: true, requireAll: true }),
    ).toThrowError(/too short/);
  });
});

describe('hashing', () => {
  it('produces known SHA256 digest for "abc"', () => {
    expect(hashValue('sha256', 'abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('produces known MD5 digest for the empty string', () => {
    expect(hashValue('md5', '')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('supports base64 encoding', () => {
    expect(hashValue('sha1', 'abc', 'base64')).toBe(
      'qZk+NkcGgWq6PiVxeFDCbJzQ2J0=',
    );
  });

  it('streams a byte source to the same digest as the full value', async () => {
    const data = Buffer.from('streaming hash fixture', 'utf8');
    async function* source(): AsyncIterable<Uint8Array> {
      yield data.subarray(0, 10);
      yield data.subarray(10);
    }
    const streamed = await hashStream('sha256', source());
    expect(streamed).toBe(hashValue('sha256', data));
  });

  it('assertHashAlgorithm rejects unsupported algorithms', () => {
    expect(() => assertHashAlgorithm('rot13')).toThrowError();
    expect(() => assertHashAlgorithm('sha256')).not.toThrowError();
  });
});
