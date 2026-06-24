/**
 * @fileoverview Global option definitions shared by Commander and the manual
 * dispatcher. Value options take an argument; boolean options are flags.
 */

export interface GlobalOptionSpec {
  readonly flag: string;
  readonly key: string;
  readonly description: string;
  readonly takesValue: boolean;
  /** Default value when the flag is absent. */
  readonly defaultValue?: string | boolean;
}

/** Every global option recognized by the CLI. */
export const GLOBAL_OPTIONS: readonly GlobalOptionSpec[] = [
  {
    flag: '--input',
    key: 'input',
    description: 'Input text',
    takesValue: true,
  },
  {
    flag: '--file',
    key: 'file',
    description: 'Read input from a single file',
    takesValue: true,
  },
  {
    flag: '--files',
    key: 'files',
    description: 'Glob of files for batch-capable tools',
    takesValue: true,
  },
  {
    flag: '--stdin',
    key: 'stdin',
    description: 'Force reading from stdin',
    takesValue: false,
  },
  {
    flag: '--out',
    key: 'out',
    description: 'Write output to a file path',
    takesValue: true,
  },
  {
    flag: '--out-dir',
    key: 'outDir',
    description: 'Write outputs into a directory',
    takesValue: true,
  },
  {
    flag: '--write',
    key: 'write',
    description: 'Overwrite the source file in place',
    takesValue: false,
  },
  {
    flag: '--dry-run',
    key: 'dryRun',
    description: 'Report intended writes without writing',
    takesValue: false,
  },
  {
    flag: '--backup',
    key: 'backup',
    description: 'Create a .bak before overwriting with --write',
    takesValue: false,
  },
  {
    flag: '--encoding',
    key: 'encoding',
    description: 'Text encoding (default utf8)',
    takesValue: true,
    defaultValue: 'utf8',
  },
  {
    flag: '--json',
    key: 'json',
    description: 'Emit structured JSON output',
    takesValue: false,
  },
  {
    flag: '--ndjson',
    key: 'ndjson',
    description: 'Emit one JSON object per batch item',
    takesValue: false,
  },
  {
    flag: '--quiet',
    key: 'quiet',
    description: 'Suppress nonessential human output',
    takesValue: false,
  },
  {
    flag: '--no-color',
    key: 'noColor',
    description: 'Disable color output',
    takesValue: false,
  },
  {
    flag: '--explain',
    key: 'explain',
    description: 'Include an explanation in structured output',
    takesValue: false,
  },
  {
    flag: '--config',
    key: 'config',
    description: 'Path to a config file',
    takesValue: true,
  },
  {
    flag: '--allow-network',
    key: 'allowNetwork',
    description: 'Permit network-requiring tools',
    takesValue: false,
  },
  {
    flag: '--unsafe',
    key: 'unsafe',
    description: 'Permit risky operations',
    takesValue: false,
  },
  {
    flag: '--debug',
    key: 'debug',
    description: 'Print stack traces for errors',
    takesValue: false,
  },
];

/** The set of value-option flags, for fast lookup during parsing. */
export const VALUE_OPTION_FLAGS: readonly string[] = GLOBAL_OPTIONS.filter(
  (option) => option.takesValue,
).map((option) => option.flag);
