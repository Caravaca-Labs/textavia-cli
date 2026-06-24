/**
 * @fileoverview Optional media plugin.
 *
 * v0.6 starts with dependency-light PDF inspection. Heavier image conversion,
 * OCR, EXIF mutation, and PDF manipulation remain placeholders until their
 * dependency and privacy behavior is reviewed.
 */

import {
  ParseError,
  type TextaviaToolDefinition,
  type ToolRegistry,
  requireBytes,
} from '@textavia/core';
import { z } from 'zod';

const MEDIA_PLUGIN = '@textavia/plugin-media';

interface PdfInfo {
  readonly version: string;
  readonly bytes: number;
  readonly pages: number;
}

/** First implemented media tool: local PDF metadata inspection. */
export const mediaTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'media.pdf.info',
    name: 'PDF info',
    aliases: ['pdf info'],
    category: 'media',
    summary: 'Inspect PDF version, size, and page count.',
    description:
      'Reads a PDF locally and reports dependency-light metadata. Text extraction and mutation are not performed.',
    inputKind: ['bytes', 'file', 'pdf'],
    outputKind: ['json'],
    webUrl: 'https://textavia.com/tools/pdf-info',
    optionsSchema: z.object({}),
    examples: [{ title: 'PDF info', command: 'txv pdf info --file file.pdf' }],
    stability: 'stable',
    requiresOptionalPlugin: MEDIA_PLUGIN,
    requiresFilesystem: true,
    execute: (input) => {
      return {
        output: inspectPdf(requireBytes(input)),
        outputKind: 'json' as const,
      };
    },
  },
];

/** Registers media tools into a registry, replacing placeholders. */
export function registerMediaTools(registry: ToolRegistry): void {
  for (const tool of mediaTools) {
    registry.register(tool);
  }
}

const mediaPlugin = {
  name: MEDIA_PLUGIN,
  version: '0.1.0',
  register: registerMediaTools,
};

export { mediaPlugin };

/** Inspects a PDF byte buffer without parsing full document structures. */
export function inspectPdf(bytes: Uint8Array): PdfInfo {
  const header = Buffer.from(bytes.slice(0, 16)).toString('latin1');
  const version = /^%PDF-(\d+\.\d+)/.exec(header)?.[1];
  if (version === undefined) {
    throw new ParseError('Input is not a PDF file.');
  }
  const latin1 = Buffer.from(bytes).toString('latin1');
  const pages = Array.from(latin1.matchAll(/\/Type\s*\/Page\b/g)).length;
  return { version, bytes: bytes.byteLength, pages };
}
