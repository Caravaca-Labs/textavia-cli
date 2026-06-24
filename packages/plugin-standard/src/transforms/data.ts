/**
 * @fileoverview Data, markup, and developer utility transforms.
 *
 * These implementations intentionally avoid heavy dependencies in the standard
 * plugin. YAML and XML support cover deterministic, documented subsets and
 * throw parse errors for malformed or unsupported input instead of guessing.
 */

import { ParseError, TransformError } from '@textavia/core';
import { parseJson } from './json.js';

/** Parsed markdown table structure. */
export interface MarkdownTable {
  readonly headers: readonly string[];
  readonly rows: readonly string[][];
}

/** Parsed XML node shape emitted by the lightweight XML parser. */
export interface XmlNode {
  readonly name: string;
  readonly attributes: Readonly<Record<string, string>>;
  readonly children: readonly XmlNode[];
  readonly text: readonly string[];
}

/** Parses RFC-4180-style CSV with configurable delimiter. */
export function parseCsv(input: string, delimiter = ','): string[][] {
  if (delimiter.length !== 1) {
    throw new ParseError('CSV delimiter must be exactly one character.');
  }
  if (input.length === 0) {
    return [];
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  let afterQuote = false;

  function pushCell(): void {
    row.push(cell);
    cell = '';
    afterQuote = false;
  }

  function pushRow(): void {
    pushCell();
    rows.push(row);
    row = [];
  }

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === undefined) {
      continue;
    }

    if (inQuotes) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (afterQuote && char !== delimiter && char !== '\n' && char !== '\r') {
      throw new ParseError('Malformed CSV: unexpected content after quote.');
    }

    if (char === '"') {
      if (cell.length !== 0) {
        throw new ParseError('Malformed CSV: quote must start a cell.');
      }
      inQuotes = true;
      continue;
    }

    if (char === delimiter) {
      pushCell();
      continue;
    }

    if (char === '\n') {
      pushRow();
      continue;
    }

    if (char === '\r') {
      if (input[index + 1] === '\n') {
        index += 1;
      }
      pushRow();
      continue;
    }

    cell += char;
  }

  if (inQuotes) {
    throw new ParseError('Malformed CSV: unclosed quoted cell.');
  }

  if (cell.length > 0 || row.length > 0) {
    pushCell();
    rows.push(row);
  }

  return rows;
}

/** Serializes rows to CSV with stable quoting rules. */
export function serializeCsv(
  rows: readonly (readonly unknown[])[],
  delimiter = ',',
): string {
  if (delimiter.length !== 1) {
    throw new ParseError('CSV delimiter must be exactly one character.');
  }
  return rows
    .map((row) =>
      row.map((cell) => escapeCsvCell(cell, delimiter)).join(delimiter),
    )
    .join('\n');
}

/** Cleans CSV by trimming cells and dropping fully empty rows. */
export function cleanCsv(input: string, delimiter = ','): string {
  const rows = parseCsv(input, delimiter)
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell.length > 0));
  return serializeCsv(rows, delimiter);
}

/** Converts CSV with a header row into JSON objects. */
export function csvToJson(
  input: string,
  delimiter = ',',
): Record<string, string>[] {
  const rows = parseCsv(input, delimiter).filter((row) =>
    row.some((cell) => cell.length > 0),
  );
  if (rows.length === 0) {
    return [];
  }
  const headers = rows[0];
  if (headers === undefined || headers.length === 0) {
    throw new ParseError('CSV must include a header row.');
  }
  assertUniqueHeaders(headers, 'CSV');
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? '';
    });
    return record;
  });
}

/** Converts JSON array/object data to CSV. */
export function jsonToCsv(input: string, delimiter = ','): string {
  const rows = jsonToObjectRows(input);
  if (rows.length === 0) {
    return '';
  }
  const headers = collectHeaders(rows);
  return serializeCsv(
    [
      headers,
      ...rows.map((row) =>
        headers.map((header) => jsonCellToString(row[header])),
      ),
    ],
    delimiter,
  );
}

/** Converts CSV with headers into a markdown table. */
export function csvToMarkdownTable(input: string, delimiter = ','): string {
  const rows = parseCsv(input, delimiter).filter((row) =>
    row.some((cell) => cell.length > 0),
  );
  if (rows.length === 0) {
    return '';
  }
  const headers = rows[0] ?? [];
  assertUniqueHeaders(headers, 'CSV');
  return markdownTableFromRows(headers, rows.slice(1));
}

