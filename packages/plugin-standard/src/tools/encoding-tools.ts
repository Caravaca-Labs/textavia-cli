/**
 * @fileoverview Registry entries for encoding tools: Base64 and URL.
 *
 * Base64 handles text, bytes, and file input byte-safely.
 */

import { gunzipSync } from 'node:zlib';
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

function normalizeBase64Value(input: string): string {
  const cleaned = input
    .trim()
    .replace(/\s+/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padding = cleaned.length % 4 === 0 ? 0 : 4 - (cleaned.length % 4);
  return `${cleaned}${'='.repeat(padding)}`;
}

function base64LooksValid(input: string): boolean {
  return isValidBase64(normalizeBase64Value(input));
}

function gzipCheck(input: string): {
  readonly gzipped: boolean;
  readonly decodedBytes: number;
  readonly uncompressedBytes?: number;
} {
  const decoded = decodeBase64ToBytes(normalizeBase64Value(input));
  const gzipped = decoded[0] === 0x1f && decoded[1] === 0x8b;
  if (!gzipped) {
    return { gzipped, decodedBytes: decoded.byteLength };
  }
  try {
    const uncompressed = gunzipSync(Buffer.from(decoded));
    return {
      gzipped,
      decodedBytes: decoded.byteLength,
      uncompressedBytes: uncompressed.byteLength,
    };
  } catch {
    return { gzipped, decodedBytes: decoded.byteLength };
  }
}

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

/** Additional Base64 diagnostics and repair tools. */
export const base64FutureTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'encoding.base64.normalize',
    name: 'Base64 normalize',
    aliases: ['base64 normalize'],
    category: 'encoding',
    summary: 'Normalize a Base64 string (whitespace and padding).',
    description:
      'Normalizes whitespace, URL-safe alphabet variants, and padding.',
    inputKind: ['text'],
    outputKind: ['text'],
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Normalize Base64',
        command: 'txv base64 normalize "SGV sbG8"',
        output: 'SGVsbG8=',
      },
    ],
    stability: 'stable',
    webUrl: `${WEB_BASE}/base64-normalize`,
    execute: (input) => textResult(normalizeBase64Value(requireText(input))),
  },
  {
    id: 'encoding.base64.repair',
    name: 'Base64 repair',
    aliases: ['base64 repair'],
    category: 'encoding',
    summary: 'Attempt to repair a malformed Base64 string.',
    description:
      'Repairs common copy/paste issues such as whitespace, missing padding, and URL-safe alphabet characters.',
    inputKind: ['text'],
    outputKind: ['text'],
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Repair Base64',
        command: 'txv base64 repair "SGVsbG8"',
        output: 'SGVsbG8=',
      },
    ],
    stability: 'stable',
    webUrl: `${WEB_BASE}/base64-repair`,
    execute: (input) => textResult(normalizeBase64Value(requireText(input))),
  },
  {
    id: 'encoding.base64.detect',
    name: 'Base64 detect',
    aliases: ['base64 detect'],
    category: 'encoding',
    summary: 'Detect whether text is likely Base64.',
    description:
      'Uses a conservative local heuristic to detect Base64-looking text.',
    inputKind: ['text'],
    outputKind: ['json'],
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Detect Base64',
        command: 'txv base64 detect SGVsbG8= --json',
      },
    ],
    stability: 'stable',
    webUrl: `${WEB_BASE}/base64-detect`,
    execute: (input) => {
      const text = requireText(input);
      return jsonResult({
        likelyBase64: text.trim().length >= 8 && base64LooksValid(text),
        normalized: normalizeBase64Value(text),
      });
    },
  },
  {
    id: 'encoding.base64.gzip-check',
    name: 'Base64 gzip check',
    aliases: ['base64 gzip-check'],
    category: 'encoding',
    summary: 'Check whether Base64 content is gzipped.',
    description: 'Decodes Base64 locally and checks for a gzip payload.',
    inputKind: ['text'],
    outputKind: ['json'],
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Gzip check',
        command: 'txv base64 gzip-check H4sI --json',
      },
    ],
    stability: 'stable',
    webUrl: `${WEB_BASE}/base64-gzip-check`,
    execute: (input) => jsonResult(gzipCheck(requireText(input))),
  },
];
