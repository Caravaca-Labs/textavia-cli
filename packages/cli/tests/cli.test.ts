import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import {
  type TextaviaToolDefinition,
  type ToolRegistry,
  createToolRegistry,
} from '@textavia/core';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { CLI_VERSION } from '../src/cli.js';
import { buildCliRegistry } from '../src/registry-builder.js';
import { runCli } from '../src/router.js';

interface Captured {
  stdout: string;
  stderr: string;
  code: number;
}

async function run(
  registry: ToolRegistry,
  argv: string[],
  options: { stdinText?: string; cwd?: string } = {},
): Promise<Captured> {
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const stdin = new PassThrough();
  if (options.stdinText !== undefined) {
    stdin.end(options.stdinText);
  } else {
    // Emulate a TTY stdin (no piped data) by leaving it empty and marking TTY.
    (stdin as PassThrough & { isTTY?: boolean }).isTTY = true;
  }
  let out = '';
  let err = '';
  stdout.on('data', (chunk: Buffer) => {
    out += chunk.toString();
  });
  stderr.on('data', (chunk: Buffer) => {
    err += chunk.toString();
  });
  const code = await runCli(argv, {
    registry,
    version: CLI_VERSION,
    proc: { cwd: options.cwd ?? process.cwd(), stdin, stdout, stderr },
  });
  return { stdout: out, stderr: err, code };
}

function registry(): ToolRegistry {
  return buildCliRegistry({ cliName: 'txv', version: CLI_VERSION });
}

function networkRegistry(): ToolRegistry {
  const reg = createToolRegistry({ cliName: 'txv', version: '0.1.0' });
  const tool: TextaviaToolDefinition<Record<string, never>> = {
    id: 'dev.network.example',
    name: 'Network Example',
    aliases: ['network example'],
    category: 'dev',
    summary: 'Example network-gated tool.',
    description: 'Used by tests to verify network capability gates.',
    inputKind: ['text'],
    outputKind: ['text'],
    optionsSchema: z.object({}),
    examples: [],
    stability: 'stable',
    requiresNetwork: true,
    execute: () => ({ output: 'network ok', outputKind: 'text' }),
  };
  reg.register(tool);
  return reg;
}

