/**
 * @fileoverview Shared config and recipe contracts.
 *
 * The concrete Zod parsing lives in @textavia/schemas; core only defines the
 * type shapes so the recipe runner and CLI config loader stay decoupled.
 */

/** A single recipe pipeline step: a canonical tool id plus options. */
export type RecipeStep = readonly [
  toolId: string,
  options?: Readonly<Record<string, unknown>>,
];

/** A named recipe definition. */
export interface RecipeDefinition {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly steps: readonly RecipeStep[];
  /** True when every step supports streaming input. */
  readonly streaming?: boolean;
}

/** Project-level config file model. */
export interface TextaviaConfig {
  readonly defaults?: Readonly<Record<string, unknown>>;
  readonly aliases?: Readonly<Record<string, string>>;
  readonly recipes?: Readonly<Record<string, readonly RecipeStep[]>>;
  readonly network?: {
    readonly allow?: boolean;
  };
}

/** Success object emitted by JSON/agent output mode. */
export interface JsonSuccessOutput<T = unknown> {
  readonly ok: true;
  readonly tool: string;
  readonly inputType: string;
  readonly outputType: string;
  readonly output: T;
  readonly meta: {
    readonly durationMs: number;
    readonly warnings?: readonly string[];
    readonly explanation?: string;
    readonly writtenFiles?: readonly string[];
    readonly [key: string]: unknown;
  };
}

/** Error object emitted by JSON/agent output mode. */
export interface JsonErrorOutput {
  readonly ok: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly hint?: string;
    readonly plugin?: string;
    readonly install?: string;
    readonly details?: unknown;
  };
}
