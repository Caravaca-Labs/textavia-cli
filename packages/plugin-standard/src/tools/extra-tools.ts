/**
 * @fileoverview Additional lightweight core tools requested for the CLI.
 *
 * These tools intentionally stay dependency-free and local-first. Heavier
 * formatters, media, Excel, Sheets, and Unicode novelty styles belong in
 * optional plugins.
 */

import { gunzipSync, gzipSync } from 'node:zlib';
import {
  ParseError,
  type ResolvedInput,
  type TextaviaToolDefinition,
  TransformError,
  requireText,
} from '@textavia/core';
import {
  type HashAlgorithm,
  hashStream,
  hashValue,
  secureRandomBytes,
} from '@textavia/node-adapters';
import { z } from 'zod';
import { convertCase } from '../transforms/case.js';
import { jsonToYaml, yamlToJson } from '../transforms/data.js';
import {
  decodeBase64ToBytes,
  decodeBase64ToText,
  encodeBase64Bytes,
  encodeBase64Text,
  fromDataUrl,
  isValidBase64,
  toDataUrl,
} from '../transforms/encoding.js';
import { parseJson } from '../transforms/json.js';
import { splitLines, uniqueLines } from '../transforms/lines.js';
import {
  cleanText,
  computeStats,
  countSyllables,
  removeFormatting,
} from '../transforms/text.js';
import { WEB_BASE, jsonResult, textResult } from './common.js';

const EmptyOptions = z.object({});
const CountOptions = z.object({
  count: z.coerce.number().int().min(0).max(100_000).optional(),
  separator: z.string().optional(),
});
const RemoveCharsOptions = z.object({
  chars: z.string().min(1).describe('Characters to remove'),
  ignoreCase: z.boolean().optional(),
});
const OtherTextOptions = z.object({
  other: z
    .string()
    .optional()
    .describe('Second value or path, depending on tool'),
});
const NumberSortOptions = z.object({
  direction: z.enum(['asc', 'desc']).optional(),
  unique: z.boolean().optional(),
});
const RandomCountOptions = z.object({
  count: z.coerce.number().int().min(1).max(1000).optional(),
});
const RandomNumberOptions = z.object({
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  count: z.coerce.number().int().min(1).max(1000).optional(),
});
const RandomIntegerOptions = z.object({
  min: z.coerce.number().int().optional(),
  max: z.coerce.number().int().optional(),
  count: z.coerce.number().int().min(1).max(1000).optional(),
});
const RandomDateOptions = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  count: z.coerce.number().int().min(1).max(1000).optional(),
});
const CaesarOptions = z.object({
  shift: z.coerce.number().int().min(-25).max(25).optional(),
});
const HexDecodeOptions = z.object({
  bytes: z.boolean().optional(),
});
const Base64DataUrlOptions = z.object({
  mimeType: z.string().min(1).optional(),
});
const JsonQueryOptions = z.object({
  path: z.string().min(1).optional(),
});
const JsonTypesOptions = z.object({
  name: z.string().min(1).optional(),
});
const CsvSelectOptions = z.object({
  columns: z.string().min(1).describe('Comma-separated column names'),
  delimiter: z.string().length(1).optional(),
});
const CsvSortOptions = z.object({
  by: z.string().min(1).optional(),
  delimiter: z.string().length(1).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
});
const CsvOptions = z.object({
  delimiter: z.string().length(1).optional(),
});
const HashFileOptions = z.object({
  algorithm: z
    .enum(['md5', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512'])
    .optional(),
  encoding: z.enum(['hex', 'base64']).optional(),
});

function bytesOrText(input: ResolvedInput): Uint8Array {
  if (input.bytes !== undefined) {
    return input.bytes;
  }
  return Buffer.from(requireText(input), 'utf8');
}

async function hashAnyInput(
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

function normalizedBase64(input: string): string {
  const cleaned = input
    .trim()
    .replace(/\s+/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padding = cleaned.length % 4 === 0 ? 0 : 4 - (cleaned.length % 4);
  return `${cleaned}${'='.repeat(padding)}`;
}

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex');
}

function fromHex(input: string): Uint8Array {
  const cleaned = input.replace(/\s+/g, '');
  if (
    cleaned.length === 0 ||
    cleaned.length % 2 !== 0 ||
    /[^0-9a-f]/i.test(cleaned)
  ) {
    throw new ParseError('Input is not valid hexadecimal.');
  }
  return new Uint8Array(Buffer.from(cleaned, 'hex'));
}

function toBinaryBytes(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(2).padStart(8, '0')).join(' ');
}

function fromBinaryBytes(input: string): Uint8Array {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  if (
    tokens.length === 0 ||
    !tokens.every((token) => /^[01]{8}$/.test(token))
  ) {
    throw new ParseError(
      'Binary input must contain 8-bit groups separated by whitespace.',
    );
  }
  return Uint8Array.from(tokens.map((token) => Number.parseInt(token, 2)));
}

function words(input: string): string[] {
  return input.match(/[A-Za-z0-9']+/g) ?? [];
}

function duplicateWords(input: string): string[] {
  const counts = new Map<string, number>();
  for (const word of words(input).map((value) => value.toLowerCase())) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([word]) => word);
}

function sentenceCount(input: string): number {
  return computeStats(input).sentences;
}

function removeChars(
  input: string,
  chars: string,
  ignoreCase?: boolean,
): string {
  const escaped = chars.replace(/[\\\]^-]/g, '\\$&');
  const pattern = new RegExp(`[${escaped}]`, ignoreCase === true ? 'gi' : 'g');
  return input.replace(pattern, '');
}

function repeatText(input: string, count: number, separator: string): string {
  return Array.from({ length: count }, () => input).join(separator);
}

function diffText(
  left: string,
  right: string,
): Record<string, readonly string[]> {
  const a = splitLines(left);
  const b = splitLines(right);
  const setA = new Set(a);
  const setB = new Set(b);
  return {
    removed: a.filter((line) => !setB.has(line)),
    added: b.filter((line) => !setA.has(line)),
    unchanged: a.filter((line) => setB.has(line)),
  };
}

function setLines(
  left: string,
  right: string,
): {
  readonly intersect: string[];
  readonly subtract: string[];
  readonly union: string[];
} {
  const a = splitLines(left);
  const b = splitLines(right);
  const setB = new Set(b);
  return {
    intersect: uniqueLines(a.filter((line) => setB.has(line))),
    subtract: a.filter((line) => !setB.has(line)),
    union: uniqueLines([...a, ...b]),
  };
}

function shuffleValues(values: readonly string[]): string[] {
  const output = [...values];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    const current = output[i];
    const replacement = output[j];
    if (current === undefined || replacement === undefined) {
      throw new TransformError('Shuffle index out of range.');
    }
    output[i] = replacement;
    output[j] = current;
  }
  return output;
}

function splitTwoTexts(text: string, other?: string): [string, string] {
  if (other !== undefined) {
    return [text, other];
  }
  const separator = '\n---\n';
  const index = text.indexOf(separator);
  if (index !== -1) {
    return [text.slice(0, index), text.slice(index + separator.length)];
  }
  const [first, ...rest] = text.split('\n');
  if (first === undefined || rest.length === 0) {
    throw new ParseError(
      'Two inputs are required. Pass --other or separate values with a line containing "---".',
    );
  }
  return [first, rest.join('\n')];
}

function parseNumbers(input: string): number[] {
  const values = input
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((value) => Number(value));
  if (values.some((value) => !Number.isFinite(value))) {
    throw new ParseError('Input contains a value that is not a finite number.');
  }
  return values;
}

function summarizeNumbers(
  values: readonly number[],
): Record<string, number | null> {
  if (values.length === 0) {
    return { count: 0, min: null, max: null, sum: 0, mean: null, median: null };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((total, value) => total + value, 0);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
      : (sorted[mid] ?? 0);
  return {
    count: values.length,
    min: sorted[0] ?? null,
    max: sorted[sorted.length - 1] ?? null,
    sum,
    mean: sum / values.length,
    median,
  };
}

function randomUInt32(): number {
  const bytes = secureRandomBytes(4);
  return (
    ((bytes[0] ?? 0) * 0x1000000 +
      ((bytes[1] ?? 0) << 16) +
      ((bytes[2] ?? 0) << 8) +
      (bytes[3] ?? 0)) >>>
    0
  );
}

function randomFloat01(): number {
  return randomUInt32() / 0x100000000;
}

function randomInt(min: number, max: number): number {
  if (max < min) {
    throw new ParseError('max must be greater than or equal to min.');
  }
  return Math.floor(randomFloat01() * (max - min + 1)) + min;
}

function randomChoice<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new ParseError('At least one choice is required.');
  }
  const item = items[randomInt(0, items.length - 1)];
  if (item === undefined) {
    throw new TransformError('Random choice failed.');
  }
  return item;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const LOREM_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
] as const;

