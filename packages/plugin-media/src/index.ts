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

interface ImageInfo {
  readonly format: 'png' | 'jpeg' | 'gif' | 'unknown';
  readonly bytes: number;
  readonly width?: number;
  readonly height?: number;
}

/** Dependency-light media tools. */
export const mediaTools: readonly TextaviaToolDefinition[] = [
  {
    id: 'media.image.info',
    name: 'Image info',
    aliases: ['image info'],
    category: 'media',
    summary: 'Inspect image format, size, and dimensions.',
    description:
      'Reads PNG, JPEG, or GIF metadata locally without decoding pixels.',
    inputKind: ['bytes', 'file', 'image'],
    outputKind: ['json'],
    webUrl: 'https://textavia.com/tools/image-info',
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Image info',
        command: 'txv image info --file image.png --json',
      },
    ],
    stability: 'stable',
    requiresOptionalPlugin: MEDIA_PLUGIN,
    requiresFilesystem: true,
    execute: (input) => {
      return {
        output: inspectImage(requireBytes(input)),
        outputKind: 'json' as const,
      };
    },
  },
  {
    id: 'media.image.metadata',
    name: 'Image metadata',
    aliases: ['image metadata'],
    category: 'media',
    summary: 'Inspect dependency-light image metadata.',
    description:
      'Reports image format, size, and dimensions for PNG, JPEG, or GIF files.',
    inputKind: ['bytes', 'file', 'image'],
    outputKind: ['json'],
    webUrl: 'https://textavia.com/tools/image-metadata',
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Image metadata',
        command: 'txv image metadata --file image.png --json',
      },
    ],
    stability: 'stable',
    requiresOptionalPlugin: MEDIA_PLUGIN,
    requiresFilesystem: true,
    execute: (input) => {
      return {
        output: inspectImage(requireBytes(input)),
        outputKind: 'json' as const,
      };
    },
  },
  {
    id: 'media.image.exif',
    name: 'Image EXIF',
    aliases: ['image exif'],
    category: 'media',
    summary: 'Inspect basic image metadata.',
    description:
      'Reports dependency-light image metadata. Full EXIF parsing is intentionally deferred to a heavier media stack.',
    inputKind: ['bytes', 'file', 'image'],
    outputKind: ['json'],
    webUrl: 'https://textavia.com/tools/exif-tools',
    optionsSchema: z.object({}),
    examples: [
      {
        title: 'Image EXIF',
        command: 'txv image exif --file image.jpg --json',
      },
    ],
    stability: 'experimental',
    requiresOptionalPlugin: MEDIA_PLUGIN,
    requiresFilesystem: true,
    execute: (input) => {
      return {
        output: {
          ...inspectImage(requireBytes(input)),
          exif: null,
          warning:
            'Full EXIF parsing is not implemented in this dependency-light build.',
        },
        outputKind: 'json' as const,
      };
    },
  },
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

/** Inspects common image headers without decoding pixels. */
export function inspectImage(bytes: Uint8Array): ImageInfo {
  const buffer = Buffer.from(bytes);
  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer.slice(1, 4).toString('ascii') === 'PNG'
  ) {
    return {
      format: 'png',
      bytes: buffer.byteLength,
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }
  if (buffer.length >= 10 && buffer.slice(0, 3).toString('ascii') === 'GIF') {
    return {
      format: 'gif',
      bytes: buffer.byteLength,
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    };
  }
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    const dimensions = jpegDimensions(buffer);
    return { format: 'jpeg', bytes: buffer.byteLength, ...dimensions };
  }
  return { format: 'unknown', bytes: buffer.byteLength };
}

function jpegDimensions(buffer: Buffer): { width?: number; height?: number } {
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker !== undefined && marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  return {};
}
