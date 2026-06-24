import { createToolRegistry } from '@textavia/core';
import { registerStandardTools } from '@textavia/plugin-standard';
import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { registerDataTools } from '../src/index.js';

function workbookBytes(): Uint8Array {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ['name', 'age'],
    ['Ada', 37],
  ]);
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

describe('data plugin', () => {
  it('replaces spreadsheet placeholders with executors', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registerStandardTools(registry);
    expect(registry.get('data.excel.to-json')?.execute).toBeUndefined();

    registerDataTools(registry);

    expect(registry.get('data.excel.to-json')?.execute).toBeDefined();
    expect(registry.resolveCommand('excel', 'to-json')?.id).toBe(
      'data.excel.to-json',
    );
  });

  it('converts workbook data to json', async () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registerStandardTools(registry);
    registerDataTools(registry);
    const tool = registry.get('data.excel.to-json');
    const result = await tool?.execute?.(
      {
        source: 'input',
        kind: 'bytes',
        encoding: 'utf8',
        bytes: workbookBytes(),
      },
      { sheet: 'Users' },
      {
        toolId: 'data.excel.to-json',
        cwd: process.cwd(),
        mode: 'human',
        allowFilesystem: true,
        allowNetwork: false,
        allowUnsafe: false,
      },
    );
    expect(result?.output).toEqual([{ name: 'Ada', age: 37 }]);
  });
});
