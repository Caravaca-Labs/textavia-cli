/**
 * @fileoverview Optional formatter plugin.
 *
 * The first implementation keeps dependencies light and deterministic. The
 * package replaces standard placeholder tools when loaded by the CLI.
 */

import {
  ParseError,
  type TextaviaToolDefinition,
  type ToolRegistry,
  requireText,
} from '@textavia/core';
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
  readonly format: (input: string, indent: number) => string;
}

const SPECS: readonly FormatterSpec[] = [
  {
    id: 'format.html',
    kind: 'html',
    name: 'HTML formatter',
    webSlug: 'html-formatter',
    format: formatMarkup,
  },
  {
    id: 'format.css',
    kind: 'css',
    name: 'CSS formatter',
    webSlug: 'css-formatter',
    format: formatCssLike,
  },
  {
    id: 'format.js',
    kind: 'js',
    name: 'JavaScript formatter',
    webSlug: 'javascript-formatter',
    format: formatCodeLike,
  },
  {
    id: 'format.ts',
    kind: 'ts',
    name: 'TypeScript formatter',
    webSlug: 'typescript-formatter',
    format: formatCodeLike,
  },
  {
    id: 'format.scss',
    kind: 'scss',
    name: 'SCSS formatter',
    webSlug: 'scss-formatter',
    format: formatCssLike,
  },
  {
    id: 'format.xml',
    kind: 'xml',
    name: 'XML formatter',
    webSlug: 'xml-formatter',
    format: formatMarkup,
  },
  {
    id: 'format.yaml',
    kind: 'yaml',
    name: 'YAML formatter',
    webSlug: 'yaml-formatter',
    format: formatYamlLike,
  },
  {
    id: 'format.graphql',
    kind: 'graphql',
    name: 'GraphQL formatter',
    webSlug: 'graphql-formatter',
    format: formatCodeLike,
  },
  {
    id: 'format.markdown',
    kind: 'markdown',
    name: 'Markdown formatter',
    webSlug: 'markdown-formatter',
    format: formatMarkdown,
  },
];

/** All formatter tool definitions exposed by this optional plugin. */
export const formatterTools: readonly TextaviaToolDefinition[] = SPECS.map(
  (spec) => ({
    id: spec.id,
    name: spec.name,
    aliases: [`format ${spec.kind}`],
    category: 'format',
    summary: `Format ${spec.kind.toUpperCase()} source.`,
    description: `${spec.name} normalizes indentation and whitespace locally. Use project-native formatters for language-specific style enforcement.`,
    inputKind: ['text', 'file'],
    outputKind: ['text'],
    webUrl: `${WEB_BASE}/${spec.webSlug}`,
    optionsSchema: FormatOptions,
    examples: [
      {
        title: `Format ${spec.kind}`,
        command: `txv format ${spec.kind} --file input.${spec.kind}`,
      },
    ],
    stability: 'stable',
    requiresOptionalPlugin: FORMATTER_PLUGIN,
    execute: (input, options) => {
      const opts = FormatOptions.parse(options);
      return {
        output: spec.format(requireText(input), opts.indent ?? 2),
        outputKind: 'text' as const,
      };
    },
  }),
);

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

function formatCssLike(input: string, indent: number): string {
  return input
    .replaceAll('{', ' {\n')
    .replaceAll(';', ';\n')
    .replaceAll('}', '\n}\n')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<{ depth: number; lines: string[] }>(
      (state, line) => {
        const nextDepth =
          line === '}' ? Math.max(0, state.depth - 1) : state.depth;
        state.lines.push(`${' '.repeat(nextDepth * indent)}${line}`);
        state.depth = line.endsWith('{') ? nextDepth + 1 : nextDepth;
        return state;
      },
      { depth: 0, lines: [] },
    )
    .lines.join('\n');
}

function formatCodeLike(input: string): string {
  return input
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatYamlLike(input: string): string {
  return input
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatMarkdown(input: string): string {
  return input
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
