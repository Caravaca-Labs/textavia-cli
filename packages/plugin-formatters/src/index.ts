/**
 * @fileoverview Optional formatter plugin.
 *
 * Uses established formatters where practical while staying outside the
 * default Textavia package.
 */

import {
  ParseError,
  type ResolvedInput,
  type TextaviaToolDefinition,
  type ToolRegistry,
  requireText,
} from '@textavia/core';
import prettier from 'prettier';
import { format as formatSql } from 'sql-formatter';
import { z } from 'zod';

const WEB_BASE = 'https://textavia.com/tools';
const FORMATTER_PLUGIN = '@textavia/plugin-formatters';

const FormatOptions = z.object({
  indent: z.coerce.number().int().min(0).max(8).optional(),
});

interface FormatterSpec {
  readonly id: string;
  readonly kind: string;
  readonly name: string;
  readonly webSlug: string;
  readonly format: (input: string, indent: number) => Promise<string> | string;
}

const PRETTIER_SPECS: readonly (Omit<FormatterSpec, 'format'> & {
  readonly parser: string;
})[] = [
  {
    id: 'format.html',
    kind: 'html',
    name: 'HTML formatter',
    webSlug: 'html-formatter',
    parser: 'html',
  },
  {
    id: 'format.css',
    kind: 'css',
    name: 'CSS formatter',
    webSlug: 'css-formatter',
    parser: 'css',
  },
  {
    id: 'format.scss',
    kind: 'scss',
    name: 'SCSS formatter',
    webSlug: 'scss-formatter',
    parser: 'scss',
  },
  {
    id: 'format.less',
    kind: 'less',
    name: 'Less formatter',
    webSlug: 'less-formatter',
    parser: 'less',
  },
  {
    id: 'format.js',
    kind: 'js',
    name: 'JavaScript formatter',
    webSlug: 'javascript-formatter',
    parser: 'babel',
  },
  {
    id: 'format.jsx',
    kind: 'jsx',
    name: 'JSX formatter',
    webSlug: 'jsx-formatter',
    parser: 'babel',
  },
  {
    id: 'format.ts',
    kind: 'ts',
    name: 'TypeScript formatter',
    webSlug: 'typescript-formatter',
    parser: 'typescript',
  },
  {
    id: 'format.tsx',
    kind: 'tsx',
    name: 'TSX formatter',
    webSlug: 'tsx-formatter',
    parser: 'typescript',
  },
  {
    id: 'format.yaml',
    kind: 'yaml',
    name: 'YAML formatter',
    webSlug: 'yaml-formatter',
    parser: 'yaml',
  },
  {
    id: 'format.graphql',
    kind: 'graphql',
    name: 'GraphQL formatter',
    webSlug: 'graphql-formatter',
    parser: 'graphql',
  },
  {
    id: 'format.markdown',
    kind: 'markdown',
    name: 'Markdown formatter',
    webSlug: 'markdown-formatter',
    parser: 'markdown',
  },
];

const SPECS: readonly FormatterSpec[] = [
  ...PRETTIER_SPECS.map((spec) => ({
    ...spec,
    format: (input: string, indent: number) =>
      prettier.format(input, { parser: spec.parser, tabWidth: indent }),
  })),
  {
    id: 'format.xml',
    kind: 'xml',
    name: 'XML formatter',
    webSlug: 'xml-formatter',
    format: formatMarkup,
  },
  {
    id: 'format.toml',
    kind: 'toml',
    name: 'TOML formatter',
    webSlug: 'toml-formatter',
    format: formatToml,
  },
  {
    id: 'format.sql',
    kind: 'sql',
    name: 'SQL formatter',
    webSlug: 'sql-formatter',
    format: (input: string, indent: number) =>
      formatSql(input, { tabWidth: indent, keywordCase: 'upper' }),
  },
];

const MINIFIERS: readonly {
  readonly id: string;
  readonly kind: string;
  readonly minify: (input: string) => string;
}[] = [
  { id: 'format.minify.html', kind: 'html', minify: minifyMarkup },
  { id: 'format.minify.css', kind: 'css', minify: minifyCss },
  { id: 'format.minify.js', kind: 'js', minify: minifyJs },
  { id: 'format.minify.json', kind: 'json', minify: minifyJson },
  { id: 'format.minify.xml', kind: 'xml', minify: minifyMarkup },
];