/** Converts JSON array/object data into a markdown table. */
export function jsonToMarkdownTable(input: string): string {
  const rows = jsonToObjectRows(input);
  if (rows.length === 0) {
    return '';
  }
  const headers = collectHeaders(rows);
  return markdownTableFromRows(
    headers,
    rows.map((row) => headers.map((header) => jsonCellToString(row[header]))),
  );
}

/** Parses a GitHub-flavored markdown table. */
export function parseMarkdownTable(input: string): MarkdownTable {
  const tableLines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes('|') && line.length > 0);
  if (tableLines.length < 2) {
    throw new ParseError('Markdown table must include a header and separator.');
  }

  const headers = splitMarkdownRow(tableLines[0] ?? '');
  const separator = splitMarkdownRow(tableLines[1] ?? '');
  if (
    headers.length === 0 ||
    separator.length !== headers.length ||
    !separator.every((cell) => /^:?-{3,}:?$/.test(cell.trim()))
  ) {
    throw new ParseError('Markdown table separator row is invalid.');
  }
  assertUniqueHeaders(headers, 'Markdown table');

  const rows = tableLines.slice(2).map((line) => {
    const row = splitMarkdownRow(line);
    return headers.map((_, index) => row[index] ?? '');
  });
  return { headers, rows };
}

/** Converts a markdown table to JSON objects. */
export function markdownTableToJson(input: string): Record<string, string>[] {
  const table = parseMarkdownTable(input);
  return table.rows.map((row) => {
    const record: Record<string, string> = {};
    table.headers.forEach((header, index) => {
      record[header] = row[index] ?? '';
    });
    return record;
  });
}

/** Converts a markdown table to CSV. */
export function markdownTableToCsv(input: string, delimiter = ','): string {
  const table = parseMarkdownTable(input);
  return serializeCsv([table.headers, ...table.rows], delimiter);
}

/** Creates a markdown table from JSON or CSV input. */
export function createMarkdownTable(input: string, delimiter = ','): string {
  const trimmed = input.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return jsonToMarkdownTable(trimmed);
  }
  return csvToMarkdownTable(input, delimiter);
}

/** Serializes JSON-compatible data to a deterministic YAML subset. */
export function jsonToYaml(input: string): string {
  return valueToYaml(parseJson(input), 0);
}

/** Parses the deterministic YAML subset emitted by {@link jsonToYaml}. */
export function yamlToJson(input: string): unknown {
  const lines = input
    .split(/\r?\n/)
    .map((raw) => ({ indent: countIndent(raw), text: raw.trim() }))
    .filter((line) => line.text.length > 0 && !line.text.startsWith('#'));
  if (lines.length === 0) {
    return null;
  }
  const result = parseYamlBlock(lines, 0, lines[0]?.indent ?? 0);
  if (result.next !== lines.length) {
    throw new ParseError('Unsupported YAML structure.');
  }
  return result.value;
}

/** Formats XML by tokenizing tags and indenting nested elements. */
export function formatXml(input: string, indent = 2): string {
  const tokens = tokenizeXml(input);
  let depth = 0;
  const lines: string[] = [];
  for (const token of tokens) {
    if (token.type === 'text') {
      const text = token.value.trim();
      if (text.length > 0) {
        lines.push(`${' '.repeat(depth * indent)}${text}`);
      }
      continue;
    }
    if (token.value.startsWith('</')) {
      depth = Math.max(0, depth - 1);
    }
    lines.push(`${' '.repeat(depth * indent)}${token.value}`);
    if (isOpeningXmlTag(token.value)) {
      depth += 1;
    }
  }
  return lines.join('\n');
}

/** Converts simple XML into a JSON object preserving attributes and text. */
export function xmlToJson(input: string): Record<string, unknown> {
  const root = parseXml(input);
  return { [root.name]: xmlNodeToJson(root) };
}

