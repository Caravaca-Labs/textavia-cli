import { ParseError } from '@textavia/core';
import { describe, expect, it } from 'vitest';
import {
  decodeBase64ToBytes,
  decodeBase64ToText,
  encodeBase64Bytes,
  encodeBase64Text,
  fromDataUrl,
  isValidBase64,
  toDataUrl,
} from '../src/transforms/encoding.js';
import {
  formatJson,
  minifyJson,
  parseJson,
  validateJson,
} from '../src/transforms/json.js';
import {
  dateToUnix,
  nowTimestamp,
  parseTimestamp,
  unixToDate,
} from '../src/transforms/timestamp.js';
import { inspectCodePoints, normalize } from '../src/transforms/unicode.js';
import {
  decodeUrl,
  decodeUrlComponent,
  encodeUrl,
  encodeUrlComponent,
} from '../src/transforms/url.js';

describe('base64', () => {
  it('roundtrips text', () => {
    const encoded = encodeBase64Text('Hello, World!');
    expect(decodeBase64ToText(encoded)).toBe('Hello, World!');
  });
  it('roundtrips bytes byte-safely', () => {
    const bytes = Uint8Array.of(0, 128, 255, 1, 2);
    const encoded = encodeBase64Bytes(bytes);
    expect(Array.from(decodeBase64ToBytes(encoded))).toEqual([
      0, 128, 255, 1, 2,
    ]);
  });
  it('validates well-formed base64', () => {
    expect(isValidBase64('SGVsbG8=')).toBe(true);
    expect(isValidBase64('!!!notbase64')).toBe(false);
    expect(isValidBase64('abc')).toBe(false); // length not multiple of 4
    expect(isValidBase64('')).toBe(false);
  });
  it('throws when decoding invalid input', () => {
    expect(() => decodeBase64ToText('!!!')).toThrowError();
  });
  it('data url roundtrips', () => {
    const bytes = Uint8Array.of(1, 2, 3);
    const url = toDataUrl(bytes, 'image/png');
    const decoded = fromDataUrl(url);
    expect(decoded.mimeType).toBe('image/png');
    expect(Array.from(decoded.bytes)).toEqual([1, 2, 3]);
  });
});

describe('url', () => {
  it('component roundtrip preserves reserved characters', () => {
    const encoded = encodeUrlComponent('hello world&foo=bar');
    expect(decodeUrlComponent(encoded)).toBe('hello world&foo=bar');
  });
  it('encodeUrl preserves path separators', () => {
    expect(encodeUrl('https://x.com/a b')).toBe('https://x.com/a%20b');
  });
  it('decodeUrl restores reserved characters', () => {
    expect(decodeUrl('https://x.com/a%20b')).toBe('https://x.com/a b');
  });
  it('throws on malformed percent encoding', () => {
    expect(() => decodeUrlComponent('%zz')).toThrowError();
  });
});

describe('json', () => {
  it('formats with indentation', () => {
    expect(formatJson('{"a":1}')).toBe('{\n  "a": 1\n}');
  });
  it('minifies', () => {
    expect(minifyJson('{\n  "a" : 1\n}')).toBe('{"a":1}');
  });
  it('parse throws ParseError on invalid input', () => {
    expect(() => parseJson('{"a":}')).toThrowError(ParseError);
  });
  it('validate reports diagnostics without throwing', () => {
    const result = validateJson('{bad}');
    expect(result.valid).toBe(false);
  });
});

describe('unicode', () => {
  it('normalizes decomposed to composed', () => {
    const decomposed = 'e\u0301'; // é as e + combining acute
    expect(normalize(decomposed, 'NFC')).toBe('é');
  });
  it('inspects code points', () => {
    const info = inspectCodePoints('A😀');
    expect(info[0]?.hex).toBe('U+0041');
    expect(info[1]?.name).toBe('Emoji');
    expect(info[1]?.codePoint).toBe(0x1f600);
  });
});

describe('timestamp', () => {
  it('now returns iso and unix', () => {
    const result = nowTimestamp();
    expect(result.iso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.unit).toBe('seconds');
  });
  it('parses an ISO timestamp', () => {
    const result = parseTimestamp('2024-01-01T00:00:00Z');
    expect(result.unix).toBe(1704067200);
    expect(result.unit).toBe('seconds');
  });
  it('parses a unix number', () => {
    expect(parseTimestamp('1704067200').iso).toBe('2024-01-01T00:00:00.000Z');
  });
  it('converts unix to date and back', () => {
    expect(unixToDate(1704067200).iso).toBe('2024-01-01T00:00:00.000Z');
    expect(dateToUnix('2024-01-01T00:00:00Z').unix).toBe(1704067200);
  });
  it('throws on unparseable input', () => {
    expect(() => parseTimestamp('not a date')).toThrowError();
  });
});
