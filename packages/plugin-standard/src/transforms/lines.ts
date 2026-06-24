/**
 * @fileoverview Pure line/list transforms.
 *
 * `trim` and `remove-empty` are streamable (one line at a time). `unique`,
 * `sort`, and `duplicates` require the full input and are marked full-file.
 */

/** Sort direction. */
export type SortDirection = 'asc' | 'desc';

/** Options for {@link sortLines}. */
export interface SortOptions {
  readonly direction?: SortDirection;
  readonly caseInsensitive?: boolean;
  readonly numeric?: boolean;
  readonly unique?: boolean;
}

/** Splits text into lines without a trailing empty element. */
export function splitLines(text: string): string[] {
  if (text.length === 0) {
    return [];
  }
  const lines = text.split('\n');
  // A trailing newline should not produce an empty final line.
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

/** Trims whitespace from every line. */
export function trimLines(lines: readonly string[]): string[] {
  return lines.map((line) => line.trim());
}

/** Removes lines that are empty after trimming. */
export function removeEmptyLines(lines: readonly string[]): string[] {
  return lines.filter((line) => line.trim().length > 0);
}

/** Removes duplicate lines, preserving first-seen order. */
export function uniqueLines(lines: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    if (!seen.has(line)) {
      seen.add(line);
      out.push(line);
    }
  }
  return out;
}

/** Returns lines that appear more than once (each duplicate reported once). */
export function duplicateLines(lines: readonly string[]): string[] {
  const counts = new Map<string, number>();
  for (const line of lines) {
    counts.set(line, (counts.get(line) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([line]) => line);
}

function compareValues(
  a: string,
  b: string,
  options: Required<
    Pick<SortOptions, 'direction' | 'caseInsensitive' | 'numeric'>
  >,
): number {
  const dir = options.direction === 'desc' ? -1 : 1;
  if (options.numeric) {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) {
      return (na - nb) * dir;
    }
  }
  const ca = options.caseInsensitive ? a.toLowerCase() : a;
  const cb = options.caseInsensitive ? b.toLowerCase() : b;
  if (ca < cb) {
    return -1 * dir;
  }
  if (ca > cb) {
    return 1 * dir;
  }
  return 0;
}

/** Sorts lines according to {@link SortOptions}. */
export function sortLines(
  lines: readonly string[],
  options: SortOptions = {},
): string[] {
  const resolved = {
    direction: options.direction ?? 'asc',
    caseInsensitive: options.caseInsensitive ?? false,
    numeric: options.numeric ?? false,
  };
  const working = options.unique ? uniqueLines(lines) : [...lines];
  return working.sort((a, b) => compareValues(a, b, resolved));
}

/** Counts the number of lines (a trailing newline does not add a line). */
export function countLines(lines: readonly string[]): number {
  return lines.length;
}

/** The four-way result of comparing two line lists. */
export interface CompareResult {
  readonly onlyInA: readonly string[];
  readonly onlyInB: readonly string[];
  readonly common: readonly string[];
}

/** Compares two line lists, returning items unique to each and shared items. */
export function compareLines(listA: string[], listB: string[]): CompareResult {
  const setA = new Set(listA);
  const setB = new Set(listB);
  const onlyInA = listA.filter((line) => !setB.has(line));
  const onlyInB = listB.filter((line) => !setA.has(line));
  const common = listA.filter((line) => setB.has(line));
  return { onlyInA, onlyInB, common };
}
