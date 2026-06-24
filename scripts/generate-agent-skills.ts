/**
 * @fileoverview Agent skill generator.
 *
 * Generates SKILL.md files from registry metadata for implemented tool groups.
 * The generator intentionally fails when a referenced tool is missing so skill
 * docs cannot drift from the registry.
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildCliRegistry } from '../packages/cli/src/index.ts';
import type { TextaviaToolDefinition } from '../packages/core/src/index.ts';

const REPO_ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const CLI_SKILLS_DIR = join(REPO_ROOT, 'packages', 'cli', 'skills');
const ROOT_SKILLS_DIR = join(REPO_ROOT, 'skills');
const REPO_DOCS_URL =
  'https://github.com/Caravaca-Labs/textavia-cli/blob/main/docs';

interface SkillSpec {
  readonly dir: string;
  readonly name: string;
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly docsPath: string;
  readonly hermesCategory: string;
  readonly tags: readonly string[];
  readonly toolIds: readonly string[];
}

export interface GenerateAgentSkillsOptions {
  readonly outputDir?: string;
  readonly outputDirs?: readonly string[];
}

const SKILLS: readonly SkillSpec[] = [
  {
    dir: 'textavia-json-tools',
    name: 'textavia-json-tools',
    title: 'Textavia JSON Tools',
    summary:
      'Format, minify, validate, and convert JSON using the local Textavia CLI.',
    description:
      'Use this skill for JSON formatting, minification, validation, YAML conversion, CSV conversion, Markdown table conversion, API responses, package manifests, config files, and generated structured data with the local Textavia CLI.',
    docsPath: '#textavia-json-tools',
    hermesCategory: 'software-dev',
    tags: ['json', 'developer-tools', 'textavia', 'cli'],
    toolIds: [
      'dev.json.format',
      'dev.json.minify',
      'dev.json.validate',
      'data.json.to-yaml',
      'data.json.to-csv',
      'data.json.to-markdown-table',
    ],
  },
  {
    dir: 'textavia-base64-debugger',
    name: 'textavia-base64-debugger',
    title: 'Textavia Base64 Debugger',
    summary:
      'Encode, decode, validate, normalize, repair, detect, and inspect Base64 locally.',
    description:
      'Use this skill for Base64 encoding, decoding, validation, normalization, repair, detection, data URL conversion, gzip checks, copied Base64 payload debugging, and local binary/text Base64 workflows with the Textavia CLI.',
    docsPath: '#textavia-base64-debugger',
    hermesCategory: 'software-dev',
    tags: ['base64', 'encoding', 'debugging', 'textavia', 'cli'],
    toolIds: [
      'encoding.base64.encode',
      'encoding.base64.decode',
      'encoding.base64.validate',
      'encoding.base64.normalize',
      'encoding.base64.repair',
      'encoding.base64.detect',
      'encoding.base64.gzip-check',
      'encoding.base64.data-url',
    ],
  },
  {
    dir: 'textavia-text-cleaner',
    name: 'textavia-text-cleaner',
    title: 'Textavia Text Cleaner',
    summary: 'Use this skill to clean, normalize, and inspect text locally.',
    description:
      'Use this skill for text cleanup, whitespace normalization, formatting removal, word and character counts, plain text extraction, line trimming, duplicate line removal, and local text inspection with the Textavia CLI.',
    docsPath: '#textavia-text-cleaner',
    hermesCategory: 'writing',
    tags: ['text-cleanup', 'plain-text', 'developer-tools', 'textavia', 'cli'],
    toolIds: ['text.clean', 'text.remove-formatting', 'text.stats'],
  },
  {
    dir: 'textavia-csv-cleaner',
    name: 'textavia-csv-cleaner',
    title: 'Textavia CSV Cleaner',
    summary: 'Clean CSV and convert between CSV, JSON, and Markdown locally.',
    description:
      'Use this skill for CSV cleanup, CSV to JSON conversion, JSON to CSV conversion, CSV to Markdown table conversion, delimiter-safe tabular transforms, and local data preparation with the Textavia CLI.',
    docsPath: '#textavia-csv-cleaner',
    hermesCategory: 'data',
    tags: ['csv', 'json', 'markdown', 'data-cleaning', 'textavia', 'cli'],
    toolIds: [
      'data.csv.clean',
      'data.csv.to-json',
      'data.json.to-csv',
      'data.csv.to-markdown-table',
    ],
  },
  {
    dir: 'textavia-privacy-scrubber',
    name: 'textavia-privacy-scrubber',
    title: 'Textavia Privacy Scrubber',
    summary: 'Redact likely-sensitive text locally before sharing it.',
    description:
      'Use this skill for local redaction of likely-sensitive text, secrets, tokens, email addresses, phone numbers, IDs, and logs before pasting into issues, prompts, tickets, or public documents with the Textavia CLI.',
    docsPath: '#textavia-privacy-scrubber',
    hermesCategory: 'security',
    tags: ['privacy', 'redaction', 'security', 'textavia', 'cli'],
    toolIds: ['text.privacy-scrub'],
  },
  {
    dir: 'textavia-markdown-table-tools',
    name: 'textavia-markdown-table-tools',
    title: 'Textavia Markdown Table Tools',
    summary: 'Create and convert Markdown tables from JSON or CSV locally.',
    description:
      'Use this skill for Markdown table creation, Markdown table to JSON conversion, Markdown table to CSV conversion, JSON to Markdown table conversion, CSV to Markdown table conversion, and local documentation table workflows with the Textavia CLI.',
    docsPath: '#textavia-markdown-table-tools',
    hermesCategory: 'software-dev',
    tags: ['markdown', 'tables', 'csv', 'json', 'textavia', 'cli'],
    toolIds: [
      'data.markdown.table-create',
      'data.markdown.table-to-json',
      'data.markdown.table-to-csv',
      'data.json.to-markdown-table',
      'data.csv.to-markdown-table',
    ],
  },
  {
    dir: 'textavia-regex-helper',
    name: 'textavia-regex-helper',
    title: 'Textavia Regex Helper',
    summary:
      'Test JavaScript regular expressions locally with timeout protection.',
    description:
      'Use this skill for local regular expression testing, match inspection, timeout-protected regex debugging, generated pattern validation, and safe regex experimentation with the Textavia CLI.',
    docsPath: '#textavia-regex-helper',
    hermesCategory: 'software-dev',
    tags: ['regex', 'testing', 'developer-tools', 'textavia', 'cli'],
    toolIds: ['dev.regex.test'],
  },
  {
    dir: 'textavia-dev-converters',
    name: 'textavia-dev-converters',
    title: 'Textavia Developer Converters',
    summary:
      'Convert URL components, YAML, XML, timestamps, UTM URLs, and QR inputs locally.',
    description:
      'Use this skill for local developer conversions including URL encoding and decoding, YAML to JSON, XML formatting, XML to JSON, timestamp parsing, Unix time conversion, UTM URL construction, and QR SVG generation with the Textavia CLI.',
    docsPath: '#textavia-dev-converters',
    hermesCategory: 'software-dev',
    tags: [
      'converters',
      'url-encoding',
      'timestamp',
      'xml',
      'yaml',
      'textavia',
    ],
    toolIds: [
      'encoding.url.encode',
      'encoding.url.decode',
      'data.yaml.to-json',
      'data.xml.format',
      'data.xml.to-json',
      'dev.timestamp.parse',
      'dev.timestamp.to-date',
      'dev.timestamp.from-date',
      'dev.utm.build',
      'dev.qr',
    ],
  },
];

const WEB_URL_OVERRIDES: Readonly<Record<string, string>> = {
  'dev.json.minify': 'https://textavia.com/tools/json-minifier',
  'dev.json.validate': 'https://textavia.com/tools/json-formatter',
  'dev.qr': 'https://textavia.com/tools/qr-code',
  'dev.timestamp.from-date':
    'https://textavia.com/tools/unix-timestamp-converter',
  'dev.timestamp.parse': 'https://textavia.com/tools/unix-timestamp-converter',
  'dev.timestamp.to-date':
    'https://textavia.com/tools/unix-timestamp-converter',
  'encoding.base64.data-url': 'https://textavia.com/tools/base64',
  'encoding.base64.decode': 'https://textavia.com/tools/base64/decode/text',
  'encoding.base64.detect':
    'https://textavia.com/tools/base64/standard-detector',
  'encoding.base64.encode': 'https://textavia.com/tools/base64/encode/text',
  'encoding.base64.gzip-check':
    'https://textavia.com/tools/base64/check-gzip-compression',
  'encoding.base64.normalize': 'https://textavia.com/tools/base64/normalize',
  'encoding.base64.repair':
    'https://textavia.com/tools/base64/repair-malformed',
  'encoding.base64.validate': 'https://textavia.com/tools/base64/validate',
  'encoding.url.decode': 'https://textavia.com/tools/url-encoder',
  'encoding.url.encode': 'https://textavia.com/tools/url-encoder',
  'data.markdown.table-create':
    'https://textavia.com/tools/markdown-table-creator',
  'text.clean': 'https://textavia.com/tools/text-cleaner',
  'text.privacy-scrub': 'https://textavia.com/tools/privacy-scrubber',
  'text.stats': 'https://textavia.com/tools/sentence-counter',
};

/** Generates every implemented Textavia agent skill. */
export function generateAgentSkills(
  options: GenerateAgentSkillsOptions = {},
): void {
  const registry = buildCliRegistry({ cliName: 'txv', version: '0.1.0' });
  const outputDirs =
    options.outputDirs ??
    (options.outputDir === undefined
      ? [CLI_SKILLS_DIR, ROOT_SKILLS_DIR]
      : [options.outputDir]);
  for (const outputDir of outputDirs) {
    rmSync(outputDir, { recursive: true, force: true });
    for (const skill of SKILLS) {
      const tools = skill.toolIds.map((id) => {
        const tool = registry.get(id);
        if (tool === undefined) {
          throw new Error(
            `Skill "${skill.dir}" references missing tool "${id}".`,
          );
        }
        if (tool.execute === undefined) {
          throw new Error(
            `Skill "${skill.dir}" references unavailable tool "${id}".`,
          );
        }
        return tool;
      });
      writeSkill(outputDir, skill, tools);
    }
  }
}

