/**
 * @fileoverview Registry entries for the case.* tools.
 *
 * One canonical tool per case mode so `txv case <mode>` routes through the
 * registry and aliases remain flexible.
 */

import { type TextaviaToolDefinition, requireText } from '@textavia/core';
import { z } from 'zod';
import { type CaseMode, convertCase } from '../transforms/case.js';
import { WEB_BASE, textResult } from './common.js';

interface CaseModeMeta {
  readonly mode: CaseMode;
  readonly name: string;
  readonly summary: string;
  readonly example: string;
}

const CASE_MODE_META: readonly CaseModeMeta[] = [
  {
    mode: 'lower',
    name: 'Lowercase',
    summary: 'Convert text to lowercase.',
    example: 'Hello World',
  },
  {
    mode: 'upper',
    name: 'Uppercase',
    summary: 'Convert text to uppercase.',
    example: 'Hello World',
  },
  {
    mode: 'sentence',
    name: 'Sentence case',
    summary: 'Capitalize the first character only.',
    example: 'hello world',
  },
  {
    mode: 'title',
    name: 'Title case',
    summary: 'Capitalize the first letter of each word.',
    example: 'hello world',
  },
  {
    mode: 'capitalized',
    name: 'Capitalized',
    summary: 'Capitalize the first character, keep the rest.',
    example: 'heLLo',
  },
  {
    mode: 'alternating',
    name: 'Alternating case',
    summary: 'Alternate letter case.',
    example: 'hello',
  },
  {
    mode: 'inverse',
    name: 'Inverse case',
    summary: 'Invert the case of every letter.',
    example: 'aBcD',
  },
  {
    mode: 'camel',
    name: 'camelCase',
    summary: 'Convert to camelCase.',
    example: 'Hello World',
  },
  {
    mode: 'pascal',
    name: 'PascalCase',
    summary: 'Convert to PascalCase.',
    example: 'hello world',
  },
  {
    mode: 'snake',
    name: 'snake_case',
    summary: 'Convert to snake_case.',
    example: 'Hello World',
  },
  {
    mode: 'screaming-snake',
    name: 'SCREAMING_SNAKE',
    summary: 'Convert to SCREAMING_SNAKE_CASE.',
    example: 'hello world',
  },
  {
    mode: 'kebab',
    name: 'kebab-case',
    summary: 'Convert to kebab-case.',
    example: 'Hello World',
  },
  {
    mode: 'dot',
    name: 'dot.case',
    summary: 'Convert to dot.case.',
    example: 'Hello World',
  },
  {
    mode: 'slug',
    name: 'URL slug',
    summary: 'Convert to a URL slug.',
    example: 'Hello World',
  },
];

export const CaseOptionsSchema = z.object({
  locale: z
    .string()
    .optional()
    .describe('BCP-47 locale for locale-aware casing'),
  separator: z
    .string()
    .min(1)
    .optional()
    .describe('Slug separator (slug mode only, default "-")'),
});

function caseToolBase(meta: CaseModeMeta): TextaviaToolDefinition {
  return {
    id: `case.${meta.mode}`,
    name: meta.name,
    aliases: [meta.mode],
    category: 'case',
    summary: meta.summary,
    description: `${meta.summary} Supports stdin, positional text, and file input.`,
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/case-${meta.mode}`,
    docsUrl: `${WEB_BASE}/docs/case-${meta.mode}`,
    optionsSchema: CaseOptionsSchema,
    examples: [
      {
        title: `${meta.name} from positional text`,
        command: `txv case ${meta.mode} "${meta.example}"`,
        input: meta.example,
        output: convertCase(meta.mode, meta.example),
      },
      {
        title: `${meta.name} from stdin`,
        command: `echo "${meta.example}" | txv case ${meta.mode}`,
      },
    ],
    stability: 'stable',
    streaming: true,
    execute: (input) => textResult(convertCase(meta.mode, requireText(input))),
  };
}

/** All case.* tool definitions. */
export const caseTools: readonly TextaviaToolDefinition[] = CASE_MODE_META.map(
  (meta) => {
    const base = caseToolBase(meta);
    if (meta.mode === 'slug') {
      return {
        ...base,
        execute: (input, options) => {
          const opts = CaseOptionsSchema.parse(options);
          return textResult(
            convertCase('slug', requireText(input), opts.separator ?? '-'),
          );
        },
      };
    }
    return base;
  },
);
