/**
 * @fileoverview Metadata-only entries for optional formatter and media tools.
 *
 * These definitions keep optional commands discoverable even when the heavy
 * plugin packages are absent. Invoking one without an executor produces the
 * structured PLUGIN_MISSING error required by the CLI spec.
 */

import type {
  TextaviaToolDefinition,
  ToolCategory,
  ToolInputKind,
  ToolOutputKind,
} from '@textavia/core';
import { z } from 'zod';

interface OptionalToolSpec {
  readonly id: string;
  readonly name: string;
  readonly aliases: readonly string[];
  readonly category: ToolCategory;
  readonly summary: string;
  readonly description: string;
  readonly inputKind: readonly ToolInputKind[];
  readonly outputKind: readonly ToolOutputKind[];
  readonly plugin: string;
  readonly installHint: string;
}

function optionalTool(spec: OptionalToolSpec): TextaviaToolDefinition {
  return {
    id: spec.id,
    name: spec.name,
    aliases: spec.aliases,
    category: spec.category,
    summary: spec.summary,
    description: spec.description,
    inputKind: spec.inputKind,
    outputKind: spec.outputKind,
    optionsSchema: z.object({}),
    examples: [],
    stability: 'future',
    requiresOptionalPlugin: spec.plugin,
    installHint: spec.installHint,
  };
}

const FORMATTER_PLUGIN = '@textavia/plugin-formatters';
const FORMATTER_INSTALL = 'npm install -g @textavia/plugin-formatters';
const MEDIA_PLUGIN = '@textavia/plugin-media';
const MEDIA_INSTALL = 'npm install -g @textavia/plugin-media';

/** Metadata-only commands owned by the optional formatter plugin. */
export const formatterPlaceholderTools: readonly TextaviaToolDefinition[] = [
  { kind: 'html', name: 'HTML formatter' },
  { kind: 'css', name: 'CSS formatter' },
  { kind: 'js', name: 'JavaScript formatter' },
  { kind: 'ts', name: 'TypeScript formatter' },
  { kind: 'scss', name: 'SCSS formatter' },
  { kind: 'xml', name: 'XML formatter' },
  { kind: 'yaml', name: 'YAML formatter' },
  { kind: 'graphql', name: 'GraphQL formatter' },
  { kind: 'markdown', name: 'Markdown formatter' },
].map((spec) => {
  return optionalTool({
    id: `format.${spec.kind}`,
    name: spec.name,
    aliases: [`format ${spec.kind}`],
    category: 'format',
    summary: `Format ${spec.kind.toUpperCase()} source.`,
    description: `${spec.name} is provided by the optional formatter plugin.`,
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    plugin: FORMATTER_PLUGIN,
    installHint: FORMATTER_INSTALL,
  });
});

/** Metadata-only commands owned by the optional media plugin. */
export const mediaPlaceholderTools: readonly TextaviaToolDefinition[] = [
  optionalTool({
    id: 'media.image.convert',
    name: 'Image convert',
    aliases: ['image convert'],
    category: 'media',
    summary: 'Convert images between formats.',
    description: 'Image conversion is provided by the optional media plugin.',
    inputKind: ['image', 'file'],
    outputKind: ['image', 'file'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.image.resize',
    name: 'Image resize',
    aliases: ['image resize'],
    category: 'media',
    summary: 'Resize an image.',
    description: 'Image resizing is provided by the optional media plugin.',
    inputKind: ['image', 'file'],
    outputKind: ['image', 'file'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.image.exif',
    name: 'Image EXIF',
    aliases: ['image exif'],
    category: 'media',
    summary: 'View image EXIF metadata.',
    description: 'EXIF inspection is provided by the optional media plugin.',
    inputKind: ['image', 'file'],
    outputKind: ['json'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.image.remove-exif',
    name: 'Remove image EXIF',
    aliases: ['image remove-exif'],
    category: 'media',
    summary: 'Remove image EXIF metadata.',
    description: 'EXIF removal is provided by the optional media plugin.',
    inputKind: ['image', 'file'],
    outputKind: ['image', 'file'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.image.ocr',
    name: 'Image OCR',
    aliases: ['image ocr'],
    category: 'media',
    summary: 'Extract text from an image.',
    description: 'OCR is provided by the optional media plugin.',
    inputKind: ['image', 'file'],
    outputKind: ['text'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.image.ascii',
    name: 'Image ASCII art',
    aliases: ['image ascii'],
    category: 'media',
    summary: 'Render image pixels as ASCII art.',
    description: 'Image ASCII art is provided by the optional media plugin.',
    inputKind: ['image', 'file'],
    outputKind: ['text'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.pdf.merge',
    name: 'PDF merge',
    aliases: ['pdf merge'],
    category: 'media',
    summary: 'Merge PDF files.',
    description: 'PDF merging is provided by the optional media plugin.',
    inputKind: ['pdf', 'files'],
    outputKind: ['pdf', 'file'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.pdf.info',
    name: 'PDF info',
    aliases: ['pdf info'],
    category: 'media',
    summary: 'Inspect PDF metadata.',
    description: 'PDF inspection is provided by the optional media plugin.',
    inputKind: ['pdf', 'file'],
    outputKind: ['json'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.pdf.extract-text',
    name: 'PDF extract text',
    aliases: ['pdf extract-text'],
    category: 'media',
    summary: 'Extract text from a PDF.',
    description:
      'PDF text extraction is provided by the optional media plugin.',
    inputKind: ['pdf', 'file'],
    outputKind: ['text'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.wordcloud',
    name: 'Word cloud',
    aliases: ['wordcloud'],
    category: 'media',
    summary: 'Generate a word cloud image.',
    description:
      'Word cloud generation is provided by the optional media plugin.',
    inputKind: ['text', 'file'],
    outputKind: ['image', 'file'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
];
