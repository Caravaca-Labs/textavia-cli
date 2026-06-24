/**
 * @fileoverview Registry entries for random generation tools.
 *
 * Passwords and UUIDs use cryptographically secure randomness from
 * @textavia/node-adapters.
 */

import type {
  TextaviaToolDefinition,
  ToolExecutionResult,
} from '@textavia/core';
import { generatePassword, secureUuid } from '@textavia/node-adapters';
import { z } from 'zod';
import { WEB_BASE, jsonResult, textResult } from './common.js';

const UuidOptions = z.object({
  count: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .describe('Number of UUIDs to generate'),
});

const PasswordOptions = z.object({
  length: z
    .number()
    .int()
    .min(1)
    .max(256)
    .optional()
    .describe('Password length (default 16)'),
  symbols: z.boolean().optional().describe('Include symbols'),
  lower: z.boolean().optional().describe('Include lowercase letters'),
  upper: z.boolean().optional().describe('Include uppercase letters'),
  digits: z.boolean().optional().describe('Include digits'),
  requireAll: z
    .boolean()
    .optional()
    .describe('Require at least one of each enabled pool'),
  count: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .describe('Number of passwords to generate'),
});

export const randomTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'random.uuid',
    name: 'Random UUID',
    aliases: ['uuid'],
    category: 'random',
    summary: 'Generate cryptographically secure UUIDs.',
    description: 'Generates RFC 4122 v4 UUIDs using node:crypto.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/uuid-generator`,
    optionsSchema: UuidOptions,
    examples: [{ title: 'UUID', command: 'txv random uuid' }],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = UuidOptions.parse(options);
      const count = opts.count ?? 1;
      const uuids = Array.from({ length: count }, () => secureUuid());
      return count === 1
        ? textResult(uuids[0] as string)
        : textResult(uuids.join('\n'));
    },
  },
  {
    id: 'random.password',
    name: 'Random password',
    aliases: ['password'],
    category: 'random',
    summary: 'Generate a cryptographically secure password.',
    description:
      'Generates a secure password with configurable pools and length.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/password-generator`,
    optionsSchema: PasswordOptions,
    examples: [
      {
        title: 'Password',
        command: 'txv random password --length 20 --symbols',
      },
    ],
    stability: 'stable',
    execute: (_input, options): ToolExecutionResult<string | string[]> => {
      const opts = PasswordOptions.parse(options);
      const count = opts.count ?? 1;
      const passwords = Array.from({ length: count }, () =>
        generatePassword({
          length: opts.length ?? 16,
          symbols: opts.symbols,
          lower: opts.lower,
          upper: opts.upper,
          digits: opts.digits,
          requireAll: opts.requireAll,
        }),
      );
      if (count === 1) {
        return textResult(passwords[0] as string);
      }
      return jsonResult(passwords);
    },
  },
];
