/**
 * @fileoverview Registry entries for encoding tools: Base64 and URL.
 *
 * Base64 handles text, bytes, and file input byte-safely. Metadata placeholders
 * for normalize, repair, detect, and gzip-check are registered as future tools.
 */

import {
  type ResolvedInput,
  type TextaviaToolDefinition,
  requireText,
} from '@textavia/core';
import { z } from 'zod';
import {
  decodeBase64ToBytes,
  decodeBase64ToText,
  encodeBase64Bytes,
  encodeBase64Text,
  fromDataUrl,
  isValidBase64,
  toDataUrl,
} from '../transforms/encoding.js';
import {
  decodeUrl,
  decodeUrlComponent,
  encodeUrl,
  encodeUrlComponent,
} from '../transforms/url.js';
import { WEB_BASE, jsonResult, textResult } from './common.js';

function inputBytesOrText(input: ResolvedInput): {
  bytes?: Uint8Array;
  text?: string;
} {
  if (input.bytes !== undefined) {
    return { bytes: input.bytes };
  }
  return { text: requireText(input) };
}

const Base64DecodeOptions = z.object({
  bytes: z
    .boolean()
    .optional()
    .describe('Decode to raw bytes (use with --out for binary output)'),
});

export const encodingTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'encoding.base64.encode',
    name: 'Base64 encode',
    aliases: ['b64encode', 'base64-encode'],
    category: 'encoding',
    summary: 'Encode text or bytes to Base64.',
    description:
      'Encodes UTF-8 text or raw bytes to a Base64 string. File input is read as bytes.',
    inputKind: ['text', 'bytes', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/base64-encode`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Encode text',
        command: 'txv base64.encode "Hello"',
        output: 'SGVsbG8=',
      },
      { title: 'Encode a file', command: 'txv base64.encode --file image.png' },
    ],
    stability: 'stable',
    execute: (input) => {
      const { bytes, text } = inputBytesOrText(input);
      return textResult(
        bytes !== undefined
          ? encodeBase64Bytes(bytes)
          : encodeBase64Text(text ?? ''),
      );
    },
  },
  {
    id: 'encoding.base64.decode',
    name: 'Base64 decode',
    aliases: ['b64decode', 'base64-decode'],
    category: 'encoding',
    summary: 'Decode Base64 to text or bytes.',
    description:
      'Decodes a Base64 string to UTF-8 text by default, or raw bytes with --bytes.',
    inputKind: ['text', 'file'],
    outputKind: ['text', 'bytes'],
    webUrl: `${WEB_BASE}/base64-decode`,
    optionsSchema: Base64DecodeOptions,
    examples: [
      {
        title: 'Decode to text',
        command: 'txv base64.decode "SGVsbG8="',
        output: 'Hello',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = Base64DecodeOptions.parse(options);
      const encoded = requireText(input);
      if (opts.bytes === true) {
        return {
          output: decodeBase64ToBytes(encoded),
          outputKind: 'bytes' as const,
        };
      }
      return textResult(decodeBase64ToText(encoded));
    },
  },
  {
    id: 'encoding.base64.validate',
    name: 'Base64 validate',
    aliases: ['base64-validate'],
    category: 'encoding',
    summary: 'Check whether text is valid Base64.',
    description: 'Reports whether the input is well-formed Base64.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/base64-validate`,
    optionsSchema: z.object({}),
    examples: [
      { title: 'Validate', command: 'txv base64.validate "SGVsbG8="' },
    ],
    stability: 'stable',
    execute: (input) =>
      jsonResult({ valid: isValidBase64(requireText(input)) }),
  },
  {
    id: 'encoding.base64.data-url',
    name: 'Base64 data URL',
    aliases: ['data-url'],
    category: 'encoding',
    summary: 'Convert between bytes and a Base64 data URL.',
    description:
      'Encodes bytes to a data URL or decodes a data URL to bytes (use --decode).',
    inputKind: ['text', 'bytes', 'file'],
    outputKind: ['text', 'bytes'],
    webUrl: `${WEB_BASE}/base64-data-url`,
    optionsSchema: z.object({
      mimeType: z.string().min(1).optional(),
      decode: z.boolean().optional().describe('Decode a data URL to bytes'),
    }),
    examples: [
      {
        title: 'Data URL',
        command: 'txv data-url --file logo.png --mimeType image/png',
      },
    ],
    stability: 'experimental',
    execute: (input, options) => {
      const opts = z
        .object({
          mimeType: z.string().min(1).optional(),
          decode: z.boolean().optional().describe('Decode a data URL to bytes'),
        })
        .parse(options);
      if (opts.decode === true) {
        const { bytes, mimeType } = fromDataUrl(requireText(input));
        return { output: { mimeType, bytes }, outputKind: 'json' as const };
      }
      const { bytes, text } = inputBytesOrText(input);
      const source = bytes ?? Buffer.from(text ?? '', 'utf8');
      return textResult(
        toDataUrl(source, opts.mimeType ?? 'application/octet-stream'),
      );
    },
  },
  {
    id: 'encoding.url.encode',
    name: 'URL encode',
    aliases: ['urlencode', 'url-encode'],
    category: 'encoding',
    summary: 'URL-encode text.',
    description: 'Encodes text for use in a URL component or full URL.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/url-encode`,
    optionsSchema: z.object({
      full: z
        .boolean()
        .optional()
        .describe('Encode as a full URL, preserving separators'),
    }),
    examples: [
      {
        title: 'URL encode',
        command: 'txv url.encode "a b&c"',
        output: 'a%20b%26c',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = z.object({ full: z.boolean().optional() }).parse(options);
      return textResult(
        opts.full === true
          ? encodeUrl(requireText(input))
          : encodeUrlComponent(requireText(input)),
      );
    },
  },
  {
    id: 'encoding.url.decode',
    name: 'URL decode',
    aliases: ['urldecode', 'url-decode'],
    category: 'encoding',
    summary: 'URL-decode text.',
    description: 'Decodes a URL-encoded component or full URL.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/url-decode`,
    optionsSchema: z.object({
      full: z.boolean().optional().describe('Decode as a full URL'),
    }),
    examples: [
      { title: 'URL decode', command: 'txv url.decode "a%20b"', output: 'a b' },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = z.object({ full: z.boolean().optional() }).parse(options);
      return textResult(
        opts.full === true
          ? decodeUrl(requireText(input))
          : decodeUrlComponent(requireText(input)),
      );
    },
  },
];

