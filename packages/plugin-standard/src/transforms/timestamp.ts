/**
 * @fileoverview Timestamp conversion transforms.
 *
 * Supports generating the current time, parsing timestamp strings, and
 * converting between Unix epoch seconds/millis and human-readable dates.
 */

export type TimestampUnit = 'seconds' | 'milliseconds';

/** Generates the current timestamp in both ISO and Unix forms. */
export function nowTimestamp(unit: TimestampUnit = 'seconds'): {
  iso: string;
  unix: number;
  unit: TimestampUnit;
} {
  const date = new Date();
  const unix =
    unit === 'seconds' ? Math.floor(date.getTime() / 1000) : date.getTime();
  return { iso: date.toISOString(), unix, unit };
}

/** Parses a timestamp string (ISO 8601 or a Unix number) into date details. */
export function parseTimestamp(
  input: string,
  unit: TimestampUnit = 'seconds',
): {
  iso: string;
  unix: number;
  unit: TimestampUnit;
  local: string;
} {
  const trimmed = input.trim();
  let date: Date;
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const numeric = Number(trimmed);
    const millis = unit === 'seconds' ? numeric * 1000 : numeric;
    date = new Date(millis);
  } else {
    date = new Date(trimmed);
  }
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Could not parse timestamp: "${input}".`);
  }
  const unix =
    unit === 'seconds' ? Math.floor(date.getTime() / 1000) : date.getTime();
  return {
    iso: date.toISOString(),
    unix,
    unit,
    local: date.toString(),
  };
}

/** Converts a Unix timestamp to a human-readable date. */
export function unixToDate(
  unix: number,
  unit: TimestampUnit = 'seconds',
): {
  iso: string;
  local: string;
} {
  const millis = unit === 'seconds' ? unix * 1000 : unix;
  const date = new Date(millis);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid Unix timestamp: ${unix}.`);
  }
  return { iso: date.toISOString(), local: date.toString() };
}

/** Converts a human-readable date string to a Unix timestamp. */
export function dateToUnix(
  input: string,
  unit: TimestampUnit = 'seconds',
): {
  unix: number;
  unit: TimestampUnit;
} {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Could not parse date: "${input}".`);
  }
  const unix =
    unit === 'seconds' ? Math.floor(date.getTime() / 1000) : date.getTime();
  return { unix, unit };
}