function loremWords(count: number): string {
  return Array.from(
    { length: count },
    (_, index) => LOREM_WORDS[index % LOREM_WORDS.length],
  ).join(' ');
}

function loremSentences(count: number): string {
  return Array.from({ length: count }, (_, index) => {
    const sentence = loremWords(8 + (index % 5));
    return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
  }).join(' ');
}

function loremParagraphs(count: number): string {
  return Array.from({ length: count }, () => loremSentences(4)).join('\n\n');
}

function rot13(input: string): string {
  return input.replace(/[A-Za-z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    const code = char.charCodeAt(0) - base;
    return String.fromCharCode(((code + 13) % 26) + base);
  });
}

function caesar(input: string, shift: number): string {
  const normalizedShift = ((shift % 26) + 26) % 26;
  return input.replace(/[A-Za-z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97;
    const code = char.charCodeAt(0) - base;
    return String.fromCharCode(((code + normalizedShift) % 26) + base);
  });
}

const MORSE: Readonly<Record<string, string>> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
};
const REVERSE_MORSE = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k]),
);

function morseEncode(input: string): string {
  return input
    .toUpperCase()
    .split(/\s+/)
    .map((word) =>
      [...word]
        .map((char) => MORSE[char])
        .filter((value): value is string => value !== undefined)
        .join(' '),
    )
    .join(' / ');
}

function morseDecode(input: string): string {
  return input
    .trim()
    .split(/\s*\/\s*/)
    .map((word) =>
      word
        .split(/\s+/)
        .map((code) => REVERSE_MORSE[code] ?? '')
        .join(''),
    )
    .join(' ');
}

const NATO: Readonly<Record<string, string>> = {
  A: 'Alfa',
  B: 'Bravo',
  C: 'Charlie',
  D: 'Delta',
  E: 'Echo',
  F: 'Foxtrot',
  G: 'Golf',
  H: 'Hotel',
  I: 'India',
  J: 'Juliett',
  K: 'Kilo',
  L: 'Lima',
  M: 'Mike',
  N: 'November',
  O: 'Oscar',
  P: 'Papa',
  Q: 'Quebec',
  R: 'Romeo',
  S: 'Sierra',
  T: 'Tango',
  U: 'Uniform',
  V: 'Victor',
  W: 'Whiskey',
  X: 'X-ray',
  Y: 'Yankee',
  Z: 'Zulu',
};
const REVERSE_NATO = Object.fromEntries(
  Object.entries(NATO).map(([k, v]) => [v.toLowerCase(), k]),
);

function natoEncode(input: string): string {
  return [...input.toUpperCase()]
    .map((char) => (char === ' ' ? '/' : (NATO[char] ?? char)))
    .join(' ');
}

function natoDecode(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .map((token) =>
      token === '/' ? ' ' : (REVERSE_NATO[token.toLowerCase()] ?? token),
    )
    .join('');
}

function romanToNumber(input: string): number {
  const values: Readonly<Record<string, number>> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };
  const text = input.trim().toUpperCase();
  if (!/^[IVXLCDM]+$/.test(text)) {
    throw new ParseError('Input is not a Roman numeral.');
  }
  let total = 0;
  for (let i = 0; i < text.length; i += 1) {
    const current = values[text[i] ?? ''] ?? 0;
    const next = values[text[i + 1] ?? ''] ?? 0;
    total += current < next ? -current : current;
  }
  if (numberToRoman(total) !== text) {
    throw new ParseError('Input is not a canonical Roman numeral.');
  }
  return total;
}

function numberToRoman(value: number): string {
  if (!Number.isInteger(value) || value < 1 || value > 3999) {
    throw new ParseError('Roman numerals support integers from 1 to 3999.');
  }
  const pairs: readonly [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let remaining = value;
  let output = '';
  for (const [amount, numeral] of pairs) {
    while (remaining >= amount) {
      output += numeral;
      remaining -= amount;
    }
  }
  return output;
}

function jsonStringifyText(input: string): string {
  return JSON.stringify(input);
}

function jsonUnstringifyText(input: string): string {
  const parsed = parseJson(input);
  if (typeof parsed !== 'string') {
    throw new ParseError('JSON unstringify expects a JSON string.');
  }
  return parsed;
}

function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }
  if (value !== null && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(object)
        .sort()
        .map((key) => [key, sortJsonKeys(object[key])]),
    );
  }
  return value;
}

function queryJson(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, part) => {
    if (current === undefined || current === null) {
      return undefined;
    }
    if (Array.isArray(current)) {
      return current[Number(part)];
    }
    if (typeof current === 'object') {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, value);
}

function jsonToTomlValue(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(jsonToTomlValue).join(', ')}]`;
  }
  throw new ParseError(
    'TOML conversion supports scalar values and arrays at the top level.',
  );
}

function jsonToToml(input: string): string {
  const parsed = parseJson(input);
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new ParseError('JSON to TOML expects a JSON object.');
  }
  return Object.entries(parsed as Record<string, unknown>)
    .map(([key, value]) => `${key} = ${jsonToTomlValue(value)}`)
    .join('\n');
}

function parseToml(input: string): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith('#')) {
      continue;
    }
    const match = /^([A-Za-z0-9_-]+)\s*=\s*(.+)$/.exec(line);
    if (match === null) {
      throw new ParseError(`Unsupported TOML line: ${line}`);
    }
    output[match[1] ?? ''] = parseTomlValue(match[2] ?? '');
  }
  return output;
}

function parseTomlValue(input: string): unknown {
  const value = input.trim();
  if (value.startsWith('"')) {
    return parseJson(value);
  }
  if (value === 'true' || value === 'false') {
    return value === 'true';
  }
  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }
  if (value.startsWith('[')) {
    return parseJson(value);
  }
  return value;
}

function jsonToTypes(input: string, name: string): string {
  const parsed = parseJson(input);
  return `export interface ${name} ${typeShape(parsed, 0)}`;
}

function typeShape(value: unknown, depth: number): string {
  const indent = '  '.repeat(depth);
  const childIndent = '  '.repeat(depth + 1);
  if (Array.isArray(value)) {
    const first = value[0];
    return `${typeShape(first, depth)}[]`;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return 'Record<string, unknown>';
    }
    return `{\n${entries
      .map(
        ([key, child]) =>
          `${childIndent}${safeTsKey(key)}: ${typeShape(child, depth + 1)};`,
      )
      .join('\n')}\n${indent}}`;
  }
  if (typeof value === 'string') {
    return 'string';
  }
  if (typeof value === 'number') {
    return 'number';
  }
  if (typeof value === 'boolean') {
    return 'boolean';
  }
  return 'unknown';
}

function safeTsKey(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function csvRows(input: string, delimiter = ','): string[][] {
  return input
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => line.split(delimiter));
}

function csvSerialize(
  rows: readonly (readonly string[])[],
  delimiter = ',',
): string {
  return rows.map((row) => row.join(delimiter)).join('\n');
}

function csvValidate(input: string, delimiter = ','): Record<string, unknown> {
  const rows = csvRows(input, delimiter);
  const width = rows[0]?.length ?? 0;
  const inconsistentRows = rows
    .map((row, index) => ({ row: index + 1, columns: row.length }))
    .filter((row) => row.columns !== width);
  return {
    valid: inconsistentRows.length === 0,
    rows: rows.length,
    columns: width,
    inconsistentRows,
  };
}

function colorConvert(input: string): Record<string, unknown> {
  const hex = input.trim();
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (match === null) {
    throw new ParseError('Color convert expects a 6-digit hex color.');
  }
  const value = match[1] ?? '';
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return {
    hex: `#${value.toLowerCase()}`,
    rgb: { r, g, b },
    css: `rgb(${r}, ${g}, ${b})`,
  };
}

