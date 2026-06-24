/**
 * @fileoverview Registry entries for the unicode.* tools.
 */

import { type TextaviaToolDefinition, requireText } from '@textavia/core';
import { z } from 'zod';
import {
  type NormalizationForm,
  inspectCodePoints,
  normalize,
} from '../transforms/unicode.js';
import { WEB_BASE, jsonResult, textResult } from './common.js';

const NormalizeOptions = z.object({
  form: z.enum(['NFC', 'NFD', 'NFKC', 'NFKD']).describe('Normalization form'),
});

export const unicodeTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'unicode.normalize',
    name: 'Unicode normalize',
    aliases: ['normalize'],
    category: 'unicode',
    summary: 'Normalize Unicode text.',
    description: 'Normalizes text to NFC, NFD, NFKC, or NFKD.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/unicode-normalizer`,
    optionsSchema: NormalizeOptions,
    examples: [
      { title: 'Normalize', command: 'txv unicode.normalize "é" --form NFC' },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = NormalizeOptions.parse(options);
      return textResult(
        normalize(requireText(input), opts.form as NormalizationForm),
      );
    },
  },
  {
    id: 'unicode.inspect',
    name: 'Unicode inspect',
    aliases: ['inspect'],
    category: 'unicode',
    summary: 'Inspect code points in text.',
    description:
      'Reports each code point with its value, hex, name, and combining status.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/unicode-info`,
    optionsSchema: z.object({}),
    examples: [{ title: 'Inspect', command: 'txv unicode.inspect "A😀"' }],
    stability: 'stable',
    execute: (input) => jsonResult(inspectCodePoints(requireText(input))),
  },
];
