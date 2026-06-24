/**
 * @fileoverview Registry entries for the lines.* tools.
 */

import { type TextaviaToolDefinition, requireText } from '@textavia/core';
import { z } from 'zod';
import {
  type SortDirection,
  compareLines,
  countLines,
  duplicateLines,
  removeEmptyLines,
  sortLines,
  splitLines,
  trimLines,
  uniqueLines,
} from '../transforms/lines.js';
import { WEB_BASE, jsonResult, textResult } from './common.js';

const SortOptions = z.object({
  direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
  caseInsensitive: z.boolean().optional().describe('Ignore case while sorting'),
  numeric: z.boolean().optional().describe('Sort numerically'),
  unique: z.boolean().optional().describe('Remove duplicates while sorting'),
});

function linesFromInput(text: string): string[] {
  return splitLines(text);
}

export const linesTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'lines.trim',
    name: 'Trim lines',
    aliases: ['trim'],
    category: 'lines',
    summary: 'Trim whitespace from every line.',
    description: 'Trims surrounding whitespace from each line.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/trim-lines`,
    optionsSchema: z.object({}),
    examples: [
      { title: 'Trim', command: 'printf " a \\n b " | txv lines trim' },
    ],
    stability: 'stable',
    streaming: true,
    execute: (input) =>
      textResult(trimLines(linesFromInput(requireText(input))).join('\n')),
  },
  {
    id: 'lines.remove-empty',
    name: 'Remove empty lines',
    aliases: ['remove-empty', 'text remove-empty-lines'],
    category: 'lines',
    summary: 'Remove empty lines.',
    description: 'Drops lines that are empty after trimming.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/remove-empty-lines`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Remove empty',
        command: 'printf "a\\n\\nb" | txv lines remove-empty',
      },
    ],
    stability: 'stable',
    streaming: true,
    execute: (input) =>
      textResult(
        removeEmptyLines(linesFromInput(requireText(input))).join('\n'),
      ),
  },
  {
    id: 'lines.unique',
    name: 'Unique lines',
    aliases: ['unique'],
    category: 'lines',
    summary: 'Remove duplicate lines.',
    description:
      'Removes duplicate lines, preserving first-seen order. Requires full input.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/remove-duplicate-lines`,
    optionsSchema: z.object({}),
    examples: [
      { title: 'Unique', command: 'printf "a\\nb\\na" | txv lines unique' },
    ],
    stability: 'stable',
    fullFile: true,
    execute: (input) =>
      textResult(uniqueLines(linesFromInput(requireText(input))).join('\n')),
  },
  {
    id: 'lines.sort',
    name: 'Sort lines',
    aliases: ['sort'],
    category: 'lines',
    summary: 'Sort lines.',
    description:
      'Sorts lines with optional direction, numeric, and case-insensitive flags.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/sort-text`,
    optionsSchema: SortOptions,
    examples: [
      { title: 'Sort', command: 'printf "c\\na\\nb" | txv lines sort' },
    ],
    stability: 'stable',
    fullFile: true,
    execute: (input, options) => {
      const opts = SortOptions.parse(options);
      return textResult(
        sortLines(linesFromInput(requireText(input)), {
          direction: opts.direction as SortDirection | undefined,
          caseInsensitive: opts.caseInsensitive,
          numeric: opts.numeric,
          unique: opts.unique,
        }).join('\n'),
      );
    },
  },
  {
    id: 'lines.count',
    name: 'Count lines',
    aliases: ['line-count'],
    category: 'lines',
    summary: 'Count the number of lines.',
    description: 'Reports the line count.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/line-count`,
    optionsSchema: z.object({}),
    examples: [
      { title: 'Count', command: 'printf "a\\nb\\nc" | txv lines count' },
    ],
    stability: 'stable',
    streaming: true,
    execute: (input) =>
      jsonResult({ lines: countLines(linesFromInput(requireText(input))) }),
  },
  {
    id: 'lines.duplicates',
    name: 'Find duplicate lines',
    aliases: ['duplicates'],
    category: 'lines',
    summary: 'List lines that appear more than once.',
    description: 'Reports each duplicate line once. Requires full input.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/find-duplicate-lines`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Duplicates',
        command: 'printf "a\\nb\\na" | txv lines duplicates',
      },
    ],
    stability: 'stable',
    fullFile: true,
    execute: (input) =>
      textResult(duplicateLines(linesFromInput(requireText(input))).join('\n')),
  },
  {
    id: 'lines.remove-duplicates',
    name: 'Remove duplicate lines',
    aliases: ['remove-duplicates', 'dedupe', 'text remove-duplicates'],
    category: 'lines',
    summary: 'Remove duplicate lines.',
    description:
      'Alias for unique that removes duplicate lines, preserving order.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/remove-duplicate-lines`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Remove duplicates',
        command: 'printf "a\\nb\\na" | txv lines remove-duplicates',
      },
    ],
    stability: 'stable',
    fullFile: true,
    execute: (input) =>
      textResult(uniqueLines(linesFromInput(requireText(input))).join('\n')),
  },
  {
    id: 'lines.compare',
    name: 'Compare line lists',
    aliases: ['compare'],
    category: 'lines',
    summary: 'Compare two line lists.',
    description:
      'Compares --file (list A) against --other (list B) and reports items unique to each and shared.',
    inputKind: ['files'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/list-comparer`,
    optionsSchema: z.object({
      other: z
        .string()
        .min(1)
        .describe('Path to the second list to compare against'),
    }),
    examples: [
      {
        title: 'Compare',
        command: 'txv lines compare --file a.txt --other b.txt',
      },
    ],
    stability: 'stable',
    fullFile: true,
    requiresFilesystem: true,
    execute: async (input, options, context) => {
      const opts = z.object({ other: z.string().min(1) }).parse(options);
      const listA = linesFromInput(requireText(input));
      const fs = context.adapters?.fs;
      if (fs === undefined) {
        throw new Error('lines.compare requires a filesystem adapter.');
      }
      const listBText = await fs.readText(opts.other, 'utf8');
      return jsonResult(compareLines(listA, linesFromInput(listBText)));
    },
  },
];
