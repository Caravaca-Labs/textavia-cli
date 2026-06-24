/**
 * @fileoverview Base64 encode, decode, and validate transforms.
 *
 * Encoding accepts text (UTF-8) or raw bytes and is byte-safe for file input.
 * Decoding can return text or raw bytes. Validation reports whether a string
 * is well-formed Base64.
 */

/** Encodes a UTF-8 string to Base64. */
export function encodeBase64Text(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64');
}

/** Encodes raw bytes to Base64. */
export function encodeBase64Bytes(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

/** Decodes a Base64 string to raw bytes. Throws on invalid input. */
export function decodeBase64ToBytes(input: string): Uint8Array {
  if (!isValidBase64(input)) {
    throw new Error('Input is not valid Base64.');
  }
  return new Uint8Array(Buffer.from(input, 'base64'));
}

/** Decodes a Base64 string to UTF-8 text. Throws on invalid input. */
export function decodeBase64ToText(input: string): string {
  const bytes = decodeBase64ToBytes(input);
  return Buffer.from(bytes).toString('utf8');
}

/** True when `input` is well-formed Base64 (standard alphabet, correct padding). */
export function isValidBase64(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return false;
  }
  if (trimmed.length % 4 !== 0) {
    return false;
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed)) {
    return false;
  }
  // Padding can only appear at the end and at most two chars.
  const equalIndex = trimmed.indexOf('=');
  if (
    equalIndex !== -1 &&
    trimmed.slice(equalIndex).replace(/=/g, '').length > 0
  ) {
    return false;
  }
  return true;
}

/** Encodes raw bytes to a Base64 data URL with the given MIME type. */
export function toDataUrl(bytes: Uint8Array, mimeType: string): string {
  return `data:${mimeType};base64,${encodeBase64Bytes(bytes)}`;
}

/** Decodes a data URL into its MIME type and raw bytes. Throws on invalid input. */
export function fromDataUrl(dataUrl: string): {
  mimeType: string;
  bytes: Uint8Array;
} {
  const match = /^data:([^;,]+);base64,(.*)$/s.exec(dataUrl.trim());
  if (match === null) {
    throw new Error('Input is not a valid base64 data URL.');
  }
  const mimeType = match[1] ?? 'application/octet-stream';
  const bytes = decodeBase64ToBytes(match[2] ?? '');
  return { mimeType, bytes };
}
