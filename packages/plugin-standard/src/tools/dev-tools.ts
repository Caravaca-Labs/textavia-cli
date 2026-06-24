/**
 * @fileoverview Registry entries for developer tools: JSON format/minify/validate
 * and hash algorithms. Hash supports streaming file input.
 */

import {
  type ResolvedInput,
  type TextaviaToolDefinition,
  requireText,
} from '@textavia/core';
import {
  type HashAlgorithm,
  hashStream,
  hashValue,
} from '@textavia/node-adapters';
import { z } from 'zod';
import { formatJson, minifyJson, validateJson } from '../transforms/json.js';
import { WEB_BASE, jsonResult, textResult } from './common.js';

const JsonFormatOptions = z.object({
  indent: z
    .number()
    .int()
    .min(0)
    .max(8)
    .optional()
    .describe('Indentation width (default 2)'),
});

const ALGORITHMS: readonly { algorithm: HashAlgorithm; webSlug: string }[] = [
  { algorithm: 'md5', webSlug: 'md5-hash' },
  { algorithm: 'sha1', webSlug: 'sha1-hash' },
  { algorithm: 'sha224', webSlug: 'sha224-hash' },
  { algorithm: 'sha256', webSlug: 'sha256-hash' },
  { algorithm: 'sha384', webSlug: 'sha384-hash' },
  { algorithm: 'sha512', webSlug: 'sha512-hash' },
];

export const jsonTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'dev.json.format',
    name: 'Format JSON',
    aliases: ['json-format', 'pretty-json', 'format json'],
    category: 'dev',
    summary: 'Pretty-print JSON.',
    description:
      'Parses and reformats JSON with configurable indentation. Supports --write and --backup.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/json-formatter`,
    optionsSchema: JsonFormatOptions,
    examples: [
      {
        title: 'Format',
        command: 'txv json format \'{"a":1}\'',
        output: '{\n  "a": 1\n}',
      },
      {
        title: 'Format a file in place',
        command: 'txv json format package.json --write --backup',
      },
    ],
    stability: 'stable',
    fullFile: true,
    requiresFilesystem: false,
    execute: (input, options) => {
      const opts = JsonFormatOptions.parse(options);
      return textResult(formatJson(requireText(input), opts.indent ?? 2));
    },
  },
  {
    id: 'dev.json.minify',
    name: 'Minify JSON',
    aliases: ['json-minify', 'minify-json'],
    category: 'dev',
    summary: 'Minify JSON.',
    description: 'Parses and re-emits compact JSON with no whitespace.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/json-minify`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Minify',
        command: 'txv json minify \'{"a": 1}\'',
        output: '{"a":1}',
      },
    ],
    stability: 'stable',
    fullFile: true,
    execute: (input) => textResult(minifyJson(requireText(input))),
  },
  {
    id: 'dev.json.validate',
    name: 'Validate JSON',
    aliases: ['json-validate', 'validate-json'],
    category: 'dev',
    summary: 'Validate JSON and report diagnostics.',
    description:
      'Reports whether JSON is valid and includes parse diagnostics on failure.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/json-validator`,
    optionsSchema: z.object({}),
    examples: [{ title: 'Validate', command: 'txv json validate \'{"a":1}\'' }],
    stability: 'stable',
    fullFile: true,
    execute: (input) => jsonResult(validateJson(requireText(input))),
  },
];

/** All hash tool definitions (md5, sha1, sha256, sha512). */
export const hashTools: readonly TextaviaToolDefinition[] = ALGORITHMS.map(
  ({ algorithm, webSlug }) => ({
    id: `dev.hash.${algorithm}`,
    name: `${algorithm.toUpperCase()} hash`,
    aliases: [algorithm],
    category: 'dev',
    summary: `Compute the ${algorithm.toUpperCase()} digest.`,
    description: `Hashes text, stdin, or a streaming file to a ${algorithm.toUpperCase()} hex digest.`,
    inputKind: ['text', 'bytes', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/${webSlug}`,
    optionsSchema: z.object({
      encoding: z
        .enum(['hex', 'base64'])
        .optional()
        .describe('Digest encoding (default hex)'),
    }),
    examples: [
      {
        title: 'Hash text',
        command: `txv hash ${algorithm} "abc"`,
        output: hashValue(algorithm, 'abc'),
      },
      { title: 'Hash a file', command: `txv hash ${algorithm} --file big.bin` },
    ],
    stability: 'stable',
    streaming: true,
    execute: async (input, options) => {
      const opts = z
        .object({ encoding: z.enum(['hex', 'base64']).optional() })
        .parse(options);
      return textResult(
        await hashInputWithEncoding(input, algorithm, opts.encoding ?? 'hex'),
        {
          meta: { encoding: opts.encoding ?? 'hex' },
        },
      );
    },
  }),
);

async function hashInputWithEncoding(
  input: ResolvedInput,
  algorithm: HashAlgorithm,
  encoding: 'hex' | 'base64',
): Promise<string> {
  if (input.byteStream !== undefined) {
    return hashStream(algorithm, input.byteStream, encoding);
  }
  if (input.bytes !== undefined) {
    return hashValue(algorithm, input.bytes, encoding);
  }
  return hashValue(algorithm, requireText(input), encoding);
}
