import { describe, expect, it } from 'vitest';
import {
  convertCase,
  toAlternating,
  toCamelCase,
  toDotCase,
  toInverseCase,
  toKebabCase,
  toPascalCase,
  toScreamingSnakeCase,
  toSentenceCase,
  toSlug,
  toSnakeCase,
  toTitleCase,
} from '../src/transforms/case.js';

describe('convertCase', () => {
  it('lowercases and uppercases', () => {
    expect(convertCase('lower', 'HeLLo')).toBe('hello');
    expect(convertCase('upper', 'HeLLo')).toBe('HELLO');
  });

  it('sentence and title case', () => {
    expect(convertCase('sentence', 'hello world')).toBe('Hello world');
    expect(convertCase('title', 'hello world')).toBe('Hello World');
  });

  it('capitalized only changes the first character', () => {
    expect(convertCase('capitalized', 'heLLo')).toBe('HeLLo');
  });

  it('alternating and inverse', () => {
    expect(convertCase('alternating', 'abc')).toBe('AbC');
    expect(convertCase('inverse', 'aBcD')).toBe('AbCd');
  });

  it('converts camelCase and PascalCase from various inputs', () => {
    expect(toCamelCase('Hello World')).toBe('helloWorld');
    expect(toCamelCase('snake_case_example')).toBe('snakeCaseExample');
    expect(toCamelCase('PascalCase')).toBe('pascalCase');
    expect(toPascalCase('hello world')).toBe('HelloWorld');
  });

  it('splits acronym groups correctly (HTTPRequest)', () => {
    expect(toKebabCase('HTTPRequest')).toBe('http-request');
    expect(toCamelCase('HTTPRequest')).toBe('httpRequest');
  });

  it('snake, screaming-snake, kebab, dot', () => {
    expect(toSnakeCase('Hello World')).toBe('hello_world');
    expect(toScreamingSnakeCase('hello world')).toBe('HELLO_WORLD');
    expect(toKebabCase('Hello World')).toBe('hello-world');
    expect(toDotCase('Hello World')).toBe('hello.world');
  });

  it('slug uses a configurable separator', () => {
    expect(toSlug('Hello World')).toBe('hello-world');
    expect(toSlug('Hello World', '_')).toBe('hello_world');
  });

  it('throws for unknown modes', () => {
    expect(() => convertCase('unknown' as never, 'x')).toThrowError();
  });

  it('toAlternating is pure', () => {
    expect(toAlternating('hello')).toBe('HeLlO');
  });
});
