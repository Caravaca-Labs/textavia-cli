/**
 * @fileoverview Agent skill generator.
 *
 * Generates SKILL.md files from registry metadata for implemented tool groups.
 * The generator intentionally fails when a referenced tool is missing so skill
 * docs cannot drift from the registry.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildCliRegistry } from '../packages/cli/src/index.ts';
import type { TextaviaToolDefinition } from '../packages/core/src/index.ts';

const REPO_ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const SKILLS_DIR = join(REPO_ROOT, 'packages', 'agent-skills', 'skills');

interface SkillSpec {
  readonly dir: string;
  readonly title: string;
  readonly summary: string;
  readonly toolIds: readonly string[];
}

export interface GenerateAgentSkillsOptions {
  readonly outputDir?: string;
}

const SKILLS: readonly SkillSpec[] = [
  {
    dir: 'text-cleaner',
    title: 'Textavia Text Cleaner Skill',
    summary: 'Use this skill to clean, normalize, and inspect text locally.',
    toolIds: ['text.clean', 'text.remove-formatting', 'text.stats'],
  },
  {
    dir: 'base64',
    title: 'Textavia Base64 Skill',
    summary: 'Use this skill to encode, decode, and validate Base64 locally.',
    toolIds: [
      'encoding.base64.encode',
      'encoding.base64.decode',
      'encoding.base64.validate',
    ],
  },
  {
    dir: 'json-formatter',
    title: 'Textavia JSON Formatter Skill',
    summary: 'Use this skill to format, minify, and validate JSON locally.',
    toolIds: ['dev.json.format', 'dev.json.minify', 'dev.json.validate'],
  },
  {
    dir: 'markdown-table',
    title: 'Textavia Markdown Table Skill',
    summary:
      'Use this skill to create and convert Markdown tables from JSON or CSV locally.',
    toolIds: [
      'data.markdown.table-create',
      'data.markdown.table-to-json',
      'data.markdown.table-to-csv',
      'data.json.to-markdown-table',
      'data.csv.to-markdown-table',
    ],
  },
  {
    dir: 'privacy-scrubber',
    title: 'Textavia Privacy Scrubber Skill',
    summary: 'Use this skill to redact likely-sensitive text locally.',
    toolIds: ['text.privacy-scrub'],
  },
];

/** Generates every implemented Textavia agent skill. */
export function generateAgentSkills(
  options: GenerateAgentSkillsOptions = {},
): void {
  const registry = buildCliRegistry({ cliName: 'txv', version: '0.1.0' });
  const outputDir = options.outputDir ?? SKILLS_DIR;
  for (const skill of SKILLS) {
    const tools = skill.toolIds.map((id) => {
      const tool = registry.get(id);
      if (tool === undefined) {
        throw new Error(
          `Skill "${skill.dir}" references missing tool "${id}".`,
        );
      }
      return tool;
    });
    writeSkill(outputDir, skill, tools);
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
  const lines = [`# ${skill.title}`, '', skill.summary, '', '## CLI', ''];

  for (const tool of tools) {
    const command = tool.examples[0]?.command ?? `txv run ${tool.id}`;
    lines.push(`### ${tool.name}`, '', '```bash', command, '```', '');
    if (tool.webUrl !== undefined) {
      lines.push('## Online tool', '', `[${tool.webUrl}](${tool.webUrl})`, '');
    }
  }

  lines.push(
    '## Notes',
    '',
    '- Runs locally by default.',
    '- Use `--json` for structured agent output.',
    '- Use canonical tool IDs with `txv run <tool-id>` for automation.',
    '',
  );

  return `${lines.join('\n')}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateAgentSkills();
  process.stdout.write('Agent skills generated.\n');
}