/** Converts a conservative markdown subset to HTML. */
export function markdownToHtml(input: string): string {
  const lines = input.split(/\r?\n/);
  const html: string[] = [];
  let inList = false;
  let inCode = false;
  const codeLines: string[] = [];

  function closeList(): void {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        html.push(
          `<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`,
        );
        codeLines.length = 0;
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${escapeHtml(line.replace(/^\s*[-*]\s+/, ''))}</li>`);
      continue;
    }
    closeList();
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading !== null) {
      const level = heading[1]?.length ?? 1;
      html.push(`<h${level}>${escapeHtml(heading[2] ?? '')}</h${level}>`);
    } else if (line.trim().length > 0) {
      html.push(`<p>${escapeHtml(line.trim())}</p>`);
    }
  }
  if (inCode) {
    throw new ParseError('Markdown code fence is not closed.');
  }
  closeList();
  return html.join('\n');
}

/** Converts common HTML block tags to markdown and strips unsupported tags. */
export function htmlToMarkdown(input: string): string {
  return unescapeHtml(input)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gis, (_match, level, text) => {
      return `${'#'.repeat(Number(level))} ${stripHtml(String(text)).trim()}\n\n`;
    })
    .replace(/<li[^>]*>(.*?)<\/li>/gis, (_match, text) => {
      return `- ${stripHtml(String(text)).trim()}\n`;
    })
    .replace(/<\/?(ul|ol)[^>]*>/gi, '')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gis, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gis, '*$1*')
    .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis, '[$2]($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Escapes HTML-sensitive characters. */
export function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Unescapes the named entities emitted by {@link escapeHtml}. */
export function unescapeHtml(input: string): string {
  return input
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&gt;', '>')
    .replaceAll('&lt;', '<')
    .replaceAll('&amp;', '&');
}

/** Removes HTML tags while preserving text. */
export function stripHtml(input: string): string {
  return unescapeHtml(
    input
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ''),
  );
}

/** Decodes a JWT without verifying its signature. */
export function decodeJwt(input: string): {
  header: unknown;
  payload: unknown;
  signaturePresent: boolean;
  verified: false;
} {
  const parts = input.trim().split('.');
  if (parts.length !== 3) {
    throw new ParseError(
      'JWT must contain header, payload, and signature parts.',
    );
  }
  return {
    header: parseBase64UrlJson(parts[0] ?? ''),
    payload: parseBase64UrlJson(parts[1] ?? ''),
    signaturePresent: (parts[2] ?? '').length > 0,
    verified: false,
  };
}

/** Builds a human-readable explanation for a five-field cron expression. */
export function explainCron(expression: string): string {
  const fields = parseCron(expression);
  return [
    `minute ${describeCronField(fields.minute, 0, 59)}`,
    `hour ${describeCronField(fields.hour, 0, 23)}`,
    `day-of-month ${describeCronField(fields.dayOfMonth, 1, 31)}`,
    `month ${describeCronField(fields.month, 1, 12)}`,
    `day-of-week ${describeCronField(fields.dayOfWeek, 0, 6)}`,
  ].join(', ');
}

/** Finds upcoming run times for a five-field cron expression. */
export function nextCronRuns(
  expression: string,
  count: number,
  from = new Date(),
): string[] {
  const fields = parseCron(expression);
  const runs: string[] = [];
  const cursor = new Date(from.getTime());
  cursor.setUTCSeconds(0, 0);
  cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  const maxChecks = 366 * 24 * 60;
  for (
    let checked = 0;
    checked < maxChecks && runs.length < count;
    checked += 1
  ) {
    if (cronMatches(fields, cursor)) {
      runs.push(cursor.toISOString());
    }
    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  }
  if (runs.length < count) {
    throw new TransformError(
      'Cron expression produced no run within one year.',
    );
  }
  return runs;
}

/** Computes WCAG contrast details for two hex colors. */
export function colorContrast(
  foreground: string,
  background: string,
): {
  ratio: number;
  aaText: boolean;
  aaLargeText: boolean;
  aaaText: boolean;
  aaaLargeText: boolean;
} {
  const ratio = contrastRatio(
    parseHexColor(foreground),
    parseHexColor(background),
  );
  return {
    ratio: Number(ratio.toFixed(2)),
    aaText: ratio >= 4.5,
    aaLargeText: ratio >= 3,
    aaaText: ratio >= 7,
    aaaLargeText: ratio >= 4.5,
  };
}

/** Builds a URL with UTM parameters. */
export function buildUtmUrl(
  baseUrl: string,
  params: Readonly<Record<string, string | undefined>>,
): string {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch (error) {
    throw new ParseError('UTM base URL is invalid.', { cause: error });
  }
  const mapping: Record<string, string> = {
    source: 'utm_source',
    medium: 'utm_medium',
    campaign: 'utm_campaign',
    term: 'utm_term',
    content: 'utm_content',
  };
  for (const [option, queryName] of Object.entries(mapping)) {
    const value = params[option];
    if (value !== undefined && value.length > 0) {
      url.searchParams.set(queryName, value);
    }
  }
  return url.toString();
}

function escapeCsvCell(value: unknown, delimiter: string): string {
  const text = jsonCellToString(value);
  return text.includes(delimiter) ||
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r')
    ? `"${text.replaceAll('"', '""')}"`
    : text;
}

function assertUniqueHeaders(headers: readonly string[], source: string): void {
  const seen = new Set<string>();
  for (const header of headers) {
    if (header.length === 0) {
      throw new ParseError(`${source} headers must not be empty.`);
    }
    if (seen.has(header)) {
      throw new ParseError(`${source} contains duplicate header: ${header}`);
    }
    seen.add(header);
  }
}

function jsonToObjectRows(input: string): Record<string, unknown>[] {
  const parsed = parseJson(input);
  const values = Array.isArray(parsed) ? parsed : [parsed];
  return values.map((value) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      throw new ParseError('JSON table conversion requires objects.');
    }
    return value as Record<string, unknown>;
  });
}

