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
const STYLE_PLUGIN = '@textavia/plugin-style';
const STYLE_INSTALL = 'npm install -g @textavia/plugin-style';
const DATA_PLUGIN = '@textavia/plugin-data';
const DATA_INSTALL = 'npm install -g @textavia/plugin-data';

/** Metadata-only commands owned by the optional formatter plugin. */
export const formatterPlaceholderTools: readonly TextaviaToolDefinition[] = [
  { kind: 'html', name: 'HTML formatter' },
  { kind: 'css', name: 'CSS formatter' },
  { kind: 'less', name: 'Less formatter' },
  { kind: 'js', name: 'JavaScript formatter' },
  { kind: 'jsx', name: 'JSX formatter' },
  { kind: 'ts', name: 'TypeScript formatter' },
  { kind: 'tsx', name: 'TSX formatter' },
  { kind: 'scss', name: 'SCSS formatter' },
  { kind: 'xml', name: 'XML formatter' },
  { kind: 'yaml', name: 'YAML formatter' },
  { kind: 'toml', name: 'TOML formatter' },
  { kind: 'graphql', name: 'GraphQL formatter' },
  { kind: 'markdown', name: 'Markdown formatter' },
  { kind: 'sql', name: 'SQL formatter' },
]
  .map((spec) => {
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
  })
  .concat(
    ['html', 'css', 'js', 'json', 'xml'].map((kind) =>
      optionalTool({
        id: `format.minify.${kind}`,
        name: `${kind.toUpperCase()} minifier`,
        aliases: [`minify ${kind}`],
        category: 'format',
        summary: `Minify ${kind.toUpperCase()} source.`,
        description: `${kind.toUpperCase()} minification is provided by the optional formatter plugin.`,
        inputKind: ['text', 'file'],
        outputKind: ['text'],
        plugin: FORMATTER_PLUGIN,
        installHint: FORMATTER_INSTALL,
      }),
    ),
  );

