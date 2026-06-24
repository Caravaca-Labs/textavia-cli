/**
 * @fileoverview Pure text transforms: reverse (grapheme-aware), cleaning,
 * stats, word frequency, syllable estimation, and privacy scrubbing.
 */

/** Reverses text by grapheme cluster so emoji and combining marks survive. */
export function reverseText(text: string): string {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const graphemes: string[] = [];
  for (const { segment } of segmenter.segment(text)) {
    graphemes.push(segment);
  }
  return graphemes.reverse().join('');
}

/**
 * Collapses runs of whitespace into single spaces and trims the result.
 * Line breaks are normalized to spaces.
 */
export function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Strips HTML/XML-like tags, leaving inner text. */
export function toPlainText(text: string): string {
  return cleanText(text.replace(/<[^>]*>/g, ''));
}

/**
 * Removes common formatting noise: zero-width characters, BOM, and excessive
 * whitespace. Non-printable control characters (except tab/newline) are removed.
 */
export function removeFormatting(text: string): string {
  return stripFormattingControlCharacters(text)
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

const FORMAT_CONTROL_CODE_POINTS = new Set([
  0xfeff, 0x200b, 0x200c, 0x200d, 0x2060,
]);

function stripFormattingControlCharacters(text: string): string {
  let output = '';
  for (const character of text) {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined) {
      throw new Error('Unexpected empty character while stripping formatting.');
    }
    const isDisallowedControl =
      (codePoint >= 0x00 && codePoint <= 0x08) ||
      codePoint === 0x0b ||
      codePoint === 0x0c ||
      (codePoint >= 0x0e && codePoint <= 0x1f) ||
      codePoint === 0x7f;
    if (!isDisallowedControl && !FORMAT_CONTROL_CODE_POINTS.has(codePoint)) {
      output += character;
    }
  }
  return output;
}

/** Replaces all occurrences of `search` with `replacement`. */
export function replaceAll(
  text: string,
  search: string,
  replacement: string,
): string {
  if (search === '') {
    throw new Error('search string must not be empty');
  }
  return text.split(search).join(replacement);
}

/** Statistics about a piece of text. */
export interface TextStats {
  readonly characters: number;
  readonly charactersNoSpaces: number;
  readonly words: number;
  readonly lines: number;
  readonly sentences: number;
  readonly bytes: number;
}

/** Computes basic statistics about `text`. */
export function computeStats(text: string): TextStats {
  const characters = [...text].length;
  const charactersNoSpaces = [...text].filter((c) => !/\s/.test(c)).length;
  const words = (text.match(/\S+/g) ?? []).length;
  const lines = text.length === 0 ? 0 : text.split('\n').length;
  const sentences = (text.match(/[^.!?]+[.!?]+/g) ?? []).length;
  return {
    characters,
    charactersNoSpaces,
    words,
    lines,
    sentences,
    bytes: Buffer.byteLength(text, 'utf8'),
  };
}

/** Maps each word to its occurrence count, case-insensitively. */
export function wordFrequency(text: string): Record<string, number> {
  const words = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  const counts: Record<string, number> = {};
  for (const word of words) {
    counts[word] = (counts[word] ?? 0) + 1;
  }
  return counts;
}

/**
 * Estimates the syllable count for a word using a heuristic vowel-group rule.
 * Accurate for most English words; documented as an estimate.
 */
export function countSyllables(word: string): number {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.length === 0) {
    return 0;
  }
  if (normalized.length <= 3) {
    return 1;
  }
  const cleaned = normalized.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  const count = matches === null ? 0 : matches.length;
  return Math.max(1, count);
}

/** Conservative privacy-scrubbing patterns. */
export interface PrivacyScrubPattern {
  readonly id: string;
  readonly label: string;
  readonly pattern: RegExp;
  readonly replacement: string;
}

const PRIVACY_PATTERNS: readonly PrivacyScrubPattern[] = [
  {
    id: 'email',
    label: 'email address',
    pattern: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g,
    replacement: '[EMAIL]',
  },
  {
    id: 'jwt',
    label: 'JWT',
    pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
    replacement: '[JWT]',
  },
  {
    id: 'credit-card',
    label: 'credit-card-like number',
    pattern: /\b(?:\d[ -]*?){13,19}\b/g,
    replacement: '[CREDIT-CARD]',
  },
  {
    id: 'ipv4',
    label: 'IPv4 address',
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: '[IP]',
  },
  {
    id: 'phone',
    label: 'phone number',
    pattern: /(?:\+?\d[\d\s().-]{7,}\d)/g,
    replacement: '[PHONE]',
  },
  {
    id: 'url',
    label: 'URL',
    pattern: /\bhttps?:\/\/[^\s]+/g,
    replacement: '[URL]',
  },
  {
    id: 'basic-auth',
    label: 'basic auth header',
    pattern: /(?:Basic|Bearer)\s+[A-Za-z0-9._~+/=-]{16,}/g,
    replacement: '[AUTH]',
  },
  {
    id: 'api-key',
    label: 'common API key',
    pattern: /\b(?:sk|pk|api|key|token|secret)[_:][A-Za-z0-9]{20,}\b/gi,
    replacement: '[API-KEY]',
  },
];

/** Result of a privacy scrub operation. */
export interface PrivacyScrubResult {
  readonly text: string;
  readonly warnings: readonly string[];
}

/**
 * Replaces likely-sensitive substrings with placeholders. Because these are
 * heuristic patterns, the result includes warnings noting the scrub is not
 * guaranteed to catch every secret.
 */
export function privacyScrub(
  text: string,
  only?: readonly string[],
): PrivacyScrubResult {
  const warnings: string[] = [];
  const patterns =
    only === undefined
      ? PRIVACY_PATTERNS
      : PRIVACY_PATTERNS.filter((p) => only.includes(p.id));
  let result = text;
  for (const pattern of patterns) {
    const matches = result.match(pattern.pattern);
    if (matches !== null && matches.length > 0) {
      result = result.replace(pattern.pattern, pattern.replacement);
      warnings.push(`Scrubbed ${matches.length} ${pattern.label}(s).`);
    }
  }
  warnings.push(
    'Privacy scrub uses heuristic patterns and may miss or over-match. Review the output before sharing.',
  );
  return { text: result, warnings };
}

/** All privacy scrub pattern ids, for option validation and help. */
export const PRIVACY_PATTERN_IDS: readonly string[] = PRIVACY_PATTERNS.map(
  (p) => p.id,
);
