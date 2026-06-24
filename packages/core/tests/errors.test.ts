import { describe, expect, it } from 'vitest';
import {
  EXIT_CODES,
  FileIoError,
  InterruptedError,
  NetworkRequiredError,
  ParseError,
  PluginMissingError,
  TransformError,
  UnsafeBlockedError,
  UsageError,
  ValidationError,
  exitCodeForError,
  isTextaviaError,
  toStructuredError,
} from '../src/index.js';

describe('exit code mapping', () => {
  const cases: Array<{
    error: InstanceType<typeof UsageError>;
    expected: number;
  }> = [
    { error: new UsageError('u'), expected: EXIT_CODES.USAGE_OR_VALIDATION },
    {
      error: new ValidationError('v'),
      expected: EXIT_CODES.USAGE_OR_VALIDATION,
    },
    { error: new FileIoError('f'), expected: EXIT_CODES.FILE_IO },
    { error: new ParseError('p'), expected: EXIT_CODES.PARSE },
    { error: new TransformError('t'), expected: EXIT_CODES.TRANSFORM },
    {
      error: new NetworkRequiredError('n'),
      expected: EXIT_CODES.NETWORK_REQUIRED,
    },
    {
      error: new UnsafeBlockedError('ub'),
      expected: EXIT_CODES.UNSAFE_BLOCKED,
    },
    { error: new InterruptedError(), expected: EXIT_CODES.INTERRUPTED },
  ];

  it.each(cases)('maps $error.code to $expected', ({ error, expected }) => {
    expect(exitCodeForError(error)).toBe(expected);
  });

  it('maps PLUGIN_MISSING to exit code 7 with install hint', () => {
    const error = new PluginMissingError('missing', {
      plugin: '@textavia/plugin-formatters',
      install: 'pnpm add @textavia/plugin-formatters',
    });
    expect(exitCodeForError(error)).toBe(EXIT_CODES.PLUGIN_MISSING);
  });
});

describe('toStructuredError', () => {
  it('serializes a PluginMissingError including plugin and install fields', () => {
    const error = new PluginMissingError('missing', {
      plugin: '@textavia/plugin-formatters',
      install: 'pnpm add @textavia/plugin-formatters',
      hint: 'Install the plugin to enable formatting.',
    });
    expect(toStructuredError(error)).toEqual({
      code: 'PLUGIN_MISSING',
      message: 'missing',
      hint: 'Install the plugin to enable formatting.',
      plugin: '@textavia/plugin-formatters',
      install: 'pnpm add @textavia/plugin-formatters',
    });
  });

  it('serializes details from a ParseError', () => {
    const error = new ParseError('bad json', { details: { line: 3 } });
    expect(toStructuredError(error).details).toEqual({ line: 3 });
  });

  it('wraps unknown thrown values as TRANSFORM_ERROR', () => {
    expect(toStructuredError('boom')).toEqual({
      code: 'TRANSFORM_ERROR',
      message: 'boom',
    });
    expect(toStructuredError(new Error('nope')).message).toBe('nope');
  });
});

describe('isTextaviaError', () => {
  it('recognizes Textavia errors and rejects plain errors', () => {
    expect(isTextaviaError(new UsageError('x'))).toBe(true);
    expect(isTextaviaError(new Error('x'))).toBe(false);
    expect(isTextaviaError('x')).toBe(false);
  });
});
