/**
 * @fileoverview Optional spreadsheet import/export plugin.
 */

import {
  NetworkRequiredError,
  ParseError,
  type ResolvedInput,
  type TextaviaToolDefinition,
  type ToolRegistry,
  requireText,
} from '@textavia/core';
import * as XLSX from 'xlsx';
import { z } from 'zod';

const DATA_PLUGIN = '@textavia/plugin-data';
const WEB_BASE = 'https://textavia.com/tools';
const EmptyOptions = z.object({});
const SheetOptions = z.object({
  sheet: z.string().optional(),
});

function json(output: unknown) {
  return { output, outputKind: 'json' as const };
}

function text(output: string) {
  return { output, outputKind: 'text' as const };
}

function bytes(input: ResolvedInput): Uint8Array {
  if (input.bytes !== undefined) {
    return input.bytes;
  }
  if (input.text !== undefined) {
    return Buffer.from(input.text, 'utf8');
  }
  throw new ParseError('Spreadsheet input requires --file or text input.');
}

function workbook(input: ResolvedInput): XLSX.WorkBook {
  return XLSX.read(Buffer.from(bytes(input)), { type: 'buffer' });
}

function worksheet(wb: XLSX.WorkBook, requested?: string): XLSX.WorkSheet {
  const name = requested ?? wb.SheetNames[0];
  if (name === undefined) {
    throw new ParseError('Workbook does not contain any sheets.');
  }
  const ws = wb.Sheets[name];
  if (ws === undefined) {
    throw new ParseError(`Workbook sheet not found: ${name}`);
  }
  return ws;
}

function markdownTable(rows: readonly (readonly unknown[])[]): string {
  if (rows.length === 0) {
    return '';
  }
  const headers = (rows[0] ?? []).map(String);
  const body = rows.slice(1);
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...body.map(
      (row) =>
        `| ${headers.map((_, index) => String(row[index] ?? '')).join(' | ')} |`,
    ),
  ].join('\n');
}

function parseCsv(csv: string): string[][] {
  return csv
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(','));
}

function csvToJson(csv: string): Record<string, string>[] {
  const rows = parseCsv(csv);
  const headers = rows[0] ?? [];
  return rows
    .slice(1)
    .map((row) =>
      Object.fromEntries(
        headers.map((header, index) => [header, row[index] ?? '']),
      ),
    );
}

