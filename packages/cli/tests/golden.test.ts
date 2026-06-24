import { PassThrough } from 'node:stream';
import type { ToolRegistry } from '@textavia/core';
import { describe, expect, it } from 'vitest';
import { buildCliRegistry } from '../src/registry-builder.js';
import { runCli } from '../src/router.js';

interface Captured {
  readonly stdout: string;
  readonly stderr: string;
  readonly code: number;
}

async function run(argv: string[]): Promise<Captured> {
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const stdin = new PassThrough();
  (stdin as PassThrough & { isTTY?: boolean }).isTTY = true;
  let out = '';
  let err = '';
  stdout.on('data', (chunk: Buffer) => {
    out += chunk.toString();
  });
  stderr.on('data', (chunk: Buffer) => {
    err += chunk.toString();
  });
  const registry: ToolRegistry = buildCliRegistry({
    cliName: 'txv',
    version: '0.1.0',
  });
  const code = await runCli(argv, {
    registry,
    version: '0.1.0',
    proc: { cwd: process.cwd(), stdin, stdout, stderr },
  });
  return { stdout: out, stderr: err, code };
}

function normalizeJsonPayload(text: string): string {
  const payload = JSON.parse(text);
  if (payload.meta?.durationMs !== undefined) {
    payload.meta.durationMs = 0;
  }
  return JSON.stringify(payload, null, 2);
}

function normalizeUuid(text: string): string {
  return text.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
    '<uuid>',
  );
}

function normalizeHuman(text: string): string {
  return text.replace(/"local": ".*"/, '"local": "<local>"');
}

describe('CLI golden output', () => {
  it('snapshots representative human outputs', async () => {
    const outputs = [
      await run(['case', 'slug', 'Hello World!']),
      await run(['lines', 'sort', 'b\na\nc']),
      await run(['base64', 'encode', 'hello']),
      await run(['url', 'encode', 'a b&c']),
      await run(['json', 'format', '{"a":1}']),
      await run(['hash', 'md5', 'abc']),
      await run(['timestamp', 'to-date', '1704067200']),
    ].map((result) => normalizeHuman(result.stdout.trim()));

    expect(outputs.join('\n---\n')).toMatchInlineSnapshot(`
      "hello-world
      ---
      a
      b
      c
      ---
      aGVsbG8=
      ---
      a%20b%26c
      ---
      {
        "a": 1
      }
      ---
      900150983cd24fb0d6963f7d28e17f72
      ---
      {
        "iso": "2024-01-01T00:00:00.000Z",
        "local": "<local>"
      }"
    `);
  });

  it('snapshots normalized JSON success and error shapes', async () => {
    const success = await run(['case', 'camel', 'hello world', '--json']);
    const error = await run(['json', 'format', '{bad}', '--json']);

    expect(success.code).toBe(0);
    expect(error.code).toBe(3);
    expect(normalizeJsonPayload(success.stdout)).toMatchInlineSnapshot(`
      "{
        "ok": true,
        "tool": "case.camel",
        "inputType": "text",
        "outputType": "text",
        "output": "helloWorld",
        "meta": {
          "durationMs": 0
        }
      }"
    `);
    expect(JSON.parse(error.stderr)).toMatchInlineSnapshot(`
      {
        "error": {
          "code": "PARSE_ERROR",
          "details": {
            "column": 2,
            "line": 1,
            "position": 1,
          },
          "hint": "Validate the structure and quoting before retrying.",
          "message": "Invalid JSON: Expected property name or '}' in JSON at position 1 (line 1 column 2)",
        },
        "ok": false,
      }
    `);
  });

  it('snapshots normalized random output shape', async () => {
    const uuid = await run(['random', 'uuid']);
    expect(uuid.code).toBe(0);
    expect(normalizeUuid(uuid.stdout.trim())).toMatchInlineSnapshot(`"<uuid>"`);
  });
});
