/**
 * @fileoverview Registry entries for timestamp tools.
 */

import type { TextaviaToolDefinition } from '@textavia/core';
import { z } from 'zod';
import {
  type TimestampUnit,
  dateToUnix,
  nowTimestamp,
  parseTimestamp,
  unixToDate,
} from '../transforms/timestamp.js';
import { WEB_BASE, jsonResult } from './common.js';

const UnitOption = z.object({
  unit: z
    .enum(['seconds', 'milliseconds'])
    .optional()
    .describe('Epoch unit (default seconds)'),
});

export const timestampTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'dev.timestamp.now',
    name: 'Timestamp now',
    aliases: ['timestamp-now', 'now'],
    category: 'dev',
    summary: 'Show the current timestamp.',
    description: 'Returns the current ISO time and Unix epoch value.',
    inputKind: ['generated'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/unix-time-converter`,
    optionsSchema: UnitOption,
    examples: [{ title: 'Now', command: 'txv timestamp now' }],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = UnitOption.parse(options);
      return jsonResult(nowTimestamp(opts.unit ?? 'seconds'));
    },
  },
  {
    id: 'dev.timestamp.parse',
    name: 'Parse timestamp',
    aliases: ['timestamp-parse'],
    category: 'dev',
    summary: 'Parse a timestamp string.',
    description:
      'Parses an ISO 8601 string or Unix number into ISO and Unix forms.',
    inputKind: ['text'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/unix-time-converter`,
    optionsSchema: UnitOption,
    examples: [
      { title: 'Parse', command: 'txv timestamp parse "2024-01-01T00:00:00Z"' },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = UnitOption.parse(options);
      const text = ((): string => {
        if (input.text !== undefined) {
          return input.text;
        }
        throw new Error('timestamp.parse requires a timestamp argument.');
      })();
      return jsonResult(parseTimestamp(text, opts.unit ?? 'seconds'));
    },
  },
  {
    id: 'dev.timestamp.to-date',
    name: 'Unix to date',
    aliases: ['from-unix', 'timestamp-to-date'],
    category: 'dev',
    summary: 'Convert a Unix timestamp to a date.',
    description: 'Converts a Unix epoch value to an ISO and local date string.',
    inputKind: ['text'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/unix-time-converter`,
    optionsSchema: UnitOption,
    examples: [
      { title: 'To date', command: 'txv timestamp to-date 1704067200' },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = UnitOption.parse(options);
      const text = input.text ?? '';
      const value = Number(text);
      return jsonResult(unixToDate(value, opts.unit ?? 'seconds'));
    },
  },
  {
    id: 'dev.timestamp.from-date',
    name: 'Date to Unix',
    aliases: ['to-unix', 'timestamp-from-date'],
    category: 'dev',
    summary: 'Convert a date to a Unix timestamp.',
    description: 'Parses a date string and returns the Unix epoch value.',
    inputKind: ['text'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/unix-time-converter`,
    optionsSchema: UnitOption,
    examples: [
      {
        title: 'From date',
        command: 'txv timestamp from-date "2024-01-01T00:00:00Z"',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = UnitOption.parse(options);
      const text = input.text ?? '';
      return jsonResult(dateToUnix(text, opts.unit ?? 'seconds'));
    },
  },
];