function sheetsCsvUrl(input: string): string {
  const trimmed = input.trim();
  const idMatch = /\/spreadsheets\/d\/([^/]+)/.exec(trimmed);
  const gidMatch = /[#&?]gid=([0-9]+)/.exec(trimmed);
  const id = idMatch?.[1] ?? trimmed;
  if (!/^[A-Za-z0-9-_]+$/.test(id)) {
    throw new ParseError(
      'Google Sheets input must be a spreadsheet URL or id.',
    );
  }
  const gid = gidMatch?.[1];
  const params = new URLSearchParams({ format: 'csv' });
  if (gid !== undefined) {
    params.set('gid', gid);
  }
  return `https://docs.google.com/spreadsheets/d/${id}/export?${params.toString()}`;
}

async function fetchSheetCsv(
  input: string,
  allowNetwork: boolean,
): Promise<string> {
  if (!allowNetwork) {
    throw new NetworkRequiredError(
      'Google Sheets tools require network access.',
      {
        hint: 'Re-run with --allow-network.',
      },
    );
  }
  const response = await fetch(sheetsCsvUrl(input));
  if (!response.ok) {
    throw new ParseError(
      `Google Sheets export failed with HTTP ${response.status}.`,
    );
  }
  return response.text();
}

export const dataTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'data.excel.info',
    name: 'Excel info',
    aliases: ['excel info'],
    category: 'data',
    summary: 'Inspect an Excel workbook.',
    description:
      'Reports workbook sheet names and dimensions using the optional data plugin.',
    inputKind: ['file', 'bytes'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/excel-info`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Excel info',
        command: 'txv excel info --file workbook.xlsx --json',
      },
    ],
    stability: 'stable',
    requiresOptionalPlugin: DATA_PLUGIN,
    requiresFilesystem: true,
    execute: (input) => {
      const wb = workbook(input);
      return json({
        sheets: wb.SheetNames.map((name) => ({
          name,
          range: wb.Sheets[name]?.['!ref'] ?? null,
        })),
      });
    },
  },
  {
    id: 'data.excel.sheets',
    name: 'Excel sheets',
    aliases: ['excel sheets'],
    category: 'data',
    summary: 'List workbook sheets.',
    description: 'Lists sheet names in an Excel workbook.',
    inputKind: ['file', 'bytes'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/excel-sheets`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Excel sheets',
        command: 'txv excel sheets --file workbook.xlsx --json',
      },
    ],
    stability: 'stable',
    requiresOptionalPlugin: DATA_PLUGIN,
    requiresFilesystem: true,
    execute: (input) => json({ sheets: workbook(input).SheetNames }),
  },
  {
    id: 'data.excel.to-csv',
    name: 'Excel to CSV',
    aliases: ['excel to-csv'],
    category: 'data',
    summary: 'Convert an Excel sheet to CSV.',
    description: 'Converts a selected workbook sheet to CSV.',
    inputKind: ['file', 'bytes'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/excel-to-csv`,
    optionsSchema: SheetOptions,
    examples: [
      {
        title: 'Excel to CSV',
        command: 'txv excel to-csv --file workbook.xlsx',
      },
    ],
    stability: 'stable',
    requiresOptionalPlugin: DATA_PLUGIN,
    requiresFilesystem: true,
    execute: (input, options) => {
      const opts = SheetOptions.parse(options);
      return text(
        XLSX.utils.sheet_to_csv(worksheet(workbook(input), opts.sheet)),
      );
    },
  },
  {
    id: 'data.excel.to-json',
    name: 'Excel to JSON',
    aliases: ['excel to-json'],
    category: 'data',
    summary: 'Convert an Excel sheet to JSON.',
    description: 'Converts a selected workbook sheet to JSON rows.',
    inputKind: ['file', 'bytes'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/excel-to-json`,
    optionsSchema: SheetOptions,
    examples: [
      {
        title: 'Excel to JSON',
        command: 'txv excel to-json --file workbook.xlsx --json',
      },
    ],
    stability: 'stable',
    requiresOptionalPlugin: DATA_PLUGIN,
    requiresFilesystem: true,
    execute: (input, options) => {
      const opts = SheetOptions.parse(options);
      return json(
        XLSX.utils.sheet_to_json(worksheet(workbook(input), opts.sheet)),
      );
    },
  },
  {
    id: 'data.excel.to-markdown-table',
    name: 'Excel to Markdown table',
    aliases: ['excel to-markdown-table'],
    category: 'data',
    summary: 'Convert an Excel sheet to a Markdown table.',
    description:
      'Converts a selected workbook sheet to a GitHub-flavored Markdown table.',
    inputKind: ['file', 'bytes'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/excel-to-markdown-table`,
    optionsSchema: SheetOptions,
    examples: [
      {
        title: 'Excel to Markdown',
        command: 'txv excel to-markdown-table --file workbook.xlsx',
      },
    ],
    stability: 'stable',
    requiresOptionalPlugin: DATA_PLUGIN,
    requiresFilesystem: true,
    execute: (input, options) => {
      const opts = SheetOptions.parse(options);
      const rows = XLSX.utils.sheet_to_json<unknown[]>(
        worksheet(workbook(input), opts.sheet),
        {
          header: 1,
        },
      );
      return text(markdownTable(rows));
    },
  },
  {
    id: 'data.sheets.to-csv',
    name: 'Google Sheets to CSV',
    aliases: ['sheets to-csv'],
    category: 'data',
    summary: 'Export a public Google Sheet to CSV.',
    description: 'Fetches Google Sheets CSV export. Requires --allow-network.',
    inputKind: ['text'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/google-sheets-to-csv`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Sheets to CSV',
        command: 'txv sheets to-csv SHEET_ID --allow-network',
      },
    ],
    stability: 'stable',
    requiresOptionalPlugin: DATA_PLUGIN,
    requiresNetwork: true,
    execute: async (input, _options, context) =>
      text(await fetchSheetCsv(requireText(input), context.allowNetwork)),
  },
  {
    id: 'data.sheets.to-json',
    name: 'Google Sheets to JSON',
    aliases: ['sheets to-json'],
    category: 'data',
    summary: 'Export a public Google Sheet to JSON.',
    description:
      'Fetches Google Sheets CSV export and converts rows to JSON. Requires --allow-network.',
    inputKind: ['text'],
    outputKind: ['json'],
    webUrl: `${WEB_BASE}/google-sheets-to-json`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Sheets to JSON',
        command: 'txv sheets to-json SHEET_ID --allow-network --json',
      },
    ],
    stability: 'stable',
    requiresOptionalPlugin: DATA_PLUGIN,
    requiresNetwork: true,
    execute: async (input, _options, context) =>
      json(
        csvToJson(
          await fetchSheetCsv(requireText(input), context.allowNetwork),
        ),
      ),
  },
  {
    id: 'data.sheets.to-markdown-table',
    name: 'Google Sheets to Markdown table',
    aliases: ['sheets to-markdown-table'],
    category: 'data',
    summary: 'Export a public Google Sheet to Markdown.',
    description:
      'Fetches Google Sheets CSV export and converts rows to Markdown. Requires --allow-network.',
    inputKind: ['text'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/google-sheets-to-markdown-table`,
    optionsSchema: EmptyOptions,
    examples: [
      {
        title: 'Sheets to Markdown',
        command: 'txv sheets to-markdown-table SHEET_ID --allow-network',
      },
    ],
    stability: 'stable',
    requiresOptionalPlugin: DATA_PLUGIN,
    requiresNetwork: true,
    execute: async (input, _options, context) =>
      text(
        markdownTable(
          parseCsv(
            await fetchSheetCsv(requireText(input), context.allowNetwork),
          ),
        ),
      ),
  },
];

export function registerDataTools(registry: ToolRegistry): void {
  for (const tool of dataTools) {
    registry.register(tool);
  }
}

const dataPlugin = {
  name: DATA_PLUGIN,
  version: '0.1.0',
  register: registerDataTools,
};

export { dataPlugin };
