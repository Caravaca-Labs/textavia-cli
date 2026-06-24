import { describe, expect, it } from 'vitest';
import { parseArgs } from '../src/argv.js';

describe('parseArgs', () => {
  it('separates globals, positionals, and tool options', () => {
    const parsed = parseArgs([
      'case',
      'slug',
      'Hello World',
      '--json',
      '--separator',
      '_',
    ]);
    expect(parsed.positionals).toEqual(['case', 'slug', 'Hello World']);
    expect(parsed.globals.json).toBe(true);
    expect(parsed.toolOptions).toEqual({ separator: '_' });
  });

  it('parses --opt=value inline options', () => {
    const parsed = parseArgs(['--input=hi', '--search=a']);
    expect(parsed.globals.input).toBe('hi');
    expect(parsed.toolOptions.search).toBe('a');
  });

  it('treats a value option consuming a flag as an error', () => {
    expect(() => parseArgs(['--input', '--json'])).toThrowError(
      /requires a value/,
    );
  });

  it('treats unknown boolean options as booleans when followed by a flag', () => {
    const parsed = parseArgs(['--bytes', '--json']);
    expect(parsed.toolOptions.bytes).toBe(true);
    expect(parsed.globals.json).toBe(true);
  });

  it('stops option parsing after --', () => {
    const parsed = parseArgs(['--', '--not-a-flag', 'text']);
    expect(parsed.positionals).toEqual(['--not-a-flag', 'text']);
  });

  it('preserves positional order and collects file/value globals', () => {
    const parsed = parseArgs([
      'json',
      'format',
      'package.json',
      '--file',
      'a.json',
      '--write',
    ]);
    expect(parsed.positionals).toEqual(['json', 'format', 'package.json']);
    expect(parsed.globals.file).toBe('a.json');
    expect(parsed.globals.write).toBe(true);
  });

  it('input is the highest-priority positional source', () => {
    const parsed = parseArgs(['--input', 'from flag', 'positional']);
    expect(parsed.globals.input).toBe('from flag');
    expect(parsed.positionals).toEqual(['positional']);
  });
});
