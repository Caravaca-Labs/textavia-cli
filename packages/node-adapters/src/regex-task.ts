/**
 * @fileoverview Task and result contracts shared between the regex worker and
 * its parent helper.
 */

/** A regex evaluation task sent to the worker. */
export interface RegexWorkerTask {
  readonly pattern: string;
  readonly flags: string;
  readonly input: string;
  readonly global: boolean;
  /** Cap to bound output size and detect runaway matches. */
  readonly maxMatches: number;
}

/** A single match found by the worker. */
export interface RegexMatch {
  readonly index: number;
  readonly value: string;
  readonly groups: readonly string[];
}

/** The result returned by the worker. */
export interface RegexWorkerResult {
  readonly matched: boolean;
  readonly matches: readonly RegexMatch[];
  readonly inputLength: number;
}

/** A failure message posted by the worker. */
export interface RegexWorkerError {
  readonly error: string;
}