describe('CLI namespace routing', () => {
  it('runs case.slug from positional text', async () => {
    const result = await run(registry(), ['case', 'slug', 'Hello World']);
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toBe('hello-world');
  });

  it('runs case.lower from bare alias via stdin', async () => {
    const result = await run(registry(), ['lower'], { stdinText: 'HeLLo' });
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toBe('hello');
  });

  it('routes txv json format to dev.json.format', async () => {
    const result = await run(registry(), ['json', 'format', '{"a":1}']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('"a": 1');
  });

  it('routes txv format json to dev.json.format', async () => {
    const result = await run(registry(), ['format', 'json', '{"a":1}']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('"a": 1');
  });

  it('routes txv hash sha256 to dev.hash.sha256', async () => {
    const result = await run(registry(), ['hash', 'sha256', 'abc']);
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('treats a filename-like positional as text', async () => {
    const result = await run(registry(), ['slug', 'my file.txt']);
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toBe('my-file-txt');
  });

  it('preserves additional positional operands for multi-input tools', async () => {
    const result = await run(registry(), [
      'regex',
      'test',
      '^[a-z]+$',
      'hello',
      '--json',
    ]);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.output.matched).toBe(true);
  });
});

describe('CLI canonical run', () => {
  it('runs txv run <tool-id>', async () => {
    const result = await run(registry(), ['run', 'case.upper', 'hi']);
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toBe('HI');
  });

  it('errors on unknown tool id', async () => {
    const result = await run(registry(), ['run', 'nope.nope', 'x']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Unknown tool');
  });
});

describe('CLI JSON output', () => {
  it('emits structured success with --json', async () => {
    const result = await run(registry(), ['case', 'lower', 'HI', '--json']);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.ok).toBe(true);
    expect(parsed.tool).toBe('case.lower');
    expect(parsed.output).toBe('hi');
    expect(parsed.meta.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('emits structured errors in --json mode', async () => {
    const result = await run(registry(), ['json', 'format', '{bad}', '--json']);
    expect(result.code).toBe(3);
    const parsed = JSON.parse(result.stderr);
    expect(parsed.ok).toBe(false);
    expect(parsed.error.code).toBe('PARSE_ERROR');
  });

  it('includes explain metadata when --explain is requested', async () => {
    const result = await run(registry(), [
      'case',
      'upper',
      'hi',
      '--json',
      '--explain',
    ]);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.meta.explanation).toContain('uppercase');
  });
});

describe('CLI batch file input', () => {
  it('processes --files as NDJSON in sorted order', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'txv-batch-'));
    try {
      await writeFile(join(dir, 'b.txt'), 'two', 'utf8');
      await writeFile(join(dir, 'a.txt'), 'one', 'utf8');
      const result = await run(registry(), [
        'case',
        'upper',
        '--files',
        join(dir, '*.txt'),
        '--ndjson',
      ]);
      expect(result.code).toBe(0);
      const lines = result.stdout
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line));
      expect(lines.map((line) => line.output)).toEqual(['ONE', 'TWO']);
      expect(lines[0].meta.inputPath).toBe(join(dir, 'a.txt'));
      expect(result.stderr).toBe('');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('processes --files as a JSON result envelope', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'txv-batch-json-'));
    try {
      await writeFile(join(dir, 'a.txt'), 'one', 'utf8');
      const result = await run(registry(), [
        'case',
        'upper',
        '--files',
        join(dir, '*.txt'),
        '--json',
      ]);
      expect(result.code).toBe(0);
      const parsed = JSON.parse(result.stdout);
      expect(parsed.ok).toBe(true);
      expect(parsed.results).toHaveLength(1);
      expect(parsed.results[0].output).toBe('ONE');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('fails loudly when --files matches nothing', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'txv-batch-empty-'));
    try {
      const result = await run(registry(), [
        'case',
        'upper',
        '--files',
        join(dir, '*.txt'),
      ]);
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('No files matched pattern');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe('CLI file writes', () => {
  it('treats positional input as a file path when --write is present', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'txv-write-'));
    try {
      const path = join(dir, 'package.json');
      await writeFile(path, '{"a":1}', 'utf8');
      const result = await run(registry(), ['json', 'format', path, '--write']);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Wrote');
      expect(await readFile(path, 'utf8')).toBe('{\n  "a": 1\n}');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe('CLI data converters', () => {
  it('converts CSV to JSON through the registry route', async () => {
    const result = await run(registry(), [
      'csv',
      'to-json',
      'name,age\nAda,37',
      '--json',
    ]);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.tool).toBe('data.csv.to-json');
    expect(parsed.output).toEqual([{ name: 'Ada', age: '37' }]);
  });

  it('converts JSON to CSV deterministically', async () => {
    const result = await run(registry(), [
      'json',
      'to-csv',
      '[{"name":"Ada","age":37}]',
    ]);
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toBe('name,age\nAda,37');
  });

  it('roundtrips JSON to YAML subset and back to JSON', async () => {
    const yaml = await run(registry(), [
      'json',
      'to-yaml',
      '{"name":"Ada","active":true}',
    ]);
    expect(yaml.code).toBe(0);
    const json = await run(registry(), [
      'yaml',
      'to-json',
      yaml.stdout,
      '--json',
    ]);
    expect(json.code).toBe(0);
    expect(JSON.parse(json.stdout).output).toEqual({
      name: 'Ada',
      active: true,
    });
  });

  it('formats XML and converts XML to JSON', async () => {
    const formatted = await run(registry(), [
      'xml',
      'format',
      '<root><item id="1">Ada</item></root>',
    ]);
    expect(formatted.code).toBe(0);
    expect(formatted.stdout).toContain('  <item id="1">');

    const converted = await run(registry(), [
      'xml',
      'to-json',
      '<root><item id="1">Ada</item></root>',
      '--json',
    ]);
    expect(converted.code).toBe(0);
    expect(JSON.parse(converted.stdout).output.root.item).toEqual({
      '@attributes': { id: '1' },
      '#text': 'Ada',
    });
  });

  it('converts Markdown and HTML helpers', async () => {
    const html = await run(registry(), ['markdown', 'to-html', '# Title']);
    expect(html.code).toBe(0);
    expect(html.stdout.trim()).toBe('<h1>Title</h1>');

    const markdown = await run(registry(), [
      'html',
      'to-markdown',
      '<h1>Title</h1><p>Body</p>',
    ]);
    expect(markdown.code).toBe(0);
    expect(markdown.stdout).toContain('# Title');
  });

  it('converts Markdown tables through table aliases', async () => {
    const input = '| name | age |\n| --- | --- |\n| Ada | 37 |';
    const result = await run(registry(), [
      'table',
      'markdown-to-json',
      input,
      '--json',
    ]);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout).output).toEqual([
      { name: 'Ada', age: '37' },
    ]);
  });
});

describe('CLI developer utilities', () => {
  it('decodes JWTs with a signature warning', async () => {
    const token = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjMifQ.';
    const result = await run(registry(), ['jwt', 'decode', token, '--json']);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.output.payload.sub).toBe('123');
    expect(parsed.meta.warnings[0]).toContain('Signature not verified');
  });

  it('explains cron and computes deterministic next runs', async () => {
    const explain = await run(registry(), ['cron', 'explain', '0 */6 * * *']);
    expect(explain.code).toBe(0);
    expect(explain.stdout).toContain('minute 0');

    const next = await run(registry(), [
      'cron',
      'next',
      '*/30 * * * *',
      '--from',
      '2024-01-01T00:00:00.000Z',
      '--count',
      '2',
      '--json',
    ]);
    expect(next.code).toBe(0);
    expect(JSON.parse(next.stdout).output.runs).toEqual([
      '2024-01-01T00:30:00.000Z',
      '2024-01-01T01:00:00.000Z',
    ]);
  });

  it('checks color contrast and builds UTM URLs', async () => {
    const contrast = await run(registry(), [
      'color',
      'contrast',
      '#111111',
      '#ffffff',
      '--json',
    ]);
    expect(contrast.code).toBe(0);
    expect(JSON.parse(contrast.stdout).output.aaText).toBe(true);

    const utm = await run(registry(), [
      'utm',
      'build',
      'https://example.com/path',
      '--source',
      'newsletter',
      '--medium',
      'email',
    ]);
    expect(utm.code).toBe(0);
    expect(utm.stdout.trim()).toBe(
      'https://example.com/path?utm_source=newsletter&utm_medium=email',
    );
  });

  it('generates local QR SVG output', async () => {
    const result = await run(registry(), [
      'qr',
      'https://textavia.com',
      '--size',
      '128',
    ]);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('<svg');
    expect(result.stdout).toContain('width="128"');
    expect(result.stdout).toContain('height="128"');
    expect(result.stdout).toContain('viewBox="0 0 ');
  });

  it('routes explicit generator aliases before bare aliases', async () => {
    const qr = await run(registry(), [
      'qr',
      'generate',
      'https://textavia.com',
    ]);
    expect(qr.code).toBe(0);
    expect(qr.stdout).toContain('<svg');

    const password = await run(registry(), [
      'password',
      'generate',
      '--length',
      '12',
    ]);
    expect(password.code).toBe(0);
    expect(password.stdout.trim()).toHaveLength(12);
  });
});

describe('CLI recipes and config', () => {
  it('runs the clean-keywords built-in recipe', async () => {
    const result = await run(registry(), [
      'recipe',
      'clean-keywords',
      'Banana\n apple \nbanana\n',
    ]);
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toBe('apple\nbanana');
  });

  it('runs built-in recipes with JSON output and explanations', async () => {
    const result = await run(registry(), [
      'recipe',
      'json-api',
      '{"a":1}',
      '--json',
      '--explain',
    ]);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.tool).toBe('recipe.json-api');
    expect(parsed.output).toBe('{\n  "a": 1\n}');
    expect(parsed.meta.explanation).toContain('json-api');
  });

  it('runs config-defined aliases and output defaults', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'txv-config-'));
    try {
      await writeFile(
        join(dir, 'textavia.config.json'),
        JSON.stringify({
          defaults: { 'output.json': true },
          aliases: { keywords: 'recipe clean-keywords' },
        }),
        'utf8',
      );
      const result = await run(registry(), ['keywords', 'Beta\nalpha\nbeta'], {
        cwd: dir,
      });
      expect(result.code).toBe(0);
      const parsed = JSON.parse(result.stdout);
      expect(parsed.tool).toBe('recipe.clean-keywords');
      expect(parsed.output).toBe('alpha\nbeta');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('applies documented config default aliases to tool options', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'txv-config-defaults-'));
    try {
      await writeFile(
        join(dir, 'textavia.config.json'),
        JSON.stringify({ defaults: { 'json.indent': 4 } }),
        'utf8',
      );
      const result = await run(registry(), ['json', 'format', '{"a":1}'], {
        cwd: dir,
      });
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('    "a": 1');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe('CLI error handling', () => {
  it('maps invalid usage to exit code 1 on stderr', async () => {
    const result = await run(registry(), ['nonexistent', 'command']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Unknown command');
  });

  it('maps argv parse failures to structured JSON errors', async () => {
    const result = await run(registry(), [
      'case',
      'lower',
      '--input',
      '--json',
    ]);
    expect(result.code).toBe(1);
    const parsed = JSON.parse(result.stderr);
    expect(parsed.error.code).toBe('INVALID_USAGE');
    expect(parsed.error.message).toContain('--input requires a value');
  });

  it('maps JSON parse errors to exit code 3', async () => {
    const result = await run(registry(), ['json', 'format', '{bad}']);
    expect(result.code).toBe(3);
    expect(result.stderr).toContain('Invalid JSON');
  });

  it('reports no input with exit code 1 when stdin is a tty', async () => {
    const result = await run(registry(), ['case', 'lower']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('No input');
  });

  it('blocks network tools without --allow-network', async () => {
    const result = await run(networkRegistry(), [
      'run',
      'dev.network.example',
      'x',
      '--json',
    ]);
    expect(result.code).toBe(5);
    const parsed = JSON.parse(result.stderr);
    expect(parsed.error.code).toBe('NETWORK_REQUIRED');
  });

  it('maps --write with a missing positional file to file I/O error', async () => {
    const result = await run(registry(), ['case', 'lower', 'HI', '--write']);
    expect(result.code).toBe(2);
    expect(result.stderr).toContain('Failed to read file: HI');
  });

  it('maps optional formatter commands to plugin missing errors', async () => {
    const result = await run(registry(), ['format', 'ts', 'let a=1', '--json']);
    expect(result.code).toBe(7);
    const parsed = JSON.parse(result.stderr);
    expect(parsed.error.code).toBe('PLUGIN_MISSING');
    expect(parsed.error.plugin).toBe('@textavia/plugin-formatters');
    expect(parsed.error.install).toBe(
      'npm install -g @textavia/plugin-formatters',
    );
  });

  it('maps optional media commands to plugin missing errors', async () => {
    const result = await run(registry(), ['image', 'convert', '--json']);
    expect(result.code).toBe(7);
    const parsed = JSON.parse(result.stderr);
    expect(parsed.error.code).toBe('PLUGIN_MISSING');
    expect(parsed.error.plugin).toBe('@textavia/plugin-media');
  });
});

describe('CLI tool discovery', () => {
  it('lists tools in human mode', async () => {
    const result = await run(registry(), ['tools', 'list']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('case.slug');
  });

  it('lists tools in json mode', async () => {
    const result = await run(registry(), ['tools', 'list', '--json']);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.tools.length).toBeGreaterThan(0);
  });

  it('searches tools', async () => {
    const result = await run(registry(), ['tools', 'search', 'slug', '--json']);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.tools).toContain('case.slug');
  });

  it('shows tool info', async () => {
    const result = await run(registry(), ['tools', 'info', 'case.slug']);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('case.slug');
  });
});

describe('CLI agent mode', () => {
  it('agent run emits JSON and never prompts', async () => {
    const result = await run(registry(), ['agent', 'run', 'case.lower', 'HI']);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.ok).toBe(true);
    expect(parsed.output).toBe('hi');
  });

  it('agent manifest lists available tools', async () => {
    const result = await run(registry(), ['agent', 'manifest']);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.cli).toBe('txv');
    expect(parsed.tools.length).toBeGreaterThan(0);
  });

  it('agent tools emits the tool list only', async () => {
    const result = await run(registry(), ['agent', 'tools']);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.tools.length).toBeGreaterThan(0);
    expect(parsed.cli).toBeUndefined();
  });

  it('agent explain emits machine-readable tool metadata', async () => {
    const result = await run(registry(), [
      'agent',
      'explain',
      'encoding.base64.normalize',
    ]);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed.id).toBe('encoding.base64.normalize');
    expect(parsed.stability).toBe('stable');
    expect(parsed.command).toBe('txv run encoding.base64.normalize');
  });
});

describe('CLI help and version', () => {
  it('prints help for bare invocation', async () => {
    const result = await run(registry(), []);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Textavia CLI');
  });

  it('prints version', async () => {
    const result = await run(registry(), ['version']);
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toBe('0.1.3');
  });
});