function writeSkill(
  outputDir: string,
  skill: SkillSpec,
  tools: readonly TextaviaToolDefinition[],
): void {
  const dir = join(outputDir, skill.dir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'SKILL.md'), renderSkill(skill, tools));
}

function renderSkill(
  skill: SkillSpec,
  tools: readonly TextaviaToolDefinition[],
): string {
  const lines = [
    '---',
    `name: ${skill.name}`,
    `description: ${JSON.stringify(skill.description)}`,
    'version: 0.1.0',
    'author: Caravaca Labs',
    `homepage: ${REPO_DOCS_URL}/agent-skills.md${skill.docsPath}`,
    'metadata:',
    '  openclaw:',
    `    tags: ${JSON.stringify(skill.tags)}`,
    '    requires:',
    '      anyBins: ["txv", "textavia"]',
    '    install:',
    '      - kind: node',
    '        package: textavia',
    '        bins: ["txv", "textavia"]',
    '  hermes:',
    `    tags: ${JSON.stringify(skill.tags)}`,
    `    category: ${skill.hermesCategory}`,
    '    requires_toolsets: ["terminal"]',
    '---',
    '',
    `# ${skill.title}`,
    '',
    skill.summary,
    '',
    'Prefer the local Textavia CLI. Check availability in this order:',
    '',
    '```bash',
    'txv --version',
    'textavia --version',
    'npx textavia --version',
    '```',
    '',
    'If none of those commands work, ask the user before installing Textavia.',
    '',
    '## CLI commands',
    '',
  ];

  for (const tool of tools) {
    const command = stableCommand(tool);
    lines.push(
      `### ${tool.name}`,
      '',
      tool.summary,
      '',
      '```bash',
      command,
      '```',
      '',
    );
    const webUrl = webUrlFor(tool);
    if (webUrl !== undefined) {
      lines.push('Online version:', webUrl, '');
    }
  }

  lines.push(
    '## Safety',
    '',
    '- Process user data locally by default.',
    '- Do not upload secrets, logs, private files, or sensitive data to remote services.',
    '- Use `--json` for structured agent output.',
    '- Use canonical `txv run <tool-id>` commands for automation.',
    '',
  );

  return `${lines.join('\n')}`;
}

function stableCommand(tool: TextaviaToolDefinition): string {
  const command = tool.examples[0]?.command;
  if (command === undefined) {
    return `txv run ${tool.id}`;
  }
  const dotCommand = /^txv\s+([a-z0-9-]+\.[a-z0-9.-]+)(\s+.*)?$/u.exec(command);
  if (dotCommand !== null) {
    return `txv run ${tool.id}${dotCommand[2] ?? ''}`;
  }
  return command;
}

function webUrlFor(tool: TextaviaToolDefinition): string | undefined {
  return WEB_URL_OVERRIDES[tool.id] ?? tool.webUrl;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateAgentSkills();
  process.stdout.write('Agent skills generated.\n');
}
