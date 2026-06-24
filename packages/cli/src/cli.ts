#!/usr/bin/env node
/**
 * @fileoverview Textavia CLI entrypoint.
 *
 * Wires the `textavia` and `txv` binaries. Commander renders --help/--version;
 * all dispatch flows through {@link runCli} so the dynamic command grammar and
 * passthrough tool options stay deterministic and testable.
 */

import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { GLOBAL_OPTIONS } from './global-options.js';
import { buildCliRegistry, loadOptionalPlugin } from './registry-builder.js';
import { runCli } from './router.js';

export const CLI_VERSION = '0.1.4';
export const CLI_NAME = 'txv';

/** Builds a Commander program used to render help and version output. */
export function buildHelpProgram(): Command {
  const program = new Command();
  program
    .name(CLI_NAME)
    .description(
      'Fast, local-first command-line toolkit for text, data, and encoding.',
    )
    .version(CLI_VERSION)
    .usage('<namespace> <operation> [input] [options]')
    .allowUnknownOption(true);
  for (const option of GLOBAL_OPTIONS) {
    if (option.takesValue) {
      program.option(`${option.flag} <value>`, option.description);
    } else {
      program.option(option.flag, option.description);
    }
  }
  return program;
}

/** Builds the help text string without triggering a process exit. */
export function buildHelpText(): string {
  return buildHelpProgram().helpInformation();
}

/** Program entrypoint. Returns the exit code; never resolves to undefined. */
export async function main(argv: readonly string[]): Promise<number> {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(buildHelpText());
    return 0;
  }
  if (argv.includes('--version') || argv.includes('-V')) {
    process.stdout.write(`${CLI_VERSION}\n`);
    return 0;
  }

  const registry = buildCliRegistry({
    cliName: CLI_NAME,
    version: CLI_VERSION,
  });
  // Best-effort optional plugin loading; missing plugins are not an error here.
  await loadOptionalPlugin(registry, '@textavia/plugin-formatters');
  await loadOptionalPlugin(registry, '@textavia/plugin-media');
  await loadOptionalPlugin(registry, '@textavia/plugin-style');
  await loadOptionalPlugin(registry, '@textavia/plugin-data');

  const code = await runCli(argv, {
    registry,
    version: CLI_VERSION,
    proc: {
      cwd: process.cwd(),
      stdin: process.stdin,
      stdout: process.stdout,
      stderr: process.stderr,
    },
  });
  return code;
}

function installBrokenPipeHandler(stream: NodeJS.WritableStream): void {
  stream.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EPIPE') {
      process.exitCode = 0;
      return;
    }
    throw error;
  });
}

export function isDirectCliEntry(
  moduleUrl: string,
  argvPath = process.argv[1],
): boolean {
  if (!argvPath) {
    return false;
  }
  const modulePath = fileURLToPath(moduleUrl);
  try {
    return realpathSync(modulePath) === realpathSync(argvPath);
  } catch {
    return modulePath === argvPath;
  }
}

// When executed directly (not imported), run main and exit with its code.
if (isDirectCliEntry(import.meta.url)) {
  installBrokenPipeHandler(process.stdout);
  installBrokenPipeHandler(process.stderr);
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      process.stderr.write(
        `Fatal error: ${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exitCode = 1;
    });
}
