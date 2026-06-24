/**
 * @fileoverview Registry entries for developer utilities beyond JSON/hash:
 * JWT decode, regex test, cron, color contrast, UTM URLs, and QR SVG output.
 */

import {
  ParseError,
  type TextaviaToolDefinition,
  requireText,
} from '@textavia/core';
import { runRegexWithTimeout } from '@textavia/node-adapters';
import QRCode from 'qrcode';
import { z } from 'zod';
import {
  buildUtmUrl,
  colorContrast,
  decodeJwt,
  explainCron,
  nextCronRuns,
} from '../transforms/data.js';
import { WEB_BASE, jsonResult, textResult } from './common.js';

const RegexOptions = z.object({
  pattern: z.string().min(1).optional(),
  flags: z.string().optional(),
  timeout: z.coerce.number().int().min(1).max(30_000).optional(),
  maxMatches: z.coerce.number().int().min(1).max(1000).optional(),
});

const CronNextOptions = z.object({
  count: z.coerce.number().int().min(1).max(100).optional(),
  from: z.string().datetime().optional(),
});

const ColorOptions = z.object({
  foreground: z.string().optional(),
  background: z.string().optional(),
});

const UtmOptions = z.object({
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  term: z.string().optional(),
  content: z.string().optional(),
});

const QrOptions = z.object({
  size: z.coerce.number().int().min(64).max(2048).optional(),
});