/** All formatter tool definitions exposed by this optional plugin. */
export const formatterTools: readonly TextaviaToolDefinition[] = [
  ...SPECS.map(
    (spec): TextaviaToolDefinition => ({
      id: spec.id,
      name: spec.name,
      aliases: [`format ${spec.kind}`],
      category: 'format' as const,
      summary: `Format ${spec.kind.toUpperCase()} source.`,
      description: `${spec.name} formats source locally through the optional formatter plugin.`,
      inputKind: ['text', 'file'] as const,
      outputKind: ['text'] as const,
      webUrl: `${WEB_BASE}/${spec.webSlug}`,
      optionsSchema: FormatOptions,
      examples: [
        {
          title: `Format ${spec.kind}`,
          command: `txv format ${spec.kind} --file input.${spec.kind}`,
        },
      ],
      stability: 'stable' as const,
      requiresOptionalPlugin: FORMATTER_PLUGIN,
      execute: async (input: ResolvedInput, options: unknown) => {
        const opts = FormatOptions.parse(options);
        return {
          output: await spec.format(requireText(input), opts.indent ?? 2),
          outputKind: 'text' as const,
        };
      },
    }),
  ),
  ...MINIFIERS.map(
    (spec): TextaviaToolDefinition => ({
      id: spec.id,
      name: `${spec.kind.toUpperCase()} minifier`,
      aliases: [`minify ${spec.kind}`],
      category: 'format' as const,
      summary: `Minify ${spec.kind.toUpperCase()} source.`,
      description: `Minifies ${spec.kind.toUpperCase()} source locally through the optional formatter plugin.`,
      inputKind: ['text', 'file'] as const,
      outputKind: ['text'] as const,
      webUrl: `${WEB_BASE}/${spec.kind}-minifier`,
      optionsSchema: z.object({}),
      examples: [
        {
          title: `Minify ${spec.kind}`,
          command: `txv minify ${spec.kind} --file input.${spec.kind}`,
        },
      ],
      stability: 'stable' as const,
      requiresOptionalPlugin: FORMATTER_PLUGIN,
      execute: (input: ResolvedInput) => ({
        output: spec.minify(requireText(input)),
        outputKind: 'text' as const,
      }),
    }),
  ),
];

/** Registers formatter tools into a registry, replacing placeholders. */
export function registerFormatterTools(registry: ToolRegistry): void {
  for (const tool of formatterTools) {
    registry.register(tool);
  }
}

/** Plugin descriptor consumed by the CLI optional loader. */
const formatterPlugin = {
  name: FORMATTER_PLUGIN,
  version: '0.1.0',
  register: registerFormatterTools,
};

export { formatterPlugin };

function formatMarkup(input: string, indent: number): string {
  const tokens = Array.from(input.matchAll(/(<[^>]+>|[^<]+)/g), (match) => {
    return match[0];
  });
  if (tokens.length === 0) {
    throw new ParseError('Markup input is empty.');
  }
  let depth = 0;
  const lines: string[] = [];
  for (const token of tokens) {
    if (!token.startsWith('<')) {
      const text = token.trim();
      if (text.length > 0) {
        lines.push(`${' '.repeat(depth * indent)}${text}`);
      }
      continue;
    }
    if (token.startsWith('</')) {
      depth = Math.max(0, depth - 1);
    }
    lines.push(`${' '.repeat(depth * indent)}${token}`);
    if (isOpeningTag(token)) {
      depth += 1;
    }
  }
  if (depth !== 0) {
    throw new ParseError('Markup contains unclosed tags.');
  }
  return lines.join('\n');
}

function isOpeningTag(tag: string): boolean {
  return (
    !tag.startsWith('</') &&
    !tag.endsWith('/>') &&
    !tag.startsWith('<?') &&
    !tag.startsWith('<!')
  );
}

function formatToml(input: string): string {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .join('\n');
}

function minifyMarkup(input: string): string {
  return input
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function minifyCss(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .trim();
}

function minifyJs(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}()[\];,:=+\-*/<>])\s*/g, '$1')
    .trim();
}

function minifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input));
}
