import { describe, expect, it } from 'vitest';
import {
  cleanText,
  computeStats,
  countSyllables,
  privacyScrub,
  removeFormatting,
  replaceAll,
  reverseText,
  toPlainText,
  wordFrequency,
} from '../src/transforms/text.js';

describe('reverseText', () => {
  it('reverses by grapheme cluster so emoji survive', () => {
    expect(reverseText('abc')).toBe('cba');
    expect(reverseText('hello 😀🇺🇸')).toBe('🇺🇸😀 olleh');
  });
});

describe('clean and plain text', () => {
  it('collapses whitespace', () => {
    expect(cleanText('  hello   world  ')).toBe('hello world');
  });
  it('strips tags', () => {
    expect(toPlainText('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });
  it('removes formatting noise', () => {
    expect(removeFormatting('a\u200Bb\u0000c')).toBe('abc');
  });
});

describe('replaceAll', () => {
  it('replaces all occurrences', () => {
    expect(replaceAll('banana', 'a', 'o')).toBe('bonono');
  });
  it('rejects an empty search string', () => {
    expect(() => replaceAll('x', '', 'y')).toThrowError();
  });
});

describe('computeStats', () => {
  it('counts characters, words, lines, sentences, bytes', () => {
    const stats = computeStats('Hello world.\nSecond line!');
    expect(stats.characters).toBe(25);
    expect(stats.words).toBe(4);
    expect(stats.lines).toBe(2);
    expect(stats.sentences).toBe(2);
    expect(stats.bytes).toBe(25);
  });
  it('counts zero words for empty text', () => {
    expect(computeStats('').words).toBe(0);
  });
});

describe('wordFrequency', () => {
  it('counts case-insensitively', () => {
    expect(wordFrequency('The the THE')).toEqual({ the: 3 });
  });
});

describe('countSyllables', () => {
  it('estimates syllables for common words', () => {
    expect(countSyllables('hello')).toBe(2);
    expect(countSyllables('apple')).toBe(2);
    expect(countSyllables('')).toBe(0);
  });
});

describe('privacyScrub', () => {
  it('scrubs emails, ips, urls, jwts, and includes a warning', () => {
    const input =
      'email me at a@b.com or http://x.com from 1.2.3.4 with eyJhbGci.x.y';
    const result = privacyScrub(input);
    expect(result.text).not.toContain('a@b.com');
    expect(result.text).not.toContain('http://x.com');
    expect(result.text).toContain('[IP]');
    expect(result.warnings.length).toBeGreaterThan(0);
  });
  it('can target only specific patterns', () => {
    const result = privacyScrub('a@b.com 1.2.3.4', ['email']);
    expect(result.text).toContain('1.2.3.4');
    expect(result.text).not.toContain('a@b.com');
  });
});