/** Metadata-only future placeholders for Base64 operations not yet implemented. */
export const base64FutureTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'encoding.base64.normalize',
    name: 'Base64 normalize',
    aliases: [],
    category: 'encoding',
    summary: 'Normalize a Base64 string (whitespace and padding).',
    description:
      'Future tool: normalizes whitespace and padding in a Base64 string.',
    inputKind: ['text'],
    outputKind: ['text'],
    optionsSchema: z.object({}),
    examples: [],
    stability: 'future',
    webUrl: `${WEB_BASE}/base64-normalize`,
  },
  {
    id: 'encoding.base64.repair',
    name: 'Base64 repair',
    aliases: [],
    category: 'encoding',
    summary: 'Attempt to repair a malformed Base64 string.',
    description: 'Future tool: repairs common Base64 formatting errors.',
    inputKind: ['text'],
    outputKind: ['text'],
    optionsSchema: z.object({}),
    examples: [],
    stability: 'future',
    webUrl: `${WEB_BASE}/base64-repair`,
  },
  {
    id: 'encoding.base64.detect',
    name: 'Base64 detect',
    aliases: [],
    category: 'encoding',
    summary: 'Detect whether text is likely Base64.',
    description: 'Future tool: heuristic detection of Base64 content.',
    inputKind: ['text'],
    outputKind: ['json'],
    optionsSchema: z.object({}),
    examples: [],
    stability: 'future',
    webUrl: `${WEB_BASE}/base64-detect`,
  },
  {
    id: 'encoding.base64.gzip-check',
    name: 'Base64 gzip check',
    aliases: [],
    category: 'encoding',
    summary: 'Check whether Base64 content is gzipped.',
    description: 'Future tool: detects gzip-compressed Base64 payloads.',
    inputKind: ['text'],
    outputKind: ['json'],
    optionsSchema: z.object({}),
    examples: [],
    stability: 'future',
    webUrl: `${WEB_BASE}/base64-gzip-check`,
  },
];