function collectHeaders(rows: readonly Record<string, unknown>[]): string[] {
  const headers: string[] = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!headers.includes(key)) {
        headers.push(key);
      }
    }
  }
  return headers;
}

function jsonCellToString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

function markdownTableFromRows(
  headers: readonly string[],
  rows: readonly (readonly unknown[])[],
): string {
  const header = `| ${headers.map(escapeMarkdownCell).join(' | ')} |`;
  const separator = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map(
    (row) =>
      `| ${headers.map((_, index) => escapeMarkdownCell(row[index] ?? '')).join(' | ')} |`,
  );
  return [header, separator, ...body].join('\n');
}

function splitMarkdownRow(line: string): string[] {
  const trimmed = line.replace(/^\|/, '').replace(/\|$/, '');
  const cells: string[] = [];
  let cell = '';
  let escaped = false;
  for (const char of trimmed) {
    if (escaped) {
      cell += char;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '|') {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function escapeMarkdownCell(value: unknown): string {
  return jsonCellToString(value).replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
}

function valueToYaml(value: unknown, indent: number): string {
  const space = ' '.repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    return value
      .map((item) =>
        isScalar(item)
          ? `${space}- ${yamlScalar(item)}`
          : `${space}-\n${valueToYaml(item, indent + 2)}`,
      )
      .join('\n');
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return '{}';
    }
    return entries
      .map(([key, item]) =>
        isScalar(item)
          ? `${space}${key}: ${yamlScalar(item)}`
          : `${space}${key}:\n${valueToYaml(item, indent + 2)}`,
      )
      .join('\n');
  }
  return `${space}${yamlScalar(value)}`;
}

function isScalar(value: unknown): boolean {
  return (
    value === null || ['string', 'number', 'boolean'].includes(typeof value)
  );
}

function yamlScalar(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  const text = String(value);
  return /^[a-zA-Z0-9_.@/-]+$/.test(text) ? text : JSON.stringify(text);
}

interface YamlLine {
  readonly indent: number;
  readonly text: string;
}

function parseYamlBlock(
  lines: readonly YamlLine[],
  start: number,
  indent: number,
): { value: unknown; next: number } {
  const first = lines[start];
  if (first === undefined || first.indent !== indent) {
    throw new ParseError('Invalid YAML indentation.');
  }

  if (first.text.startsWith('-')) {
    const values: unknown[] = [];
    let index = start;
    while (index < lines.length) {
      const line = lines[index];
      if (
        line === undefined ||
        line.indent !== indent ||
        !line.text.startsWith('-')
      ) {
        break;
      }
      const rest = line.text.slice(1).trim();
      if (rest.length > 0) {
        values.push(parseYamlScalar(rest));
        index += 1;
      } else {
        const child = parseYamlBlock(lines, index + 1, indent + 2);
        values.push(child.value);
        index = child.next;
      }
    }
    return { value: values, next: index };
  }

  const object: Record<string, unknown> = {};
  let index = start;
  while (index < lines.length) {
    const line = lines[index];
    if (
      line === undefined ||
      line.indent !== indent ||
      line.text.startsWith('-')
    ) {
      break;
    }
    const colon = line.text.indexOf(':');
    if (colon <= 0) {
      throw new ParseError(`Invalid YAML mapping entry: ${line.text}`);
    }
    const key = line.text.slice(0, colon).trim();
    const rest = line.text.slice(colon + 1).trim();
    if (rest.length > 0) {
      object[key] = parseYamlScalar(rest);
      index += 1;
    } else {
      const child = parseYamlBlock(lines, index + 1, indent + 2);
      object[key] = child.value;
      index = child.next;
    }
  }
  return { value: object, next: index };
}

function parseYamlScalar(text: string): unknown {
  if (text === 'null') {
    return null;
  }
  if (text === 'true') {
    return true;
  }
  if (text === 'false') {
    return false;
  }
  if (/^-?\d+(?:\.\d+)?$/.test(text)) {
    return Number(text);
  }
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return JSON.parse(text.startsWith("'") ? `"${text.slice(1, -1)}"` : text);
  }
  if (text === '[]') {
    return [];
  }
  if (text === '{}') {
    return {};
  }
  return text;
}