/** Developer utility tools bundled with the standard plugin. */
export const devUtilityTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'dev.jwt.decode',
    name: 'JWT decode',
    aliases: ['jwt decode'],
    category: 'dev',
    summary: 'Decode a JWT without verifying it.',
    description:
      'Decodes JWT header and payload locally. Signature not verified.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/jwt-decoder`,
    optionsSchema: z.object({}),
    examples: [
      { title: 'Decode JWT', command: 'txv jwt decode --file token.txt' },
    ],
    stability: 'stable',
    execute: (input) =>
      jsonResult(decodeJwt(requireText(input)), {
        warnings: ['Decoded only. Signature not verified.'],
        explanation:
          'JWT decode reads the header and payload only; it does not validate the signature.',
      }),
  },
  {
    id: 'dev.regex.test',
    name: 'Regex test',
    aliases: ['regex test'],
    category: 'dev',
    summary: 'Test a regular expression with timeout protection.',
    description:
      'Evaluates a JavaScript regex in a worker thread so catastrophic backtracking can be terminated.',
    inputKind: ['text'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/regex-tester`,
    optionsSchema: RegexOptions,
    examples: [
      {
        title: 'Test a pattern',
        command: 'txv regex test "^[a-z0-9-]+$" "hello-world" --json',
      },
    ],
    stability: 'stable',
    execute: async (input, options) => {
      const opts = RegexOptions.parse(options);
      const parsed = regexInput(requireText(input), opts.pattern);
      const result = await runRegexWithTimeout(
        parsed.pattern,
        opts.flags ?? '',
        parsed.text,
        {
          timeoutMs: opts.timeout ?? 1000,
          maxMatches: opts.maxMatches ?? 100,
        },
      );
      return jsonResult(result);
    },
  },
  {
    id: 'dev.cron.explain',
    name: 'Cron explain',
    aliases: ['cron explain'],
    category: 'dev',
    summary: 'Explain a five-field cron expression.',
    description:
      'Explains standard five-field cron expressions using UTC field ranges.',
    inputKind: ['text'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/cron-expression-generator`,
    optionsSchema: z.object({}),
    examples: [
      { title: 'Explain cron', command: 'txv cron explain "0 */6 * * *"' },
    ],
    stability: 'stable',
    execute: (input) => textResult(explainCron(requireText(input))),
  },
  {
    id: 'dev.cron.next',
    name: 'Cron next runs',
    aliases: ['cron next'],
    category: 'dev',
    summary: 'List upcoming cron run times.',
    description:
      'Computes upcoming UTC run times for a standard five-field cron expression.',
    inputKind: ['text'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/cron-expression-generator`,
    optionsSchema: CronNextOptions,
    examples: [{ title: 'Next runs', command: 'txv cron next "*/15 * * * *"' }],
    stability: 'stable',
    execute: (input, options) => {
      const opts = CronNextOptions.parse(options);
      return jsonResult({
        runs: nextCronRuns(
          requireText(input),
          opts.count ?? 5,
          opts.from === undefined ? new Date() : new Date(opts.from),
        ),
      });
    },
  },
  {
    id: 'dev.color.contrast',
    name: 'Color contrast',
    aliases: ['color contrast'],
    category: 'dev',
    summary: 'Calculate WCAG contrast between two colors.',
    description:
      'Accepts two hex colors and reports contrast ratio plus WCAG AA/AAA pass booleans.',
    inputKind: ['text'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/color-contrast-checker`,
    optionsSchema: ColorOptions,
    examples: [
      {
        title: 'Check contrast',
        command: 'txv color contrast "#111111" "#ffffff" --json',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = ColorOptions.parse(options);
      const [foreground, background] = colorInput(
        requireText(input),
        opts.foreground,
        opts.background,
      );
      return jsonResult(colorContrast(foreground, background));
    },
  },
  {
    id: 'dev.utm.build',
    name: 'UTM builder',
    aliases: ['utm build'],
    category: 'dev',
    summary: 'Build a URL with UTM parameters.',
    description:
      'Adds utm_source, utm_medium, utm_campaign, utm_term, and utm_content to a base URL.',
    inputKind: ['text'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/utm-builder`,
    optionsSchema: UtmOptions,
    examples: [
      {
        title: 'Build UTM URL',
        command:
          'txv utm build "https://example.com" --source newsletter --medium email',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = UtmOptions.parse(options);
      return textResult(buildUtmUrl(requireText(input), opts));
    },
  },
  {
    id: 'dev.qr',
    name: 'QR SVG',
    aliases: ['qr', 'qr generate'],
    category: 'dev',
    summary: 'Generate a local QR code SVG.',
    description:
      'Generates a standards-compliant QR code SVG for the input text. No network access is used.',
    inputKind: ['text'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/qr-code-generator`,
    optionsSchema: QrOptions,
    examples: [
      {
        title: 'Generate SVG',
        command: 'txv qr "https://textavia.com" --out qr.svg',
      },
    ],
    stability: 'experimental',
    execute: async (input, options) => {
      const opts = QrOptions.parse(options);
      const text = requireText(input);
      if (text.length === 0) {
        throw new ParseError('QR input cannot be empty.');
      }
      const size = opts.size ?? 256;
      return textResult(
        await QRCode.toString(text, {
          type: 'svg',
          width: size,
          margin: 1,
          errorCorrectionLevel: 'M',
        }),
      );
    },
  },
];

function regexInput(
  text: string,
  patternOption: string | undefined,
): { pattern: string; text: string } {
  if (patternOption !== undefined) {
    return { pattern: patternOption, text };
  }
  const [pattern, ...rest] = text.split('\n');
  if (pattern === undefined || pattern.length === 0 || rest.length === 0) {
    throw new ParseError(
      'Regex test requires a pattern and input text. Pass --pattern or use `txv regex test PATTERN INPUT`.',
    );
  }
  return { pattern, text: rest.join('\n') };
}

function colorInput(
  text: string,
  foregroundOption: string | undefined,
  backgroundOption: string | undefined,
): [string, string] {
  if (foregroundOption !== undefined && backgroundOption !== undefined) {
    return [foregroundOption, backgroundOption];
  }
  const parts = text.trim().split(/\s+/);
  const foreground = foregroundOption ?? parts[0];
  const background = backgroundOption ?? parts[1];
  if (foreground === undefined || background === undefined) {
    throw new ParseError(
      'Color contrast requires foreground and background colors.',
    );
  }
  return [foreground, background];
}
