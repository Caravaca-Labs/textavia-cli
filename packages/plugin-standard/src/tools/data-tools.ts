/**
 * @fileoverview Registry entries for CSV, JSON table, YAML, XML, Markdown,
 * and HTML conversion tools.
 */

import { type TextaviaToolDefinition, requireText } from '@textavia/core';
import { z } from 'zod';
import {
  cleanCsv,
  createMarkdownTable,
  csvToJson,
  csvToMarkdownTable,
  escapeHtml,
  formatXml,
  htmlToMarkdown,
  jsonToCsv,
  jsonToMarkdownTable,
  jsonToYaml,
  markdownTableToCsv,
  markdownTableToJson,
  markdownToHtml,
  stripHtml,
  unescapeHtml,
  xmlToJson,
  yamlToJson,
} from '../transforms/data.js';
import { WEB_BASE, jsonResult, textResult } from './common.js';

const CsvOptions = z.object({
  delimiter: z.string().length(1).optional(),
});

const XmlFormatOptions = z.object({
  indent: z.coerce.number().int().min(0).max(8).optional(),
});

/** Data conversion tools bundled with the standard plugin. */
export const dataTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'data.csv.clean',
    name: 'Clean CSV',
    aliases: ['csv clean'],
    category: 'data',
    summary: 'Trim CSV cells and remove empty rows.',
    description:
      'Parses CSV, trims every cell, drops fully empty rows, and writes deterministic CSV.',
    inputKind: ['csv', 'text', 'file'],
    outputKind: ['csv', 'text'],
    webUrl: `${WEB_BASE}/csv-cleaner`,
    optionsSchema: CsvOptions,
    examples: [{ title: 'Clean CSV', command: 'txv csv clean users.csv' }],
    stability: 'stable',
    execute: (input, options) => {
      const opts = CsvOptions.parse(options);
      return textResult(cleanCsv(requireText(input), opts.delimiter ?? ','));
    },
  },
  {
    id: 'data.csv.to-json',
    name: 'CSV to JSON',
    aliases: ['csv to-json', 'csv-to-json'],
    category: 'data',
    summary: 'Convert header-based CSV to JSON.',
    description:
      'Converts a CSV file with a unique header row into an array of JSON objects.',
    inputKind: ['csv', 'text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/csv-to-json`,
    optionsSchema: CsvOptions,
    examples: [{ title: 'Convert CSV', command: 'txv csv to-json users.csv' }],
    stability: 'stable',
    execute: (input, options) => {
      const opts = CsvOptions.parse(options);
      return jsonResult(csvToJson(requireText(input), opts.delimiter ?? ','));
    },
  },
  {
    id: 'data.csv.to-markdown-table',
    name: 'CSV to Markdown table',
    aliases: ['csv to-markdown-table', 'csv-to-markdown-table'],
    category: 'data',
    summary: 'Convert CSV to a Markdown table.',
    description:
      'Converts CSV rows into a GitHub-flavored Markdown table using the first row as headers.',
    inputKind: ['csv', 'text', 'file'],
    outputKind: ['markdown', 'text'],
    webUrl: `${WEB_BASE}/csv-to-markdown-table`,
    optionsSchema: CsvOptions,
    examples: [
      {
        title: 'CSV to Markdown',
        command: 'txv csv to-markdown-table users.csv --out users.md',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = CsvOptions.parse(options);
      return textResult(
        csvToMarkdownTable(requireText(input), opts.delimiter ?? ','),
      );
    },
  },
  {
    id: 'data.json.to-csv',
    name: 'JSON to CSV',
    aliases: ['json to-csv', 'json-to-csv'],
    category: 'data',
    summary: 'Convert JSON objects to CSV.',
    description:
      'Converts a JSON object or array of objects to deterministic CSV with stable headers.',
    inputKind: ['json', 'text', 'file'],
    outputKind: ['csv', 'text'],
    webUrl: `${WEB_BASE}/json-to-csv`,
    optionsSchema: CsvOptions,
    examples: [{ title: 'JSON to CSV', command: 'txv json to-csv users.json' }],
    stability: 'stable',
    execute: (input, options) => {
      const opts = CsvOptions.parse(options);
      return textResult(jsonToCsv(requireText(input), opts.delimiter ?? ','));
    },
  },
  {
    id: 'data.json.to-yaml',
    name: 'JSON to YAML',
    aliases: ['json to-yaml', 'json-to-yaml'],
    category: 'data',
    summary: 'Convert JSON to YAML.',
    description:
      'Serializes JSON-compatible data to Textavia’s deterministic YAML subset.',
    inputKind: ['json', 'text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/json-to-yaml`,
    optionsSchema: z.object({}),
    examples: [
      { title: 'JSON to YAML', command: 'txv json to-yaml data.json' },
    ],
    stability: 'stable',
    execute: (input) => textResult(jsonToYaml(requireText(input))),
  },
  {
    id: 'data.json.to-markdown-table',
    name: 'JSON to Markdown table',
    aliases: ['json to-markdown-table', 'json-to-markdown-table'],
    category: 'data',
    summary: 'Convert JSON objects to a Markdown table.',
    description:
      'Converts a JSON object or array of objects to a GitHub-flavored Markdown table.',
    inputKind: ['json', 'text', 'file'],
    outputKind: ['markdown', 'text'],
    webUrl: `${WEB_BASE}/json-to-markdown-table`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'JSON to Markdown',
        command: 'txv json to-markdown-table users.json',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(jsonToMarkdownTable(requireText(input))),
  },
  {
    id: 'data.yaml.to-json',
    name: 'YAML to JSON',
    aliases: ['yaml to-json', 'yaml-to-json'],
    category: 'data',
    summary: 'Convert YAML to JSON.',
    description:
      'Parses Textavia’s deterministic YAML subset and returns JSON-compatible data.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/yaml-to-json`,
    optionsSchema: z.object({}),
    examples: [
      { title: 'YAML to JSON', command: 'txv yaml to-json data.yaml' },
    ],
    stability: 'stable',
    execute: (input) => jsonResult(yamlToJson(requireText(input))),
  },
  {
    id: 'data.xml.format',
    name: 'Format XML',
    aliases: ['xml format'],
    category: 'data',
    summary: 'Format XML with indentation.',
    description:
      'Tokenizes XML tags and text, then writes a consistently indented XML document.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/xml-formatter`,
    optionsSchema: XmlFormatOptions,
    examples: [{ title: 'Format XML', command: 'txv xml format data.xml' }],
    stability: 'stable',
    execute: (input, options) => {
      const opts = XmlFormatOptions.parse(options);
      return textResult(formatXml(requireText(input), opts.indent ?? 2));
    },
  },
  {
    id: 'data.xml.to-json',
    name: 'XML to JSON',
    aliases: ['xml to-json', 'xml-to-json'],
    category: 'data',
    summary: 'Convert XML to JSON.',
    description:
      'Converts XML elements, text, and attributes to a deterministic JSON object.',
    inputKind: ['text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/xml-to-json`,
    optionsSchema: z.object({}),
    examples: [{ title: 'XML to JSON', command: 'txv xml to-json data.xml' }],
    stability: 'stable',
    execute: (input) => jsonResult(xmlToJson(requireText(input))),
  },
  {
    id: 'data.markdown.to-html',
    name: 'Markdown to HTML',
    aliases: ['markdown to-html', 'markdown-to-html'],
    category: 'data',
    summary: 'Convert Markdown to HTML.',
    description:
      'Converts a conservative Markdown subset to HTML without network access.',
    inputKind: ['text', 'file'],
    outputKind: ['html', 'text'],
    webUrl: `${WEB_BASE}/markdown-to-html`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Markdown to HTML',
        command: 'txv markdown to-html README.md --out README.html',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(markdownToHtml(requireText(input))),
  },
  {
    id: 'data.html.to-markdown',
    name: 'HTML to Markdown',
    aliases: ['html to-markdown', 'html-to-markdown', 'markdown from-html'],
    category: 'data',
    summary: 'Convert HTML to Markdown.',
    description:
      'Converts common HTML block and inline tags to Markdown and strips unsupported tags.',
    inputKind: ['text', 'file'],
    outputKind: ['markdown', 'text'],
    webUrl: `${WEB_BASE}/html-to-markdown`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'HTML to Markdown',
        command: 'txv html to-markdown page.html --out page.md',
      },
    ],
    stability: 'stable',
    execute: (input) => textResult(htmlToMarkdown(requireText(input))),
  },
  {
    id: 'data.html.escape',
    name: 'HTML escape',
    aliases: ['html escape'],
    category: 'data',
    summary: 'Escape HTML-sensitive characters.',
    description:
      'Escapes ampersands, angle brackets, quotes, and apostrophes for HTML text nodes.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/html-escape`,
    optionsSchema: z.object({}),
    examples: [{ title: 'Escape HTML', command: 'txv html escape "<b>x</b>"' }],
    stability: 'stable',
    execute: (input) => textResult(escapeHtml(requireText(input))),
  },
  {
    id: 'data.html.unescape',
    name: 'HTML unescape',
    aliases: ['html unescape'],
    category: 'data',
    summary: 'Unescape common HTML entities.',
    description:
      'Unescapes the named entities emitted by Textavia HTML escape.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/html-unescape`,
    optionsSchema: z.object({}),
    examples: [
      { title: 'Unescape HTML', command: 'txv html unescape "&lt;b&gt;"' },
    ],
    stability: 'stable',
    execute: (input) => textResult(unescapeHtml(requireText(input))),
  },
  {
    id: 'data.html.strip',
    name: 'HTML strip',
    aliases: ['html strip', 'text strip-html'],
    category: 'data',
    summary: 'Remove HTML tags.',
    description:
      'Removes HTML tags and script/style blocks while preserving text content.',
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/strip-html`,
    optionsSchema: z.object({}),
    examples: [{ title: 'Strip HTML', command: 'txv html strip page.html' }],
    stability: 'stable',
    execute: (input) => textResult(stripHtml(requireText(input))),
  },
  {
    id: 'data.markdown.table-to-json',
    name: 'Markdown table to JSON',
    aliases: ['markdown table-to-json', 'table markdown-to-json'],
    category: 'data',
    summary: 'Convert a Markdown table to JSON.',
    description:
      'Parses a GitHub-flavored Markdown table and emits JSON objects keyed by header.',
    inputKind: ['table', 'text', 'file'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/markdown-table-to-json`,
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Markdown table to JSON',
        command: 'txv markdown table-to-json table.md',
      },
    ],
    stability: 'stable',
    execute: (input) => jsonResult(markdownTableToJson(requireText(input))),
  },
  {
    id: 'data.markdown.table-to-csv',
    name: 'Markdown table to CSV',
    aliases: ['markdown table-to-csv', 'table markdown-to-csv'],
    category: 'data',
    summary: 'Convert a Markdown table to CSV.',
    description:
      'Parses a GitHub-flavored Markdown table and emits deterministic CSV.',
    inputKind: ['table', 'text', 'file'],
    outputKind: ['csv', 'text'],
    webUrl: `${WEB_BASE}/markdown-table-to-csv`,
    optionsSchema: CsvOptions,
    examples: [
      {
        title: 'Markdown table to CSV',
        command: 'txv markdown table-to-csv table.md',
      },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = CsvOptions.parse(options);
      return textResult(
        markdownTableToCsv(requireText(input), opts.delimiter ?? ','),
      );
    },
  },
  {
    id: 'data.markdown.table-create',
    name: 'Create Markdown table',
    aliases: ['markdown table-create', 'table create'],
    category: 'data',
    summary: 'Create a Markdown table from JSON or CSV.',
    description:
      'Creates a GitHub-flavored Markdown table from JSON object rows or CSV rows.',
    inputKind: ['json', 'csv', 'text', 'file'],
    outputKind: ['markdown', 'text'],
    webUrl: `${WEB_BASE}/markdown-table-generator`,
    optionsSchema: CsvOptions,
    examples: [
      { title: 'Create table', command: 'txv table create users.csv' },
    ],
    stability: 'stable',
    execute: (input, options) => {
      const opts = CsvOptions.parse(options);
      return textResult(
        createMarkdownTable(requireText(input), opts.delimiter ?? ','),
      );
    },
  },
];