function countIndent(line: string): number {
  return line.match(/^ */)?.[0].length ?? 0;
}

type XmlToken =
  | { readonly type: 'tag'; readonly value: string }
  | { readonly type: 'text'; readonly value: string };

function tokenizeXml(input: string): XmlToken[] {
  const tokens: XmlToken[] = [];
  const matches = input.matchAll(/(<[^>]+>|[^<]+)/g);
  for (const match of matches) {
    const value = match[0];
    tokens.push({
      type: value.startsWith('<') ? 'tag' : 'text',
      value,
    });
  }
  if (tokens.length === 0) {
    throw new ParseError('XML input is empty.');
  }
  return tokens;
}

function isOpeningXmlTag(tag: string): boolean {
  return (
    !tag.startsWith('</') &&
    !tag.endsWith('/>') &&
    !tag.startsWith('<?') &&
    !tag.startsWith('<!--') &&
    !tag.startsWith('<!')
  );
}

function parseXml(input: string): XmlNode {
  const stack: Array<{
    name: string;
    attributes: Record<string, string>;
    children: XmlNode[];
    text: string[];
  }> = [];
  let root: XmlNode | undefined;

  for (const token of tokenizeXml(input)) {
    if (token.type === 'text') {
      const text = token.value.trim();
      if (text.length > 0) {
        currentXml(stack).text.push(text);
      }
      continue;
    }
    const tag = token.value;
    if (
      tag.startsWith('<?') ||
      tag.startsWith('<!--') ||
      tag.startsWith('<!')
    ) {
      continue;
    }
    if (tag.startsWith('</')) {
      const name = tag.slice(2, -1).trim();
      const node = stack.pop();
      if (node === undefined || node.name !== name) {
        throw new ParseError(`XML closing tag does not match: ${name}`);
      }
      const finalized: XmlNode = {
        name: node.name,
        attributes: node.attributes,
        children: node.children,
        text: node.text,
      };
      if (stack.length === 0) {
        root = finalized;
      } else {
        currentXml(stack).children.push(finalized);
      }
      continue;
    }
    const parsed = parseXmlTag(tag);
    if (parsed.selfClosing) {
      const node: XmlNode = {
        name: parsed.name,
        attributes: parsed.attributes,
        children: [],
        text: [],
      };
      if (stack.length === 0) {
        root = node;
      } else {
        currentXml(stack).children.push(node);
      }
    } else {
      stack.push({
        name: parsed.name,
        attributes: parsed.attributes,
        children: [],
        text: [],
      });
    }
  }

  if (stack.length > 0) {
    throw new ParseError(`XML tag is not closed: ${stack.at(-1)?.name ?? ''}`);
  }
  if (root === undefined) {
    throw new ParseError('XML root element was not found.');
  }
  return root;
}

function currentXml(
  stack: Array<{
    name: string;
    attributes: Record<string, string>;
    children: XmlNode[];
    text: string[];
  }>,
) {
  const node = stack.at(-1);
  if (node === undefined) {
    throw new ParseError('XML text cannot appear outside the root element.');
  }
  return node;
}

