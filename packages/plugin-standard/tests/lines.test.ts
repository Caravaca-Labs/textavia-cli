import { describe, expect, it } from 'vitest';
import {
  compareLines,
  countLines,
  duplicateLines,
  removeEmptyLines,
  sortLines,
  splitLines,
  trimLines,
  uniqueLines,
} from '../src/transforms/lines.js';

describe('splitLines', () => {
  it('drops a trailing empty line from a trailing newline', () => {
    expect(splitLines('a\nb\n')).toEqual(['a', 'b']);
    expect(splitLines('a\nb')).toEqual(['a', 'b']);
    expect(splitLines('')).toEqual([]);
  });
});

describe('trim and remove-empty', () => {
  it('trims each line', () => {
    expect(trimLines([' a ', 'b', '  '])).toEqual(['a', 'b', '']);
  });
  it('removes empty lines', () => {
    expect(removeEmptyLines(['a', '', '  ', 'b'])).toEqual(['a', 'b']);
  });
});

describe('unique and duplicates', () => {
  it('removes duplicates preserving order', () => {
    expect(uniqueLines(['b', 'a', 'b', 'c', 'a'])).toEqual(['b', 'a', 'c']);
  });
  it('reports duplicates once', () => {
    expect(duplicateLines(['a', 'b', 'a', 'c', 'b', 'b'])).toEqual(['a', 'b']);
  });
});

describe('sortLines', () => {
  it('sorts ascending by default', () => {
    expect(sortLines(['c', 'a', 'b'])).toEqual(['a', 'b', 'c']);
  });
  it('sorts descending', () => {
    expect(sortLines(['a', 'c', 'b'], { direction: 'desc' })).toEqual([
      'c',
      'b',
      'a',
    ]);
  });
  it('sorts numerically', () => {
    expect(sortLines(['10', '2', '1'], { numeric: true })).toEqual([
      '1',
      '2',
      '10',
    ]);
  });
  it('sorts case-insensitively', () => {
    expect(
      sortLines(['Banana', 'apple', 'cherry'], { caseInsensitive: true }),
    ).toEqual(['apple', 'Banana', 'cherry']);
  });
  it('can sort and dedupe in one pass', () => {
    expect(sortLines(['b', 'a', 'b'], { unique: true })).toEqual(['a', 'b']);
  });
});

describe('count and compare', () => {
  it('counts lines', () => {
    expect(countLines(['a', 'b', 'c'])).toBe(3);
  });
  it('compares two lists', () => {
    const result = compareLines(['a', 'b', 'c'], ['b', 'c', 'd']);
    expect(result.onlyInA).toEqual(['a']);
    expect(result.onlyInB).toEqual(['d']);
    expect(result.common).toEqual(['b', 'c']);
  });
});
