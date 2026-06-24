/**
 * @fileoverview Registry entries for the text.* tools.
 */

import { type TextaviaToolDefinition, requireText } from '@textavia/core';
import { z } from 'zod';
import {
  toInverseCase,
  toLower,
  toSentenceCase,
  toTitleCase,
  toUpper,
} from '../transforms/case.js';
import {
  PRIVACY_PATTERN_IDS,
  cleanText,
  computeStats,
  countSyllables,
  privacyScrub,
  removeFormatting,
  replaceAll,
  reverseText,
  toPlainText,
  wordFrequency,
} from '../transforms/text.js';
import { WEB_BASE, jsonResult, textResult } from './common.js';

const ReplaceOptions = z.object({
  search: z.string().min(1).describe('Substring to find'),
  replacement: z.string().describe('Replacement string'),
});

const PrivacyOptions = z.object({
  only: z
    .array(z.enum(PRIVACY_PATTERN_IDS as [string, ...string[]]))
    .optional()
    .describe('Restrict scrubbing to these pattern ids'),
});

export const textTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'text.lower',
    name: 'Lowercase text',
    aliases: [],
    category: 'text',
    summary: 'Lowercase text.',
    description:
      'Lowercases all characters. Supports stdin, positional text, and files.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/lowercase`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Lowercase',
        command: 'txv text lower "HeLLo"',
        output: 'hello',
      },
    ],
    stability: 'stable',
    streaming: true,
    execute: (input) => textResult(toLower(requireText(input))),
  },
  {
    id: 'text.upper',
    name: 'Uppercase text',
    aliases: [],
    category: 'text',
    summary: 'Uppercase text.',
    description: 'Uppercases all characters.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/uppercase`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Uppercase',
        command: 'txv text upper "hello"',
        output: 'HELLO',
      },
    ],
    stability: 'stable',
    streaming: true,
    execute: (input) => textResult(toUpper(requireText(input))),
  },
  {
    id: 'text.inverse-case',
    name: 'Inverse case',
    aliases: ['invert-case'],
    category: 'text',
    summary: 'Invert the case of every letter.',
    description: 'Swaps uppercase and lowercase letters.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/inverse-case`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Inverse case',
        command: 'txv text inverse-case "aBcD"',
        output: 'AbCd',
      },
    ],
    stability: 'stable',
    streaming: true,
    execute: (input) => textResult(toInverseCase(requireText(input))),
  },
  {
    id: 'text.sentence-case',
    name: 'Sentence case',
    aliases: [],
    category: 'text',
    summary: 'Capitalize the first character only.',
    description: 'Capitalizes the first character and lowercases the rest.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/sentence-case`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Sentence case',
        command: 'txv text sentence-case "hello world"',
        output: 'Hello world',
      },
    ],
    stability: 'stable',
    streaming: true,
    execute: (input) => textResult(toSentenceCase(requireText(input))),
  },
  {
    id: 'text.title-case',
    name: 'Title case',
    aliases: [],
    category: 'text',
    summary: 'Capitalize the first letter of each word.',
    description: 'Title-cases the text.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/title-case`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Title case',
        command: 'txv text title-case "hello world"',
        output: 'Hello World',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(toTitleCase(requireText(input))),
  },
  {
    id: 'text.reverse',
    name: 'Reverse text',
    aliases: ['reverse'],
    category: 'text',
    summary: 'Reverse text by grapheme cluster.',
    description:
      'Reverses text by grapheme cluster so emoji and combining marks are preserved.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/reverse-text`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Reverse',
        command: 'txv text reverse "abc 😀"',
        output: '😀 cba',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(reverseText(requireText(input))),
  },
  {
    id: 'text.clean',
    name: 'Clean text',
    aliases: ['clean'],
    category: 'text',
    summary: 'Collapse whitespace and trim.',
    description:
      'Collapses runs of whitespace into single spaces and trims the result.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/clean-text`,
    optionsSchema: z.object({}),
    examples: [
      { title: 'Clean', command: 'txv text clean "  a   b  "', output: 'a b' },
    ],
    stability: 'stable',
    streaming: true,
    execute: (input) => textResult(cleanText(requireText(input))),
  },
  {
    id: 'text.plain',
    name: 'Plain text',
    aliases: [],
    category: 'text',
    summary: 'Strip HTML/XML tags to plain text.',
    description: 'Removes markup tags and collapses whitespace.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/html-to-text`,
    optionsSchema: z.object({}),
    examples: [
      { title: 'Plain', command: 'txv text plain "<p>Hi</p>"', output: 'Hi' },
    ],
    stability: 'stable',
    execute: (input) => textResult(toPlainText(requireText(input))),
  },
  {
    id: 'text.remove-formatting',
    name: 'Remove formatting',
    aliases: ['text strip-formatting', 'strip-formatting'],
    category: 'text',
    summary: 'Remove zero-width and control characters.',
    description:
      'Removes zero-width characters, BOM, and non-printable control characters.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/remove-formatting`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Remove formatting',
        command: 'txv text remove-formatting "a\\u200Bb"',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(removeFormatting(requireText(input))),
  },
  {
    id: 'text.replace',
    name: 'Replace text',
    aliases: ['replace'],
    category: 'text',
    summary: 'Replace all occurrences of a substring.',
    description: 'Replaces every occurrence of --search with --replacement.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/find-and-replace`,
    optionsSchema: ReplaceOptions,
    examples: [
      {
        title: 'Replace',
        command: 'txv text replace "banana" --search a --replacement o',
        output: 'bonono',
      },
    ],
    stability: 'stable',
    streaming: true,
    execute: (input, options) => {
      const opts = ReplaceOptions.parse(options);
      return textResult(
        replaceAll(requireText(input), opts.search, opts.replacement),
      );
    },
  },
  {
    id: 'text.stats',
    name: 'Text statistics',
    aliases: ['stats', 'count'],
    category: 'text',
    summary: 'Report character, word, line, and sentence counts.',
    description: 'Computes counts and byte size for the input text.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/word-count`,
    optionsSchema: z.object({}),
    examples: [{ title: 'Stats', command: 'txv text stats "Hello world"' }],
    stability: 'stable',
    fullFile: true,
    execute: (input) => jsonResult(computeStats(requireText(input))),
  },
  {
    id: 'text.frequency',
    name: 'Word frequency',
    aliases: ['frequency', 'word-frequency', 'text word-frequency'],
    category: 'text',
    summary: 'Count occurrences of each word.',
    description: 'Produces a case-insensitive word frequency map.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/word-frequency`,
    optionsSchema: z.object({}),
    examples: [
      { title: 'Frequency', command: 'txv text frequency "the the the"' },
    ],
    stability: 'stable',
    fullFile: true,
    execute: (input) => jsonResult(wordFrequency(requireText(input))),
  },
  {
    id: 'text.syllables',
    name: 'Syllable count',
    aliases: ['syllables', 'syllable-count', 'text syllable-count'],
    category: 'text',
    summary: 'Estimate syllables in a word.',
    description: 'Estimates syllable count using a heuristic vowel-group rule.',
    inputKind: ['text'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/syllable-counter`,
    optionsSchema: z.object({}),
    examples: [{ title: 'Syllables', command: 'txv text syllables "hello"' }],
    stability: 'stable',
    execute: (input) =>
      jsonResult({
        word: requireText(input),
        syllables: countSyllables(requireText(input)),
      }),
  },
  {
    id: 'text.privacy-scrub',
    name: 'Privacy scrub',
    aliases: ['privacy-scrub', 'scrub'],
    category: 'text',
    summary: 'Redact likely-sensitive substrings.',
    description:
      'Replaces emails, phone numbers, IPs, URLs, JWTs, basic auth, common API keys, and credit-card-like numbers with placeholders. Heuristic; review output before sharing.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/data-privacy`,
    optionsSchema: PrivacyOptions,
    examples: [
      {
        title: 'Scrub',
        command: 'txv text privacy-scrub "email a@b.com from 1.2.3.4"',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = PrivacyOptions.parse(options);
      const result = privacyScrub(requireText(input), opts.only);
      return textResult(result.text, { warnings: result.warnings });
    },
  },
];