function parseXmlTag(tag: string): {
  name: string;
  attributes: Record<string, string>;
  selfClosing: boolean;
} {
  const inner = tag.slice(1, tag.endsWith('/>') ? -2 : -1).trim();
  const name = /^[^\s/>]+/.exec(inner)?.[0];
  if (name === undefined) {
    throw new ParseError(`Invalid XML tag: ${tag}`);
  }
  const attributes: Record<string, string> = {};
  const attrSource = inner.slice(name.length);
  for (const match of attrSource.matchAll(
    /([A-Za-z_:][\w:.-]*)=(["'])(.*?)\2/g,
  )) {
    const key = match[1];
    const value = match[3];
    if (key !== undefined && value !== undefined) {
      attributes[key] = unescapeHtml(value);
    }
  }
  return { name, attributes, selfClosing: tag.endsWith('/>') };
}

function xmlNodeToJson(node: XmlNode): unknown {
  const output: Record<string, unknown> = {};
  if (Object.keys(node.attributes).length > 0) {
    output['@attributes'] = node.attributes;
  }
  const text = node.text.join(' ').trim();
  if (text.length > 0) {
    output['#text'] = text;
  }
  for (const child of node.children) {
    const value = xmlNodeToJson(child);
    const existing = output[child.name];
    if (existing === undefined) {
      output[child.name] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      output[child.name] = [existing, value];
    }
  }
  const keys = Object.keys(output);
  return keys.length === 1 && keys[0] === '#text' ? output['#text'] : output;
}

function parseBase64UrlJson(value: string): unknown {
  try {
    const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch (error) {
    throw new ParseError('JWT contains invalid Base64URL JSON.', {
      cause: error,
    });
  }
}

interface CronFields {
  readonly minute: Set<number>;
  readonly hour: Set<number>;
  readonly dayOfMonth: Set<number>;
  readonly month: Set<number>;
  readonly dayOfWeek: Set<number>;
}

function parseCron(expression: string): CronFields {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new ParseError('Cron expression must have exactly five fields.');
  }
  return {
    minute: parseCronField(parts[0] ?? '', 0, 59),
    hour: parseCronField(parts[1] ?? '', 0, 23),
    dayOfMonth: parseCronField(parts[2] ?? '', 1, 31),
    month: parseCronField(parts[3] ?? '', 1, 12),
    dayOfWeek: parseCronField(parts[4] ?? '', 0, 6),
  };
}

function parseCronField(field: string, min: number, max: number): Set<number> {
  const values = new Set<number>();
  for (const part of field.split(',')) {
    if (part === '*') {
      for (let value = min; value <= max; value += 1) {
        values.add(value);
      }
      continue;
    }
    const stepMatch = /^\*\/(\d+)$/.exec(part);
    if (stepMatch !== null) {
      const step = Number(stepMatch[1]);
      if (!Number.isInteger(step) || step <= 0) {
        throw new ParseError(`Invalid cron step: ${part}`);
      }
      for (let value = min; value <= max; value += step) {
        values.add(value);
      }
      continue;
    }
    const rangeMatch = /^(\d+)-(\d+)$/.exec(part);
    if (rangeMatch !== null) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      validateCronValue(start, min, max, part);
      validateCronValue(end, min, max, part);
      if (start > end) {
        throw new ParseError(`Invalid cron range: ${part}`);
      }
      for (let value = start; value <= end; value += 1) {
        values.add(value);
      }
      continue;
    }
    const value = Number(part);
    validateCronValue(value, min, max, part);
    values.add(value);
  }
  return values;
}

function validateCronValue(
  value: number,
  min: number,
  max: number,
  source: string,
): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ParseError(`Invalid cron field value: ${source}`);
  }
}

function describeCronField(
  values: Set<number>,
  min: number,
  max: number,
): string {
  if (values.size === max - min + 1) {
    return 'every value';
  }
  const sorted = Array.from(values).sort((a, b) => a - b);
  return sorted.join(',');
}

function cronMatches(fields: CronFields, date: Date): boolean {
  return (
    fields.minute.has(date.getUTCMinutes()) &&
    fields.hour.has(date.getUTCHours()) &&
    fields.dayOfMonth.has(date.getUTCDate()) &&
    fields.month.has(date.getUTCMonth() + 1) &&
    fields.dayOfWeek.has(date.getUTCDay())
  );
}

function parseHexColor(value: string): [number, number, number] {
  const normalized = value.trim().replace(/^#/, '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    throw new ParseError(`Invalid hex color: ${value}`);
  }
  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ];
}

function contrastRatio(
  foreground: [number, number, number],
  background: [number, number, number],
): number {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance([red, green, blue]: [
  number,
  number,
  number,
]): number {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  if (r === undefined || g === undefined || b === undefined) {
    throw new TransformError('Unable to compute color luminance.');
  }
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