/** Metadata-only commands owned by the optional media plugin. */
export const mediaPlaceholderTools: readonly TextaviaToolDefinition[] = [
  optionalTool({
    id: 'media.image.info',
    name: 'Image info',
    aliases: ['image info'],
    category: 'media',
    summary: 'Inspect image metadata.',
    description: 'Image inspection is provided by the optional media plugin.',
    inputKind: ['image', 'file'],
    outputKind: ['json'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
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
    id: 'media.image.compress',
    name: 'Image compress',
    aliases: ['image compress'],
    category: 'media',
    summary: 'Compress an image.',
    description: 'Image compression is provided by the optional media plugin.',
    inputKind: ['image', 'file'],
    outputKind: ['image', 'file'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.image.crop',
    name: 'Image crop',
    aliases: ['image crop'],
    category: 'media',
    summary: 'Crop an image.',
    description: 'Image cropping is provided by the optional media plugin.',
    inputKind: ['image', 'file'],
    outputKind: ['image', 'file'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.image.rotate',
    name: 'Image rotate',
    aliases: ['image rotate'],
    category: 'media',
    summary: 'Rotate an image.',
    description: 'Image rotation is provided by the optional media plugin.',
    inputKind: ['image', 'file'],
    outputKind: ['image', 'file'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.image.metadata',
    name: 'Image metadata',
    aliases: ['image metadata'],
    category: 'media',
    summary: 'View image metadata.',
    description:
      'Image metadata inspection is provided by the optional media plugin.',
    inputKind: ['image', 'file'],
    outputKind: ['json'],
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
    aliases: ['image ascii', 'image to-ascii'],
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
    id: 'media.pdf.split',
    name: 'PDF split',
    aliases: ['pdf split'],
    category: 'media',
    summary: 'Split a PDF file.',
    description: 'PDF splitting is provided by the optional media plugin.',
    inputKind: ['pdf', 'file'],
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
    id: 'media.pdf.extract-images',
    name: 'PDF extract images',
    aliases: ['pdf extract-images'],
    category: 'media',
    summary: 'Extract images from a PDF.',
    description:
      'PDF image extraction is provided by the optional media plugin.',
    inputKind: ['pdf', 'file'],
    outputKind: ['file'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.pdf.compress',
    name: 'PDF compress',
    aliases: ['pdf compress'],
    category: 'media',
    summary: 'Compress a PDF file.',
    description: 'PDF compression is provided by the optional media plugin.',
    inputKind: ['pdf', 'file'],
    outputKind: ['pdf', 'file'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.pdf.images-to-pdf',
    name: 'Images to PDF',
    aliases: ['pdf images-to-pdf'],
    category: 'media',
    summary: 'Create a PDF from images.',
    description:
      'Image-to-PDF conversion is provided by the optional media plugin.',
    inputKind: ['files'],
    outputKind: ['pdf', 'file'],
    plugin: MEDIA_PLUGIN,
    installHint: MEDIA_INSTALL,
  }),
  optionalTool({
    id: 'media.wordcloud',
    name: 'Word cloud',
    aliases: ['wordcloud', 'wordcloud generate'],
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

const STYLE_COMMANDS = [
  'bold',
  'italic',
  'cursive',
  'gothic',
  'bubble',
  'small',
  'strike',
  'underline',
  'upside-down',
  'wide',
  'zalgo',
  'superscript',
  'subscript',
  'invisible',
  'slash',
  'stacked',
  'glitch',
  'mirror',
  'typewriter',
  'aesthetic',
  'big',
  'wingdings',
  'discord',
  'instagram',
  'twitter',
  'facebook',
  'pig-latin',
  'phonetic-spelling',
] as const;

/** Metadata-only commands owned by the optional style plugin. */
export const stylePlaceholderTools: readonly TextaviaToolDefinition[] = [
  ...STYLE_COMMANDS.map((kind) =>
    optionalTool({
      id: `style.${kind}`,
      name: `Style ${kind}`,
      aliases: [`style ${kind}`],
      category: 'style',
      summary: `Apply the ${kind} text style.`,
      description: `${kind} styling is provided by the optional style plugin.`,
      inputKind: ['text', 'file'],
      outputKind: ['text'],
      plugin: STYLE_PLUGIN,
      installHint: STYLE_INSTALL,
    }),
  ),
  optionalTool({
    id: 'style.symbols.search',
    name: 'Symbol search',
    aliases: ['symbols search'],
    category: 'style',
    summary: 'Search Unicode symbols.',
    description: 'Symbol search is provided by the optional style plugin.',
    inputKind: ['text'],
    outputKind: ['json'],
    plugin: STYLE_PLUGIN,
    installHint: STYLE_INSTALL,
  }),
  optionalTool({
    id: 'style.symbols.list',
    name: 'Symbol list',
    aliases: ['symbols list'],
    category: 'style',
    summary: 'List Unicode symbols.',
    description: 'Symbol listing is provided by the optional style plugin.',
    inputKind: ['generated'],
    outputKind: ['json'],
    plugin: STYLE_PLUGIN,
    installHint: STYLE_INSTALL,
  }),
  optionalTool({
    id: 'style.symbols.random',
    name: 'Random symbol',
    aliases: ['symbols random'],
    category: 'style',
    summary: 'Pick a random Unicode symbol.',
    description: 'Random symbols are provided by the optional style plugin.',
    inputKind: ['generated'],
    outputKind: ['text'],
    plugin: STYLE_PLUGIN,
    installHint: STYLE_INSTALL,
  }),
];

/** Metadata-only commands owned by the optional data plugin. */
export const dataPlaceholderTools: readonly TextaviaToolDefinition[] = [
  ...['info', 'sheets', 'to-csv', 'to-json', 'to-markdown-table'].map((kind) =>
    optionalTool({
      id: `data.excel.${kind}`,
      name: `Excel ${kind}`,
      aliases: [`excel ${kind}`],
      category: 'data',
      summary: `Run Excel ${kind}.`,
      description: `Excel ${kind} is provided by the optional data plugin.`,
      inputKind: ['file', 'bytes'],
      outputKind:
        kind === 'info' || kind === 'sheets' || kind === 'to-json'
          ? ['json']
          : ['text'],
      plugin: DATA_PLUGIN,
      installHint: DATA_INSTALL,
    }),
  ),
  ...['to-csv', 'to-json', 'to-markdown-table'].map((kind) =>
    optionalTool({
      id: `data.sheets.${kind}`,
      name: `Google Sheets ${kind}`,
      aliases: [`sheets ${kind}`],
      category: 'data',
      summary: `Run Google Sheets ${kind}.`,
      description: `Google Sheets ${kind} is provided by the optional data plugin and requires --allow-network.`,
      inputKind: ['text'],
      outputKind: kind === 'to-json' ? ['json'] : ['text'],
      plugin: DATA_PLUGIN,
      installHint: DATA_INSTALL,
    }),
  ),
];
