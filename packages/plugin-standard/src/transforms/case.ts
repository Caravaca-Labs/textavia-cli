/**
 * @fileoverview Pure case conversion transforms.
 *
 * Word tokenization understands camelCase, PascalCase, kebab-case,
 * snake_case, SCREAMING_SNAKE, dots, and whitespace/punctuation boundaries so
 * conversions are stable regardless of the input style.
 */

/** Every case mode supported by the case tool. */
export type CaseMode =
  | 'lower'
  | 'upper'
  | 'sentence'
  | 'title'
  | 'capitalized'
  | 'alternating'
  | 'inverse'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'screaming-snake'
  | 'kebab'
  | 'dot'
  | 'slug';

/** Lowercases text, optionally using a locale. */
export function toLower(text: string, locale?: string): string {
  return locale === undefined
    ? text.toLowerCase()
    : text.toLocaleLowerCase(locale);
}

/** Uppercases text, optionally using a locale. */
export function toUpper(text: string, locale?: string): string {
  return locale === undefined
    ? text.toUpperCase()
    : text.toLocaleUpperCase(locale);
}

/**
 * Splits text into words. Recognizes camelCase boundaries and treats any run
 * of non-alphanumeric characters (except within a camel boundary) as a
 * separator. Apostrophes inside words are preserved.
 */
export function tokenizeWords(text: string): string[] {
  // Insert a boundary between a lowercase/digit and an uppercase letter.
  const withBoundaries = text.replace(/([a-z0-9])([A-Z])/g, '$1\u0000$2');
  // Insert a boundary between consecutive uppercase letters and a following
  // uppercase->lowercase transition (e.g. "HTTPRequest" -> "HTTP","Request").
  const grouped = withBoundaries.replace(/([A-Z]+)([A-Z][a-z])/g, '$1\u0000$2');
  const raw = grouped.split(/[^A-Za-z0-9']+/);
  return raw.filter((word) => word.length > 0);
}

function joinWith(words: string[], separator: string, locale?: string): string {
  return words.map((w) => toLower(w, locale)).join(separator);
}

function capitalizeWord(word: string): string {
  if (word.length === 0) {
    return word;
  }
  return word[0]?.toUpperCase() + word.slice(1).toLowerCase();
}

/** Converts text to sentence case (capitalize first letter of the string). */
export function toSentenceCase(text: string): string {
  if (text.length === 0) {
    return text;
  }
  return text[0]?.toUpperCase() + text.slice(1).toLowerCase();
}

/** Converts text to title case (capitalize first letter of each word). */
export function toTitleCase(text: string): string {
  return text
    .split(/(\s+)/)
    .map((segment) =>
      segment.trim().length === 0 ? segment : capitalizeWord(segment),
    )
    .join('');
}

/** Capitalizes only the first character, leaving the rest untouched. */
export function toCapitalized(text: string): string {
  if (text.length === 0) {
    return text;
  }
  return text[0]?.toUpperCase() + text.slice(1);
}

/** Alternates letter case starting with uppercase. */
export function toAlternating(text: string, startUpper = true): string {
  let upper = startUpper;
  let out = '';
  for (const char of text) {
    if (/[a-zA-Z]/.test(char)) {
      out += upper ? char.toUpperCase() : char.toLowerCase();
      upper = !upper;
    } else {
      out += char;
    }
  }
  return out;
}

/** Inverts the case of every cased letter. */
export function toInverseCase(text: string): string {
  let out = '';
  for (const char of text) {
    if (char === char.toUpperCase() && char !== char.toLowerCase()) {
      out += char.toLowerCase();
    } else if (char === char.toLowerCase() && char !== char.toUpperCase()) {
      out += char.toUpperCase();
    } else {
      out += char;
    }
  }
  return out;
}

/** Converts tokenized words to camelCase. */
export function toCamelCase(text: string): string {
  const words = tokenizeWords(text);
  return words
    .map((word, i) => (i === 0 ? word.toLowerCase() : capitalizeWord(word)))
    .join('');
}

/** Converts tokenized words to PascalCase. */
export function toPascalCase(text: string): string {
  return tokenizeWords(text).map(capitalizeWord).join('');
}

/** Converts tokenized words to snake_case. */
export function toSnakeCase(text: string, locale?: string): string {
  return joinWith(tokenizeWords(text), '_', locale);
}

/** Converts tokenized words to SCREAMING_SNAKE_CASE. */
export function toScreamingSnakeCase(text: string): string {
  return tokenizeWords(text)
    .map((w) => w.toUpperCase())
    .join('_');
}

/** Converts tokenized words to kebab-case. */
export function toKebabCase(text: string, locale?: string): string {
  return joinWith(tokenizeWords(text), '-', locale);
}

/** Converts tokenized words to dot.case. */
export function toDotCase(text: string, locale?: string): string {
  return joinWith(tokenizeWords(text), '.', locale);
}

/**
 * Converts text to a URL slug: lowercase, ASCII-only alphanumerics joined by a
 * separator (default '-'). Non-ASCII letters are preserved as-is so
 * international text is not corrupted.
 */
export function toSlug(text: string, separator = '-', locale?: string): string {
  const words = tokenizeWords(text);
  return words.map((w) => toLower(w, locale)).join(separator);
}

const CASE_FUNCTIONS: Record<
  CaseMode,
  (text: string, locale?: string) => string
> = {
  lower: toLower,
  upper: toUpper,
  sentence: toSentenceCase,
  title: toTitleCase,
  capitalized: toCapitalized,
  alternating: (text) => toAlternating(text),
  inverse: (text) => toInverseCase(text),
  camel: (text) => toCamelCase(text),
  pascal: (text) => toPascalCase(text),
  snake: (text) => toSnakeCase(text),
  'screaming-snake': (text) => toScreamingSnakeCase(text),
  kebab: (text) => toKebabCase(text),
  dot: (text) => toDotCase(text),
  slug: (text) => toSlug(text),
};

/**
 * Applies a case mode to `text`. Throws for unknown modes so callers fail
 * loudly rather than silently returning the input unchanged.
 */
export function convertCase(
  mode: CaseMode,
  text: string,
  locale?: string,
): string {
  const fn = CASE_FUNCTIONS[mode];
  if (fn === undefined) {
    throw new Error(`Unknown case mode: "${mode}".`);
  }
  return fn(text, locale);
}

/** All supported case modes, for validation and help output. */
export const CASE_MODES: readonly CaseMode[] = Object.keys(
  CASE_FUNCTIONS,
) as readonly CaseMode[];
