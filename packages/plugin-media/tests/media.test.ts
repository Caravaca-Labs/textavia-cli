import { ParseError, createToolRegistry } from '@textavia/core';
import { registerStandardTools } from '@textavia/plugin-standard';
import { describe, expect, it } from 'vitest';
import { inspectPdf, registerMediaTools } from '../src/index.js';

const MINIMAL_PDF = Buffer.from(
  `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R >>
endobj
%%EOF
`,
  'latin1',
);

describe('media plugin', () => {
  it('replaces the PDF info placeholder with an executor', () => {
    const registry = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
    registerStandardTools(registry);
    expect(registry.get('media.pdf.info')?.execute).toBeUndefined();

    registerMediaTools(registry);

    const tool = registry.get('media.pdf.info');
    expect(tool?.execute).toBeDefined();
    expect(tool?.stability).toBe('stable');
  });

  it('inspects lightweight PDF metadata', () => {
    expect(inspectPdf(MINIMAL_PDF)).toEqual({
      version: '1.4',
      bytes: MINIMAL_PDF.byteLength,
      pages: 1,
    });
  });

  it('rejects non-PDF input loudly', () => {
    expect(() => inspectPdf(Buffer.from('not pdf'))).toThrow(ParseError);
  });
});