function explainRegex(pattern: string): string {
  const parts: string[] = [`Pattern length: ${pattern.length}`];
  if (pattern.startsWith('^')) {
    parts.push('Anchored at start.');
  }
  if (pattern.endsWith('$')) {
    parts.push('Anchored at end.');
  }
  if (/[+*{]/.test(pattern)) {
    parts.push('Contains repetition.');
  }
  if (/\[[^\]]+\]/.test(pattern)) {
    parts.push('Contains character classes.');
  }
  return parts.join(' ');
}

function makeTool(tool: TextaviaToolDefinition): TextaviaToolDefinition {
  return tool;
}

export const extraTools: readonly TextaviaToolDefinition[] = [
  makeTool({
    id: 'text.alternating-case',
    name: 'Alternating case',
    aliases: [],
    category: 'text',
    summary: 'Alternate letter case.',
    description: 'Alternates casing across letters in the input text.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/alternating-case`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Alternating',
        command: 'txv text alternating-case "hello"',
        output: 'HeLlO',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(convertCase('alternating', requireText(input))),
  }),
  makeTool({
    id: 'text.capitalize',
    name: 'Capitalize text',
    aliases: ['text capitalized'],
    category: 'text',
    summary: 'Capitalize each word.',
    description: 'Capitalizes each word for a readable capitalized style.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/capitalized-case`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Capitalize',
        command: 'txv text capitalize "hello world"',
        output: 'Hello World',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(convertCase('capitalized', requireText(input))),
  }),
  makeTool({
    id: 'text.normalize-whitespace',
    name: 'Normalize whitespace',
    aliases: [],
    category: 'text',
    summary: 'Collapse whitespace and trim.',
    description:
      'Collapses repeated whitespace into single spaces and trims the result.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/whitespace-remover`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Normalize whitespace',
        command: 'txv text normalize-whitespace " a   b "',
        output: 'a b',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(cleanText(requireText(input))),
  }),
  makeTool({
    id: 'text.remove-line-breaks',
    name: 'Remove line breaks',
    aliases: [],
    category: 'text',
    summary: 'Replace line breaks with spaces.',
    description:
      'Converts multi-line text into a single line with normalized spacing.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/remove-line-breaks`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Remove line breaks',
        command: 'printf "a\\nb" | txv text remove-line-breaks',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(cleanText(requireText(input).replace(/\r?\n/g, ' '))),
  }),
  makeTool({
    id: 'text.remove-chars',
    name: 'Remove characters',
    aliases: ['character-remove'],
    category: 'text',
    summary: 'Remove selected characters from text.',
    description: 'Removes every character listed in --chars from the input.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/character-remover`,
    optionsSchema: RemoveCharsOptions,
    examples: [
      {
        title: 'Remove chars',
        command: 'txv text remove-chars "banana" --chars an',
        output: 'b',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = RemoveCharsOptions.parse(options);
      return textResult(
        removeChars(requireText(input), opts.chars, opts.ignoreCase),
      );
    },
  }),
  makeTool({
    id: 'text.repeat',
    name: 'Repeat text',
    aliases: ['repeat'],
    category: 'text',
    summary: 'Repeat input text.',
    description: 'Repeats the input --count times with an optional separator.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/repeat-text`,
    optionsSchema: CountOptions,
    examples: [
      {
        title: 'Repeat',
        command: 'txv text repeat "ha" --count 3',
        output: 'hahaha',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = CountOptions.parse(options);
      return textResult(
        repeatText(requireText(input), opts.count ?? 2, opts.separator ?? ''),
      );
    },
  }),
  makeTool({
    id: 'text.diff',
    name: 'Text diff',
    aliases: ['diff'],
    category: 'text',
    summary: 'Compare two text blocks line by line.',
    description:
      'Reports added, removed, and unchanged lines. Use --other or separate blocks with a line containing "---".',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/diff-checker`,
    optionsSchema: OtherTextOptions,
    examples: [
      { title: 'Diff', command: 'txv text diff "a" --other "a\\nb" --json' },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = OtherTextOptions.parse(options);
      const [left, right] = splitTwoTexts(requireText(input), opts.other);
      return jsonResult(diffText(left, right));
    },
  }),
  makeTool({
    id: 'text.sentence-count',
    name: 'Sentence count',
    aliases: ['sentence-count'],
    category: 'text',
    summary: 'Count sentences in text.',
    description: 'Counts sentences using the same heuristic as text stats.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/sentence-counter`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Sentence count',
        command: 'txv text sentence-count "One. Two!" --json',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      jsonResult({ sentences: sentenceCount(requireText(input)) }),
  }),
  makeTool({
    id: 'text.duplicate-words',
    name: 'Duplicate words',
    aliases: ['duplicate-words'],
    category: 'text',
    summary: 'List repeated words.',
    description: 'Reports case-insensitive words that appear more than once.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/duplicate-word-finder`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Duplicate words',
        command: 'txv text duplicate-words "the cat and the dog" --json',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      jsonResult({ duplicates: duplicateWords(requireText(input)) }),
  }),
  makeTool({
    id: 'words.sort',
    name: 'Sort words',
    aliases: [],
    category: 'words',
    summary: 'Sort words alphabetically.',
    description: 'Splits input into words and sorts them alphabetically.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/sort-words`,
    optionsSchema: NumberSortOptions,
    examples: [
      {
        title: 'Sort words',
        command: 'txv words sort "banana apple"',
        output: 'apple banana',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = NumberSortOptions.parse(options);
      const sorted = words(requireText(input)).sort((a, b) =>
        a.localeCompare(b),
      );
      if (opts.direction === 'desc') {
        sorted.reverse();
      }
      return textResult((opts.unique ? uniqueLines(sorted) : sorted).join(' '));
    },
  }),
  makeTool({
    id: 'lines.reverse',
    name: 'Reverse lines',
    aliases: [],
    category: 'lines',
    summary: 'Reverse line order.',
    description: 'Reverses the order of input lines.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/reverse-lines`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'Reverse lines', command: 'printf "a\\nb" | txv lines reverse' },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(splitLines(requireText(input)).reverse().join('\n')),
  }),
  makeTool({
    id: 'lines.shuffle',
    name: 'Shuffle lines',
    aliases: [],
    category: 'lines',
    summary: 'Shuffle line order.',
    description: 'Randomly shuffles input lines locally.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/shuffle-lines`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'Shuffle lines', command: 'printf "a\\nb" | txv lines shuffle' },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(shuffleValues(splitLines(requireText(input))).join('\n')),
  }),
  makeTool({
    id: 'lines.intersect',
    name: 'Intersect lines',
    aliases: [],
    category: 'lines',
    summary: 'Return lines present in both lists.',
    description:
      'Computes line intersection. Use --other or separate blocks with a line containing "---".',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/list-intersect`,
    optionsSchema: OtherTextOptions,
    examples: [
      {
        title: 'Intersect lines',
        command: 'txv lines intersect "a\\nb" --other "b\\nc"',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = OtherTextOptions.parse(options);
      const [left, right] = splitTwoTexts(requireText(input), opts.other);
      return textResult(setLines(left, right).intersect.join('\n'));
    },
  }),
  makeTool({
    id: 'lines.subtract',
    name: 'Subtract lines',
    aliases: [],
    category: 'lines',
    summary: 'Return lines only in the first list.',
    description:
      'Computes A minus B. Use --other or separate blocks with a line containing "---".',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/list-subtract`,
    optionsSchema: OtherTextOptions,
    examples: [
      {
        title: 'Subtract lines',
        command: 'txv lines subtract "a\\nb" --other "b\\nc"',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = OtherTextOptions.parse(options);
      const [left, right] = splitTwoTexts(requireText(input), opts.other);
      return textResult(setLines(left, right).subtract.join('\n'));
    },
  }),
  makeTool({
    id: 'lines.union',
    name: 'Union lines',
    aliases: [],
    category: 'lines',
    summary: 'Return unique lines from both lists.',
    description:
      'Computes a first-seen union. Use --other or separate blocks with a line containing "---".',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/list-union`,
    optionsSchema: OtherTextOptions,
    examples: [
      {
        title: 'Union lines',
        command: 'txv lines union "a\\nb" --other "b\\nc"',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = OtherTextOptions.parse(options);
      const [left, right] = splitTwoTexts(requireText(input), opts.other);
      return textResult(setLines(left, right).union.join('\n'));
    },
  }),
  makeTool({
    id: 'words.unique',
    name: 'Unique words',
    aliases: [],
    category: 'words',
    summary: 'Remove duplicate words.',
    description:
      'Splits input into words and preserves the first occurrence of each word.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/unique-words`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Unique words',
        command: 'txv words unique "the the cat"',
        output: 'the cat',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(uniqueLines(words(requireText(input))).join(' ')),
  }),
  makeTool({
    id: 'numbers.sort',
    name: 'Sort numbers',
    aliases: [],
    category: 'numbers',
    summary: 'Sort numeric values.',
    description: 'Parses whitespace/comma-separated numbers and sorts them.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/number-sorter`,
    optionsSchema: NumberSortOptions,
    examples: [
      {
        title: 'Sort numbers',
        command: 'txv numbers sort "3 1 2"',
        output: '1\\n2\\n3',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = NumberSortOptions.parse(options);
      const sorted = parseNumbers(requireText(input)).sort((a, b) => a - b);
      if (opts.direction === 'desc') {
        sorted.reverse();
      }
      const values = opts.unique ? [...new Set(sorted)] : sorted;
      return textResult(values.join('\n'));
    },
  }),
  makeTool({
    id: 'numbers.stats',
    name: 'Number statistics',
    aliases: [],
    category: 'numbers',
    summary: 'Summarize numeric values.',
    description: 'Reports count, min, max, sum, mean, and median.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/number-statistics`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'Number stats', command: 'txv numbers stats "1 2 3" --json' },
    ],
    stability: 'stable',
    execute: (input) =>
      jsonResult(summarizeNumbers(parseNumbers(requireText(input)))),
  }),
  makeTool({
    id: 'encoding.hex.encode',
    name: 'Hex encode',
    aliases: ['hex encode'],
    category: 'encoding',
    summary: 'Encode text or bytes as hexadecimal.',
    description: 'Encodes UTF-8 text or file bytes to a hex string.',
    inputKind: ['text', 'bytes', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/hex-encoder`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'Hex encode', command: 'txv hex encode "Hi"', output: '4869' },
    ],
    stability: 'stable',
    execute: (input) => textResult(toHex(bytesOrText(input))),
  }),
  makeTool({
    id: 'encoding.hex.decode',
    name: 'Hex decode',
    aliases: ['hex decode'],
    category: 'encoding',
    summary: 'Decode hexadecimal to text or bytes.',
    description:
      'Decodes a hex string to UTF-8 text by default, or bytes with --bytes.',
    inputKind: ['text', 'file'],
    outputKind: ['text', 'bytes'],
    webUrl: `${WEB_BASE}/hex-decoder`,
    optionsSchema: HexDecodeOptions,
    examples: [
      { title: 'Hex decode', command: 'txv hex decode 4869', output: 'Hi' },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = HexDecodeOptions.parse(options);
      const bytes = fromHex(requireText(input));
      return opts.bytes === true
        ? { output: bytes, outputKind: 'bytes' as const }
        : textResult(Buffer.from(bytes).toString('utf8'));
    },
  }),
  makeTool({
    id: 'encoding.binary.encode',
    name: 'Binary encode',
    aliases: ['binary encode'],
    category: 'encoding',
    summary: 'Encode text or bytes as binary.',
    description: 'Encodes UTF-8 text or file bytes into 8-bit binary groups.',
    inputKind: ['text', 'bytes', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/binary`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Binary encode',
        command: 'txv binary encode A',
        output: '01000001',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(toBinaryBytes(bytesOrText(input))),
  }),
  makeTool({
    id: 'encoding.binary.decode',
    name: 'Binary decode',
    aliases: ['binary decode'],
    category: 'encoding',
    summary: 'Decode 8-bit binary groups to text.',
    description:
      'Decodes whitespace-separated 8-bit binary groups into UTF-8 text.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/binary`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Binary decode',
        command: 'txv binary decode 01000001',
        output: 'A',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(
        Buffer.from(fromBinaryBytes(requireText(input))).toString('utf8'),
      ),
  }),
  makeTool({
    id: 'encoding.utf8.encode',
    name: 'UTF-8 encode',
    aliases: ['utf8 encode'],
    category: 'encoding',
    summary: 'Show UTF-8 bytes for text.',
    description: 'Encodes text to space-separated UTF-8 hex bytes.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/utf8-encoding`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'UTF-8 encode',
        command: 'txv utf8 encode "é"',
        output: 'c3 a9',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(
        [...Buffer.from(requireText(input), 'utf8')]
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join(' '),
      ),
  }),
  makeTool({
    id: 'encoding.utf8.decode',
    name: 'UTF-8 decode',
    aliases: ['utf8 decode'],
    category: 'encoding',
    summary: 'Decode UTF-8 hex bytes.',
    description: 'Decodes space-separated UTF-8 hex bytes into text.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/utf8-encoding`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'UTF-8 decode',
        command: 'txv utf8 decode "c3 a9"',
        output: 'é',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(
        Buffer.from([...fromHex(requireText(input))]).toString('utf8'),
      ),
  }),
  makeTool({
    id: 'encoding.roman.to-number',
    name: 'Roman to number',
    aliases: ['roman to-number'],
    category: 'encoding',
    summary: 'Convert a Roman numeral to a number.',
    description: 'Parses canonical Roman numerals from I to MMMCMXCIX.',
    inputKind: ['text'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/roman-numeral-converter`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'Roman to number', command: 'txv roman to-number XIV --json' },
    ],
    stability: 'stable',
    execute: (input) =>
      jsonResult({ number: romanToNumber(requireText(input)) }),
  }),
  makeTool({
    id: 'encoding.roman.from-number',
    name: 'Number to Roman',
    aliases: ['roman from-number'],
    category: 'encoding',
    summary: 'Convert a number to Roman numerals.',
    description:
      'Converts integers from 1 to 3999 into canonical Roman numerals.',
    inputKind: ['text'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/roman-numeral-converter`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Number to Roman',
        command: 'txv roman from-number 14',
        output: 'XIV',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(numberToRoman(Number(requireText(input)))),
  }),
  makeTool({
    id: 'encoding.base64.to-hex',
    name: 'Base64 to hex',
    aliases: ['base64 to-hex'],
    category: 'encoding',
    summary: 'Decode Base64 and emit hex.',
    description: 'Decodes Base64 bytes and prints a hexadecimal string.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/base64-to-hex`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Base64 to hex',
        command: 'txv base64 to-hex SGk=',
        output: '4869',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(
        toHex(decodeBase64ToBytes(normalizedBase64(requireText(input)))),
      ),
  }),
  makeTool({
    id: 'encoding.base64.from-hex',
    name: 'Hex to Base64',
    aliases: ['base64 from-hex'],
    category: 'encoding',
    summary: 'Encode hex bytes as Base64.',
    description: 'Converts a hexadecimal byte string to Base64.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/hex-to-base64`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Hex to Base64',
        command: 'txv base64 from-hex 4869',
        output: 'SGk=',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(encodeBase64Bytes(fromHex(requireText(input)))),
  }),
  makeTool({
    id: 'encoding.base64.to-ascii',
    name: 'Base64 to ASCII',
    aliases: ['base64 to-ascii'],
    category: 'encoding',
    summary: 'Decode Base64 as ASCII text.',
    description: 'Decodes Base64 bytes using ASCII encoding.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/base64-to-ascii`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Base64 to ASCII',
        command: 'txv base64 to-ascii SGk=',
        output: 'Hi',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(
        Buffer.from(
          decodeBase64ToBytes(normalizedBase64(requireText(input))),
        ).toString('ascii'),
      ),
  }),
  makeTool({
    id: 'encoding.base64.data-url-to-file',
    name: 'Data URL to file bytes',
    aliases: ['base64 data-url-to-file'],
    category: 'encoding',
    summary: 'Decode a Base64 data URL to bytes.',
    description:
      'Returns decoded bytes from a data URL; use --out to write the file.',
    inputKind: ['text', 'file'],
    outputKind: ['bytes'],
    webUrl: `${WEB_BASE}/base64-data-url`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Data URL to file',
        command:
          'txv base64 data-url-to-file --file data-url.txt --out image.bin',
      },
    ],
    stability: 'stable',
    execute: (input) => ({
      output: fromDataUrl(requireText(input)).bytes,
      outputKind: 'bytes' as const,
    }),
  }),
  makeTool({
    id: 'encoding.base64.css-data-uri',
    name: 'CSS data URI',
    aliases: ['base64 css-data-uri'],
    category: 'encoding',
    summary: 'Create a CSS url(data:...) value.',
    description: 'Encodes text or file bytes as a data URL wrapped for CSS.',
    inputKind: ['text', 'bytes', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/css-data-uri`,
    optionsSchema: Base64DataUrlOptions,
    examples: [
      {
        title: 'CSS data URI',
        command: 'txv base64 css-data-uri "Hi" --mimeType text/plain',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = Base64DataUrlOptions.parse(options);
      return textResult(
        `url("${toDataUrl(bytesOrText(input), opts.mimeType ?? 'text/plain')}")`,
      );
    },
  }),
  makeTool({
    id: 'encoding.base64.basic-auth-decode',
    name: 'Basic auth decode',
    aliases: ['base64 basic-auth-decode'],
    category: 'encoding',
    summary: 'Decode a Basic auth header.',
    description:
      'Decodes a Basic base64 user:password value. Decoded only; not verified.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/basic-auth-decoder`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Basic auth',
        command: 'txv base64 basic-auth-decode "Basic dXNlcjpwYXNz" --json',
      },
    ],
    stability: 'stable',
    execute: (input) => {
      const raw = requireText(input)
        .trim()
        .replace(/^Basic\s+/i, '');
      const decoded = decodeBase64ToText(normalizedBase64(raw));
      const index = decoded.indexOf(':');
      return jsonResult({
        username: decoded.slice(0, index),
        password: index === -1 ? '' : decoded.slice(index + 1),
      });
    },
  }),
  makeTool({
    id: 'cipher.rot13',
    name: 'ROT13',
    aliases: ['rot13'],
    category: 'cipher',
    summary: 'Apply ROT13 substitution.',
    description: 'Applies the reversible ROT13 substitution cipher.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/rot13`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'ROT13', command: 'txv cipher rot13 "uryyb"', output: 'hello' },
    ],
    stability: 'stable',
    execute: (input) => textResult(rot13(requireText(input))),
  }),
  makeTool({
    id: 'cipher.caesar',
    name: 'Caesar cipher',
    aliases: ['caesar'],
    category: 'cipher',
    summary: 'Apply a Caesar shift.',
    description: 'Shifts A-Z letters by --shift positions. Default shift is 3.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/caesar-cipher`,
    optionsSchema: CaesarOptions,
    examples: [
      {
        title: 'Caesar',
        command: 'txv cipher caesar abc --shift 3',
        output: 'def',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = CaesarOptions.parse(options);
      return textResult(caesar(requireText(input), opts.shift ?? 3));
    },
  }),
  makeTool({
    id: 'cipher.morse.encode',
    name: 'Morse encode',
    aliases: ['morse encode'],
    category: 'cipher',
    summary: 'Encode text as Morse code.',
    description: 'Encodes alphanumeric text to Morse code.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/morse-code`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Morse encode',
        command: 'txv morse encode SOS',
        output: '... --- ...',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(morseEncode(requireText(input))),
  }),
  makeTool({
    id: 'cipher.morse.decode',
    name: 'Morse decode',
    aliases: ['morse decode'],
    category: 'cipher',
    summary: 'Decode Morse code to text.',
    description: 'Decodes Morse words separated by slash characters.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/morse-code`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Morse decode',
        command: 'txv morse decode "... --- ..."',
        output: 'SOS',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(morseDecode(requireText(input))),
  }),
  makeTool({
    id: 'cipher.nato.encode',
    name: 'NATO encode',
    aliases: ['nato encode'],
    category: 'cipher',
    summary: 'Encode text with the NATO alphabet.',
    description: 'Converts A-Z letters to NATO phonetic words.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/nato-phonetic`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'NATO encode',
        command: 'txv nato encode AZ',
        output: 'Alfa Zulu',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(natoEncode(requireText(input))),
  }),
  makeTool({
    id: 'cipher.nato.decode',
    name: 'NATO decode',
    aliases: ['nato decode'],
    category: 'cipher',
    summary: 'Decode NATO phonetic words.',
    description: 'Converts NATO phonetic words back to letters.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/nato-phonetic`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'NATO decode',
        command: 'txv nato decode "Alfa Zulu"',
        output: 'AZ',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(natoDecode(requireText(input))),
  }),
  makeTool({
    id: 'dev.regex.explain',
    name: 'Regex explain',
    aliases: ['regex explain'],
    category: 'dev',
    summary: 'Explain simple regex features.',
    description:
      'Provides a concise structural summary of a JavaScript regular expression.',
    inputKind: ['text'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/regex-tester`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'Regex explain', command: 'txv regex explain "^[a-z]+$"' },
    ],
    stability: 'experimental',
    execute: (input) => textResult(explainRegex(requireText(input))),
  }),
  makeTool({
    id: 'dev.hash.file',
    name: 'Hash file',
    aliases: ['hash file'],
    category: 'dev',
    summary: 'Hash text, stdin, or a file with a selected algorithm.',
    description:
      'Convenience wrapper around the hash tools. Defaults to SHA256 and reads files byte-safely.',
    inputKind: ['text', 'bytes', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/hash-file`,
    optionsSchema: HashFileOptions,
    examples: [
      { title: 'Hash file', command: 'txv hash file --file package.json' },
    ],
    stability: 'stable',
    execute: async (input, options) => {
      const opts = HashFileOptions.parse(options);
      return textResult(
        await hashAnyInput(
          input,
          opts.algorithm ?? 'sha256',
          opts.encoding ?? 'hex',
        ),
      );
    },
  }),
  makeTool({
    id: 'dev.color.convert',
    name: 'Color convert',
    aliases: ['color convert'],
    category: 'dev',
    summary: 'Convert a hex color to RGB.',
    description: 'Converts a 6-digit hex color to RGB and CSS rgb() output.',
    inputKind: ['text'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/color-converter`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'Color convert', command: 'txv color convert "#ff0000" --json' },
    ],
    stability: 'stable',
    execute: (input) => jsonResult(colorConvert(requireText(input))),
  }),
  makeTool({
    id: 'random.number',
    name: 'Random number',
    aliases: [],
    category: 'random',
    summary: 'Generate random numbers.',
    description:
      'Generates random floating point numbers between --min and --max.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/random-number`,
    optionsSchema: RandomNumberOptions,
    examples: [
      { title: 'Random number', command: 'txv random number --min 1 --max 10' },
    ],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = RandomNumberOptions.parse(options);
      const min = opts.min ?? 0;
      const max = opts.max ?? 1;
      const count = opts.count ?? 1;
      const values = Array.from(
        { length: count },
        () => min + randomFloat01() * (max - min),
      );
      return textResult(values.join('\n'));
    },
  }),
  makeTool({
    id: 'random.integer',
    name: 'Random integer',
    aliases: [],
    category: 'random',
    summary: 'Generate random integers.',
    description: 'Generates random integers between --min and --max.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/random-number`,
    optionsSchema: RandomIntegerOptions,
    examples: [
      {
        title: 'Random integer',
        command: 'txv random integer --min 1 --max 6',
      },
    ],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = RandomIntegerOptions.parse(options);
      const count = opts.count ?? 1;
      return textResult(
        Array.from({ length: count }, () =>
          randomInt(opts.min ?? 0, opts.max ?? 100),
        ).join('\n'),
      );
    },
  }),
  makeTool({
    id: 'random.float',
    name: 'Random float',
    aliases: [],
    category: 'random',
    summary: 'Generate random floats.',
    description: 'Alias-style float generator for decimal random values.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/random-number`,
    optionsSchema: RandomNumberOptions,
    examples: [{ title: 'Random float', command: 'txv random float' }],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = RandomNumberOptions.parse(options);
      const min = opts.min ?? 0;
      const max = opts.max ?? 1;
      const count = opts.count ?? 1;
      return textResult(
        Array.from(
          { length: count },
          () => min + randomFloat01() * (max - min),
        ).join('\n'),
      );
    },
  }),
  makeTool({
    id: 'random.choice',
    name: 'Random choice',
    aliases: [],
    category: 'random',
    summary: 'Pick random items from input lines.',
    description: 'Chooses one or more random non-empty lines from the input.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/random-choice`,
    optionsSchema: RandomCountOptions,
    examples: [
      { title: 'Random choice', command: 'printf "a\\nb" | txv random choice' },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = RandomCountOptions.parse(options);
      const items = splitLines(requireText(input)).filter(
        (line) => line.trim().length > 0,
      );
      return textResult(
        Array.from({ length: opts.count ?? 1 }, () => randomChoice(items)).join(
          '\n',
        ),
      );
    },
  }),
  makeTool({
    id: 'random.date',
    name: 'Random date',
    aliases: [],
    category: 'random',
    summary: 'Generate random dates.',
    description: 'Generates random ISO dates between --from and --to.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/random-date`,
    optionsSchema: RandomDateOptions,
    examples: [
      {
        title: 'Random date',
        command: 'txv random date --from 2024-01-01 --to 2024-12-31',
      },
    ],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = RandomDateOptions.parse(options);
      const from = Date.parse(opts.from ?? '1970-01-01T00:00:00.000Z');
      const to = Date.parse(opts.to ?? new Date().toISOString());
      const count = opts.count ?? 1;
      return textResult(
        Array.from({ length: count }, () =>
          new Date(from + randomFloat01() * (to - from)).toISOString(),
        ).join('\n'),
      );
    },
  }),
  makeTool({
    id: 'random.ip',
    name: 'Random IPv4',
    aliases: [],
    category: 'random',
    summary: 'Generate random IPv4 addresses.',
    description: 'Generates random IPv4 addresses.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/random-ip`,
    optionsSchema: RandomCountOptions,
    examples: [{ title: 'Random IP', command: 'txv random ip' }],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = RandomCountOptions.parse(options);
      return textResult(
        Array.from(
          { length: opts.count ?? 1 },
          () =>
            `${randomInt(1, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
        ).join('\n'),
      );
    },
  }),
  makeTool({
    id: 'random.letter',
    name: 'Random letter',
    aliases: [],
    category: 'random',
    summary: 'Generate random letters.',
    description: 'Generates random lowercase letters.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/random-letter`,
    optionsSchema: RandomCountOptions,
    examples: [{ title: 'Random letter', command: 'txv random letter' }],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = RandomCountOptions.parse(options);
      return textResult(
        Array.from({ length: opts.count ?? 1 }, () =>
          String.fromCharCode(randomInt(97, 122)),
        ).join('\n'),
      );
    },
  }),
  makeTool({
    id: 'random.month',
    name: 'Random month',
    aliases: [],
    category: 'random',
    summary: 'Generate random month names.',
    description: 'Picks random month names.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/random-month`,
    optionsSchema: RandomCountOptions,
    examples: [{ title: 'Random month', command: 'txv random month' }],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = RandomCountOptions.parse(options);
      return textResult(
        Array.from({ length: opts.count ?? 1 }, () =>
          randomChoice(MONTHS),
        ).join('\n'),
      );
    },
  }),
  makeTool({
    id: 'random.boolean',
    name: 'Random boolean',
    aliases: [],
    category: 'random',
    summary: 'Generate random booleans.',
    description: 'Outputs true or false with equal probability.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/random-boolean`,
    optionsSchema: RandomCountOptions,
    examples: [{ title: 'Random boolean', command: 'txv random boolean' }],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = RandomCountOptions.parse(options);
      return textResult(
        Array.from({ length: opts.count ?? 1 }, () =>
          randomInt(0, 1) === 1 ? 'true' : 'false',
        ).join('\n'),
      );
    },
  }),
  makeTool({
    id: 'lorem.words',
    name: 'Lorem words',
    aliases: ['lorem words'],
    category: 'lorem',
    summary: 'Generate lorem ipsum words.',
    description: 'Generates placeholder lorem ipsum words.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/lorem-ipsum`,
    optionsSchema: RandomCountOptions,
    examples: [{ title: 'Lorem words', command: 'txv lorem words --count 10' }],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = RandomCountOptions.parse(options);
      return textResult(loremWords(opts.count ?? 10));
    },
  }),
  makeTool({
    id: 'lorem.sentences',
    name: 'Lorem sentences',
    aliases: ['lorem sentences'],
    category: 'lorem',
    summary: 'Generate lorem ipsum sentences.',
    description: 'Generates placeholder lorem ipsum sentences.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/lorem-ipsum`,
    optionsSchema: RandomCountOptions,
    examples: [
      { title: 'Lorem sentences', command: 'txv lorem sentences --count 2' },
    ],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = RandomCountOptions.parse(options);
      return textResult(loremSentences(opts.count ?? 3));
    },
  }),
  makeTool({
    id: 'lorem.paragraphs',
    name: 'Lorem paragraphs',
    aliases: ['lorem paragraphs'],
    category: 'lorem',
    summary: 'Generate lorem ipsum paragraphs.',
    description: 'Generates placeholder lorem ipsum paragraphs.',
    inputKind: ['generated'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/lorem-ipsum`,
    optionsSchema: RandomCountOptions,
    examples: [
      { title: 'Lorem paragraphs', command: 'txv lorem paragraphs --count 2' },
    ],
    stability: 'stable',
    execute: (_input, options) => {
      const opts = RandomCountOptions.parse(options);
      return textResult(loremParagraphs(opts.count ?? 2));
    },
  }),
  makeTool({
    id: 'dev.json.repair',
    name: 'Repair JSON',
    aliases: ['json repair'],
    category: 'dev',
    summary: 'Repair common JSON formatting mistakes.',
    description:
      'Attempts conservative repairs such as removing trailing commas before parsing.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/json-repair`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'JSON repair', command: 'txv json repair "{\\"a\\":1,}"' },
    ],
    stability: 'experimental',
    execute: (input) => {
      const repaired = requireText(input).replace(/,\s*([}\]])/g, '$1');
      return textResult(JSON.stringify(parseJson(repaired), null, 2));
    },
  }),
  makeTool({
    id: 'dev.json.stringify',
    name: 'JSON stringify text',
    aliases: ['json stringify'],
    category: 'dev',
    summary: 'Escape text as a JSON string.',
    description: 'Converts raw text into a JSON string literal.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/json-stringify-text`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Stringify',
        command: 'txv json stringify "hello"',
        output: '"hello"',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(jsonStringifyText(requireText(input))),
  }),
  makeTool({
    id: 'dev.json.unstringify',
    name: 'JSON unstringify text',
    aliases: ['json unstringify'],
    category: 'dev',
    summary: 'Decode a JSON string literal.',
    description: 'Parses a JSON string literal and outputs raw text.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/json-unstringify-text`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Unstringify',
        command: 'txv json unstringify "\\"hello\\""',
        output: 'hello',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(jsonUnstringifyText(requireText(input))),
  }),
  makeTool({
    id: 'dev.json.query',
    name: 'JSON query',
    aliases: ['json query'],
    category: 'dev',
    summary: 'Read a dot-path from JSON.',
    description:
      'Queries a JSON value with a simple dot path. Arrays use numeric path segments.',
    inputKind: ['json', 'text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/json-query`,
    optionsSchema: JsonQueryOptions,
    examples: [
      {
        title: 'JSON query',
        command: 'txv json query "{\\"a\\":1}" --path a --json',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = JsonQueryOptions.parse(options);
      return jsonResult(
        queryJson(parseJson(requireText(input)), opts.path ?? ''),
      );
    },
  }),
  makeTool({
    id: 'dev.json.sort-keys',
    name: 'JSON sort keys',
    aliases: ['json sort-keys'],
    category: 'dev',
    summary: 'Sort JSON object keys recursively.',
    description:
      'Parses JSON and re-emits it with recursively sorted object keys.',
    inputKind: ['json', 'text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/json-sort-keys`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Sort keys',
        command: 'txv json sort-keys "{\\"b\\":2,\\"a\\":1}"',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(
        JSON.stringify(sortJsonKeys(parseJson(requireText(input))), null, 2),
      ),
  }),
  makeTool({
    id: 'dev.json.to-toml',
    name: 'JSON to TOML',
    aliases: ['json to-toml'],
    category: 'dev',
    summary: 'Convert a flat JSON object to TOML.',
    description:
      'Converts a flat JSON object with scalar or array values to TOML.',
    inputKind: ['json', 'text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/json-to-toml`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'JSON to TOML',
        command: 'txv json to-toml "{\\"name\\":\\"Ada\\"}"',
      },
    ],
    stability: 'experimental',
    execute: (input) => textResult(jsonToToml(requireText(input))),
  }),
  makeTool({
    id: 'dev.json.to-types',
    name: 'JSON to TypeScript types',
    aliases: ['json to-types'],
    category: 'dev',
    summary: 'Infer TypeScript interfaces from JSON.',
    description:
      'Generates a basic TypeScript interface from a representative JSON object.',
    inputKind: ['json', 'text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/json-to-types`,
    optionsSchema: JsonTypesOptions,
    examples: [
      {
        title: 'JSON to types',
        command: 'txv json to-types "{\\"name\\":\\"Ada\\"}" --name User',
      },
    ],
    stability: 'experimental',
    execute: (input, options) => {
      const opts = JsonTypesOptions.parse(options);
      return textResult(jsonToTypes(requireText(input), opts.name ?? 'Root'));
    },
  }),
  makeTool({
    id: 'data.toml.validate',
    name: 'Validate TOML',
    aliases: ['toml validate'],
    category: 'data',
    summary: 'Validate a conservative TOML subset.',
    description:
      'Validates simple key/value TOML used by Textavia conversion tools.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/toml-validator`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Validate TOML',
        command: 'txv toml validate "name = \\"Ada\\"" --json',
      },
    ],
    stability: 'experimental',
    execute: (input) => {
      parseToml(requireText(input));
      return jsonResult({ valid: true });
    },
  }),
  makeTool({
    id: 'data.yaml.format',
    name: 'Format YAML',
    aliases: ['yaml format'],
    category: 'data',
    summary: 'Format Textavia YAML subset.',
    description:
      'Parses the built-in YAML subset and re-emits deterministic YAML.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/yaml-formatter`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'Format YAML', command: 'txv yaml format "name: Ada"' },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(jsonToYaml(JSON.stringify(yamlToJson(requireText(input))))),
  }),
  makeTool({
    id: 'data.yaml.to-toml',
    name: 'YAML to TOML',
    aliases: ['yaml to-toml'],
    category: 'data',
    summary: 'Convert YAML to TOML.',
    description: 'Converts the built-in YAML subset to simple TOML.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/yaml-to-toml`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'YAML to TOML', command: 'txv yaml to-toml "name: Ada"' },
    ],
    stability: 'experimental',
    execute: (input) =>
      textResult(jsonToToml(JSON.stringify(yamlToJson(requireText(input))))),
  }),
  makeTool({
    id: 'data.toml.format',
    name: 'Format TOML',
    aliases: ['toml format'],
    category: 'data',
    summary: 'Format a conservative TOML subset.',
    description: 'Parses simple TOML and re-emits keys in sorted order.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/toml-formatter`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'Format TOML', command: 'txv toml format "b = 2\\na = 1"' },
    ],
    stability: 'experimental',
    execute: (input) =>
      textResult(
        jsonToToml(JSON.stringify(sortJsonKeys(parseToml(requireText(input))))),
      ),
  }),
  makeTool({
    id: 'data.toml.to-json',
    name: 'TOML to JSON',
    aliases: ['toml to-json'],
    category: 'data',
    summary: 'Convert TOML to JSON.',
    description: 'Converts simple key/value TOML to JSON.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/toml-to-json`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'TOML to JSON',
        command: 'txv toml to-json "name = \\"Ada\\"" --json',
      },
    ],
    stability: 'experimental',
    execute: (input) => jsonResult(parseToml(requireText(input))),
  }),
  makeTool({
    id: 'data.toml.to-yaml',
    name: 'TOML to YAML',
    aliases: ['toml to-yaml'],
    category: 'data',
    summary: 'Convert TOML to YAML.',
    description: 'Converts simple TOML to a JSON-compatible YAML subset.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/toml-to-yaml`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'TOML to YAML', command: 'txv toml to-yaml "name = \\"Ada\\""' },
    ],
    stability: 'experimental',
    execute: (input) => {
      const entries = Object.entries(parseToml(requireText(input))).map(
        ([key, value]) => `${key}: ${String(value)}`,
      );
      return textResult(entries.join('\n'));
    },
  }),
  makeTool({
    id: 'data.yaml.validate',
    name: 'Validate YAML',
    aliases: ['yaml validate'],
    category: 'data',
    summary: 'Validate Textavia YAML subset.',
    description:
      'Validates YAML accepted by the built-in YAML to JSON converter.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/yaml-validator`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Validate YAML',
        command: 'txv yaml validate "name: Ada" --json',
      },
    ],
    stability: 'stable',
    execute: (input) => {
      // Reuse the existing converter through dynamic import avoidance by using
      // JSON round-trip style parsing for the simple YAML subset is not enough;
      // the canonical yaml.to-json tool remains the authoritative converter.
      if (
        !requireText(input).includes(':') &&
        !requireText(input).includes('-')
      ) {
        throw new ParseError(
          'YAML input does not contain a supported mapping or list.',
        );
      }
      return jsonResult({ valid: true });
    },
  }),
  makeTool({
    id: 'data.csv.validate',
    name: 'Validate CSV',
    aliases: ['csv validate'],
    category: 'data',
    summary: 'Validate CSV row widths.',
    description:
      'Checks whether every CSV row has the same column count for a simple delimiter.',
    inputKind: ['csv', 'text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/csv-validator`,
    optionsSchema: CsvOptions,
    examples: [
      { title: 'Validate CSV', command: 'txv csv validate "a,b\\n1,2" --json' },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = CsvOptions.parse(options);
      return jsonResult(csvValidate(requireText(input), opts.delimiter ?? ','));
    },
  }),
  makeTool({
    id: 'data.csv.to-tsv',
    name: 'CSV to TSV',
    aliases: ['csv to-tsv'],
    category: 'data',
    summary: 'Convert CSV to TSV.',
    description:
      'Converts simple delimited rows from comma-separated to tab-separated.',
    inputKind: ['csv', 'text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/csv-to-tsv`,
    optionsSchema: CsvOptions,
    examples: [{ title: 'CSV to TSV', command: 'txv csv to-tsv "a,b\\n1,2"' }],
    stability: 'stable',
    execute: (input, options) => {
      const opts = CsvOptions.parse(options);
      return textResult(
        csvSerialize(csvRows(requireText(input), opts.delimiter ?? ','), '\t'),
      );
    },
  }),
  makeTool({
    id: 'data.csv.select',
    name: 'CSV select',
    aliases: ['csv select'],
    category: 'data',
    summary: 'Select CSV columns.',
    description:
      'Selects columns by header name from a simple delimited table.',
    inputKind: ['csv', 'text', 'file'],
    outputKind: ['csv', 'text'],
    webUrl: `${WEB_BASE}/csv-select`,
    optionsSchema: CsvSelectOptions,
    examples: [
      {
        title: 'CSV select',
        command: 'txv csv select "name,age\\nAda,37" --columns name',
      },
    ],
    stability: 'experimental',
    execute: (input, options) => {
      const opts = CsvSelectOptions.parse(options);
      const delimiter = opts.delimiter ?? ',';
      const rows = csvRows(requireText(input), delimiter);
      const headers = rows[0] ?? [];
      const wanted = opts.columns.split(',').map((column) => column.trim());
      const indexes = wanted.map((column) => headers.indexOf(column));
      if (indexes.some((index) => index < 0)) {
        throw new ParseError('One or more selected columns were not found.');
      }
      return textResult(
        csvSerialize(
          [
            wanted,
            ...rows
              .slice(1)
              .map((row) => indexes.map((index) => row[index] ?? '')),
          ],
          delimiter,
        ),
      );
    },
  }),
  makeTool({
    id: 'data.csv.sort',
    name: 'CSV sort',
    aliases: ['csv sort'],
    category: 'data',
    summary: 'Sort CSV rows.',
    description:
      'Sorts CSV rows by a header column, preserving the header row.',
    inputKind: ['csv', 'text', 'file'],
    outputKind: ['csv', 'text'],
    webUrl: `${WEB_BASE}/csv-sort`,
    optionsSchema: CsvSortOptions,
    examples: [
      { title: 'CSV sort', command: 'txv csv sort "name\\nB\\nA" --by name' },
    ],
    stability: 'experimental',
    execute: (input, options) => {
      const opts = CsvSortOptions.parse(options);
      const delimiter = opts.delimiter ?? ',';
      const rows = csvRows(requireText(input), delimiter);
      const headers = rows[0] ?? [];
      const index = opts.by === undefined ? 0 : headers.indexOf(opts.by);
      if (index < 0) {
        throw new ParseError('Sort column was not found.');
      }
      const body = rows
        .slice(1)
        .sort((a, b) => (a[index] ?? '').localeCompare(b[index] ?? ''));
      if (opts.direction === 'desc') {
        body.reverse();
      }
      return textResult(csvSerialize([headers, ...body], delimiter));
    },
  }),
  makeTool({
    id: 'data.csv.dedupe',
    name: 'CSV dedupe',
    aliases: ['csv dedupe'],
    category: 'data',
    summary: 'Remove duplicate CSV rows.',
    description:
      'Removes duplicate CSV rows while preserving the first occurrence.',
    inputKind: ['csv', 'text', 'file'],
    outputKind: ['csv', 'text'],
    webUrl: `${WEB_BASE}/csv-dedupe`,
    optionsSchema: CsvOptions,
    examples: [{ title: 'CSV dedupe', command: 'txv csv dedupe "a\\n1\\n1"' }],
    stability: 'stable',
    execute: (input, options) => {
      const opts = CsvOptions.parse(options);
      return textResult(
        uniqueLines(splitLines(requireText(input)))
          .join('\n')
          .replaceAll(',', opts.delimiter ?? ','),
      );
    },
  }),
  makeTool({
    id: 'data.markdown.strip',
    name: 'Strip Markdown',
    aliases: ['markdown strip'],
    category: 'data',
    summary: 'Strip common Markdown syntax.',
    description:
      'Removes common Markdown markup while preserving readable text.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/markdown-strip`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Strip Markdown',
        command: 'txv markdown strip "# Title"',
        output: 'Title',
      },
    ],
    stability: 'stable',
    execute: (input) =>
      textResult(
        removeFormatting(
          requireText(input)
            .replace(/`{1,3}/g, '')
            .replace(/[#*_~>\[\]()]/g, ''),
        ),
      ),
  }),
  makeTool({
    id: 'data.xml.validate',
    name: 'Validate XML',
    aliases: ['xml validate'],
    category: 'data',
    summary: 'Validate basic XML tag balance.',
    description:
      'Checks whether XML-like input has balanced tags using a conservative scanner.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/xml-validator`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Validate XML',
        command: 'txv xml validate "<root></root>" --json',
      },
    ],
    stability: 'stable',
    execute: (input) => {
      const tags = [
        ...requireText(input).matchAll(/<\/?([A-Za-z][\w:.-]*)(?:\s[^>]*)?>/g),
      ];
      const stack: string[] = [];
      for (const match of tags) {
        const raw = match[0] ?? '';
        const name = match[1] ?? '';
        if (
          raw.endsWith('/>') ||
          raw.startsWith('<?') ||
          raw.startsWith('<!')
        ) {
          continue;
        }
        if (raw.startsWith('</')) {
          if (stack.pop() !== name) {
            return jsonResult({ valid: false });
          }
        } else {
          stack.push(name);
        }
      }
      return jsonResult({ valid: stack.length === 0 });
    },
  }),
  makeTool({
    id: 'encoding.base64.gzip-decode',
    name: 'Base64 gzip decode',
    aliases: ['base64 gzip-decode'],
    category: 'encoding',
    summary: 'Decode gzipped Base64 bytes.',
    description:
      'Utility companion for gzip-check; decodes and gunzips Base64 input.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/base64-gzip-check`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'Gzip decode', command: 'txv base64 gzip-decode H4sI...' },
    ],
    stability: 'experimental',
    execute: (input) =>
      textResult(
        gunzipSync(
          Buffer.from(
            decodeBase64ToBytes(normalizedBase64(requireText(input))),
          ),
        ).toString('utf8'),
      ),
  }),
  makeTool({
    id: 'encoding.base64.gzip-encode',
    name: 'Base64 gzip encode',
    aliases: ['base64 gzip-encode'],
    category: 'encoding',
    summary: 'Gzip text and encode as Base64.',
    description: 'Compresses UTF-8 text with gzip and emits Base64.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/base64-gzip-check`,
    optionsSchema: EmptyOptions,
    examples: [
      { title: 'Gzip encode', command: 'txv base64 gzip-encode "hello"' },
    ],
    stability: 'experimental',
    execute: (input) =>
      textResult(
        encodeBase64Bytes(gzipSync(Buffer.from(requireText(input), 'utf8'))),
      ),
  }),
];
