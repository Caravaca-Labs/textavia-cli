/**
 * @fileoverview URL encode and decode transforms.
 */

/** Encodes a string for use in a URL path segment (RFC 3986 unreserved safe). */
export function encodeUrlComponent(text: string): string {
  return encodeURIComponent(text);
}

/** Encodes a full URL, preserving reserved characters where appropriate. */
export function encodeUrl(text: string): string {
  return encodeURI(text);
}

/** Decodes a URL-encoded component. Throws on malformed escape sequences. */
export function decodeUrlComponent(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch (error) {
    throw new Error('Input is not a valid URL-encoded string.', {
      cause: error,
    });
  }
}

/** Decodes a full URL. Throws on malformed escape sequences. */
export function decodeUrl(text: string): string {
  try {
    return decodeURI(text);
  } catch (error) {
    throw new Error('Input is not a valid URL-encoded string.', {
      cause: error,
    });
  }
}
