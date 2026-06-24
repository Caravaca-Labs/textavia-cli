/**
 * @fileoverview Pure Unicode transforms: normalization and inspection.
 *
 * Normalization supports the four standard forms. Inspection reports code
 * points with hex values and flags combining characters so users can diagnose
 * normalization issues. Emoji preservation relies on iterating code points
 * rather than UTF-16 code units.
 */

/** Supported Unicode normalization forms. */
export type NormalizationForm = 'NFC' | 'NFD' | 'NFKC' | 'NFKD';

const FORMS: readonly NormalizationForm[] = ['NFC', 'NFD', 'NFKC', 'NFKD'];

/** True when `form` is a supported normalization form. */
export function isNormalizationForm(form: string): form is NormalizationForm {
  return (FORMS as readonly string[]).includes(form);
}

/** Normalizes `text` to the given form. Throws for unknown forms. */
export function normalize(text: string, form: NormalizationForm): string {
  if (!isNormalizationForm(form)) {
    throw new Error(
      `Unsupported normalization form: "${form}". Use NFC, NFD, NFKC, or NFKD.`,
    );
  }
  return text.normalize(form);
}

/** Details about a single code point in a string. */
export interface CodePointInfo {
  readonly index: number;
  readonly character: string;
  readonly codePoint: number;
  readonly hex: string;
  readonly name: string;
  readonly isCombining: boolean;
}

function codePointName(codePoint: number): string {
  if (codePoint <= 0x1f) return `<control ${codePoint}>`;
  if (codePoint >= 0x1f300 && codePoint <= 0x1faff) return 'Emoji';
  if (codePoint >= 0x0300 && codePoint <= 0x036f)
    return 'Combining Diacritical Mark';
  return 'Character';
}

function isCombiningCodePoint(codePoint: number): boolean {
  return (
    (codePoint >= 0x0300 && codePoint <= 0x036f) ||
    (codePoint >= 0x1ab0 && codePoint <= 0x1aff) ||
    (codePoint >= 0x1dc0 && codePoint <= 0x1dff) ||
    (codePoint >= 0x20d0 && codePoint <= 0x20ff) ||
    (codePoint >= 0xfe20 && codePoint <= 0xfe2f)
  );
}

/**
 * Inspects every code point in `text`. Each entry reports the character, its
 * numeric code point, a hex representation, a best-effort name, and whether it
 * is a combining mark.
 */
export function inspectCodePoints(text: string): CodePointInfo[] {
  const out: CodePointInfo[] = [];
  let index = 0;
  for (const character of text) {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined) {
      continue;
    }
    out.push({
      index,
      character,
      codePoint,
      hex: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
      name: codePointName(codePoint),
      isCombining: isCombiningCodePoint(codePoint),
    });
    index += 1;
  }
  return out;
}
