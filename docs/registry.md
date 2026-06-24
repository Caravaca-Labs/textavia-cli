# Tool Registry

The registry is the single source of truth for tools, options, examples, and docs.

## case.alternating

Alternate letter case. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-alternating

## case.camel

Convert to camelCase. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-camel

## case.capitalized

Capitalize the first character, keep the rest. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-capitalized

## case.dot

Convert to dot.case. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-dot

## case.inverse

Invert the case of every letter. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-inverse

## case.kebab

Convert to kebab-case. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-kebab

## case.lower

Convert text to lowercase. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-lower

## case.pascal

Convert to PascalCase. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-pascal

## case.screaming-snake

Convert to SCREAMING_SNAKE_CASE. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-screaming-snake

## case.sentence

Capitalize the first character only. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-sentence

## case.slug

Convert to a URL slug. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-slug

## case.snake

Convert to snake_case. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-snake

## case.title

Capitalize the first letter of each word. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-title

## case.upper

Convert text to uppercase. Supports stdin, positional text, and file input.

- **Stability:** stable
- **Category:** case
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/case-upper

## data.csv.clean

Parses CSV, trims every cell, drops fully empty rows, and writes deterministic CSV.

- **Stability:** stable
- **Category:** data
- **Input:** csv, text, file
- **Output:** csv, text
- **Web:** https://textavia.com/tools/csv-cleaner

## data.csv.to-json

Converts a CSV file with a unique header row into an array of JSON objects.

- **Stability:** stable
- **Category:** data
- **Input:** csv, text, file
- **Output:** json
- **Web:** https://textavia.com/tools/csv-to-json

## data.csv.to-markdown-table

Converts CSV rows into a GitHub-flavored Markdown table using the first row as headers.

- **Stability:** stable
- **Category:** data
- **Input:** csv, text, file
- **Output:** markdown, text
- **Web:** https://textavia.com/tools/csv-to-markdown-table

## data.html.escape

Escapes ampersands, angle brackets, quotes, and apostrophes for HTML text nodes.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/html-escape

## data.html.strip

Removes HTML tags and script/style blocks while preserving text content.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/strip-html

## data.html.to-markdown

Converts common HTML block and inline tags to Markdown and strips unsupported tags.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** markdown, text
- **Web:** https://textavia.com/tools/html-to-markdown

## data.html.unescape

Unescapes the named entities emitted by Textavia HTML escape.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/html-unescape

## data.json.to-csv

Converts a JSON object or array of objects to deterministic CSV with stable headers.

- **Stability:** stable
- **Category:** data
- **Input:** json, text, file
- **Output:** csv, text
- **Web:** https://textavia.com/tools/json-to-csv

## data.json.to-markdown-table

Converts a JSON object or array of objects to a GitHub-flavored Markdown table.

- **Stability:** stable
- **Category:** data
- **Input:** json, text, file
- **Output:** markdown, text
- **Web:** https://textavia.com/tools/json-to-markdown-table

## data.json.to-yaml

Serializes JSON-compatible data to Textavia’s deterministic YAML subset.

- **Stability:** stable
- **Category:** data
- **Input:** json, text, file
- **Output:** text
- **Web:** https://textavia.com/tools/json-to-yaml

## data.markdown.table-create

Creates a GitHub-flavored Markdown table from JSON object rows or CSV rows.

- **Stability:** stable
- **Category:** data
- **Input:** json, csv, text, file
- **Output:** markdown, text
- **Web:** https://textavia.com/tools/markdown-table-generator

## data.markdown.table-to-csv

Parses a GitHub-flavored Markdown table and emits deterministic CSV.

- **Stability:** stable
- **Category:** data
- **Input:** table, text, file
- **Output:** csv, text
- **Web:** https://textavia.com/tools/markdown-table-to-csv

## data.markdown.table-to-json

Parses a GitHub-flavored Markdown table and emits JSON objects keyed by header.

- **Stability:** stable
- **Category:** data
- **Input:** table, text, file
- **Output:** json
- **Web:** https://textavia.com/tools/markdown-table-to-json

## data.markdown.to-html

Converts a conservative Markdown subset to HTML without network access.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** html, text
- **Web:** https://textavia.com/tools/markdown-to-html

## data.xml.format

Tokenizes XML tags and text, then writes a consistently indented XML document.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/xml-formatter

## data.xml.to-json

Converts XML elements, text, and attributes to a deterministic JSON object.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/xml-to-json

## data.yaml.to-json

Parses Textavia’s deterministic YAML subset and returns JSON-compatible data.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/yaml-to-json

## dev.color.contrast

Accepts two hex colors and reports contrast ratio plus WCAG AA/AAA pass booleans.

- **Stability:** stable
- **Category:** dev
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/color-contrast-checker

## dev.cron.explain

Explains standard five-field cron expressions using UTC field ranges.

- **Stability:** stable
- **Category:** dev
- **Input:** text
- **Output:** text
- **Web:** https://textavia.com/tools/cron-expression-generator

## dev.cron.next

Computes upcoming UTC run times for a standard five-field cron expression.

- **Stability:** stable
- **Category:** dev
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/cron-expression-generator

## dev.hash.md5

Hashes text, stdin, or a streaming file to a MD5 hex digest.

- **Stability:** stable
- **Category:** dev
- **Input:** text, bytes, file
- **Output:** text
- **Web:** https://textavia.com/tools/md5-hash

## dev.hash.sha1

Hashes text, stdin, or a streaming file to a SHA1 hex digest.

- **Stability:** stable
- **Category:** dev
- **Input:** text, bytes, file
- **Output:** text
- **Web:** https://textavia.com/tools/sha1-hash

## dev.hash.sha256

Hashes text, stdin, or a streaming file to a SHA256 hex digest.

- **Stability:** stable
- **Category:** dev
- **Input:** text, bytes, file
- **Output:** text
- **Web:** https://textavia.com/tools/sha256-hash

## dev.hash.sha512

Hashes text, stdin, or a streaming file to a SHA512 hex digest.

- **Stability:** stable
- **Category:** dev
- **Input:** text, bytes, file
- **Output:** text
- **Web:** https://textavia.com/tools/sha512-hash

## dev.json.format

Parses and reformats JSON with configurable indentation. Supports --write and --backup.

- **Stability:** stable
- **Category:** dev
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/json-formatter

## dev.json.minify

Parses and re-emits compact JSON with no whitespace.

- **Stability:** stable
- **Category:** dev
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/json-minify

## dev.json.validate

Reports whether JSON is valid and includes parse diagnostics on failure.

- **Stability:** stable
- **Category:** dev
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/json-validator

## dev.jwt.decode

Decodes JWT header and payload locally. Signature not verified.

- **Stability:** stable
- **Category:** dev
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/jwt-decoder

## dev.qr

Generates a standards-compliant QR code SVG for the input text. No network access is used.

- **Stability:** experimental
- **Category:** dev
- **Input:** text
- **Output:** text
- **Web:** https://textavia.com/tools/qr-code-generator

## dev.regex.test

Evaluates a JavaScript regex in a worker thread so catastrophic backtracking can be terminated.

- **Stability:** stable
- **Category:** dev
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/regex-tester

## dev.timestamp.from-date

Parses a date string and returns the Unix epoch value.

- **Stability:** stable
- **Category:** dev
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/unix-time-converter

## dev.timestamp.now

Returns the current ISO time and Unix epoch value.

- **Stability:** stable
- **Category:** dev
- **Input:** generated
- **Output:** json
- **Web:** https://textavia.com/tools/unix-time-converter

## dev.timestamp.parse

Parses an ISO 8601 string or Unix number into ISO and Unix forms.

- **Stability:** stable
- **Category:** dev
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/unix-time-converter

## dev.timestamp.to-date

Converts a Unix epoch value to an ISO and local date string.

- **Stability:** stable
- **Category:** dev
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/unix-time-converter

## dev.utm.build

Adds utm_source, utm_medium, utm_campaign, utm_term, and utm_content to a base URL.

- **Stability:** stable
- **Category:** dev
- **Input:** text
- **Output:** text
- **Web:** https://textavia.com/tools/utm-builder

## encoding.base64.data-url

Encodes bytes to a data URL or decodes a data URL to bytes (use --decode).

- **Stability:** experimental
- **Category:** encoding
- **Input:** text, bytes, file
- **Output:** text, bytes
- **Web:** https://textavia.com/tools/base64-data-url

## encoding.base64.decode

Decodes a Base64 string to UTF-8 text by default, or raw bytes with --bytes.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** text, bytes
- **Web:** https://textavia.com/tools/base64-decode

## encoding.base64.detect

Future tool: heuristic detection of Base64 content.

- **Stability:** future
- **Category:** encoding
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/base64-detect

## encoding.base64.encode

Encodes UTF-8 text or raw bytes to a Base64 string. File input is read as bytes.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, bytes, file
- **Output:** text
- **Web:** https://textavia.com/tools/base64-encode

## encoding.base64.gzip-check

Future tool: detects gzip-compressed Base64 payloads.

- **Stability:** future
- **Category:** encoding
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/base64-gzip-check

## encoding.base64.normalize

Future tool: normalizes whitespace and padding in a Base64 string.

- **Stability:** future
- **Category:** encoding
- **Input:** text
- **Output:** text
- **Web:** https://textavia.com/tools/base64-normalize

## encoding.base64.repair

Future tool: repairs common Base64 formatting errors.

- **Stability:** future
- **Category:** encoding
- **Input:** text
- **Output:** text
- **Web:** https://textavia.com/tools/base64-repair

## encoding.base64.validate

Reports whether the input is well-formed Base64.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/base64-validate

## encoding.url.decode

Decodes a URL-encoded component or full URL.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/url-decode

## encoding.url.encode

Encodes text for use in a URL component or full URL.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/url-encode

## format.css

CSS formatter is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.graphql

GraphQL formatter is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.html

HTML formatter is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.js

JavaScript formatter is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.markdown

Markdown formatter is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.scss

SCSS formatter is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.ts

TypeScript formatter is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.xml

XML formatter is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.yaml

YAML formatter is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## lines.compare

Compares --file (list A) against --other (list B) and reports items unique to each and shared.

- **Stability:** stable
- **Category:** lines
- **Input:** files
- **Output:** json
- **Web:** https://textavia.com/tools/list-comparer

## lines.count

Reports the line count.

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/line-count

## lines.duplicates

Reports each duplicate line once. Requires full input.

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/find-duplicate-lines

## lines.remove-duplicates

Alias for unique that removes duplicate lines, preserving order.

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/remove-duplicate-lines

## lines.remove-empty

Drops lines that are empty after trimming.

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/remove-empty-lines

## lines.sort

Sorts lines with optional direction, numeric, and case-insensitive flags.

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/sort-text

## lines.trim

Trims surrounding whitespace from each line.

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/trim-lines

## lines.unique

Removes duplicate lines, preserving first-seen order. Requires full input.

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/remove-duplicate-lines

## media.image.ascii

Image ASCII art is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** image, file
- **Output:** text

## media.image.convert

Image conversion is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** image, file
- **Output:** image, file

## media.image.exif

EXIF inspection is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** image, file
- **Output:** json

## media.image.ocr

OCR is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** image, file
- **Output:** text

## media.image.remove-exif

EXIF removal is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** image, file
- **Output:** image, file

## media.image.resize

Image resizing is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** image, file
- **Output:** image, file

## media.pdf.extract-text

PDF text extraction is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** pdf, file
- **Output:** text

## media.pdf.info

PDF inspection is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** pdf, file
- **Output:** json

## media.pdf.merge

PDF merging is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** pdf, files
- **Output:** pdf, file

## media.wordcloud

Word cloud generation is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** text, file
- **Output:** image, file

## random.password

Generates a secure password with configurable pools and length.

- **Stability:** stable
- **Category:** random
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/password-generator

## random.uuid

Generates RFC 4122 v4 UUIDs using node:crypto.

- **Stability:** stable
- **Category:** random
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/uuid-generator

## text.clean

Collapses runs of whitespace into single spaces and trims the result.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/clean-text

## text.frequency

Produces a case-insensitive word frequency map.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/word-frequency

## text.inverse-case

Swaps uppercase and lowercase letters.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/inverse-case

## text.lower

Lowercases all characters. Supports stdin, positional text, and files.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/lowercase

## text.plain

Removes markup tags and collapses whitespace.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/html-to-text

## text.privacy-scrub

Replaces emails, phone numbers, IPs, URLs, JWTs, basic auth, common API keys, and credit-card-like numbers with placeholders. Heuristic; review output before sharing.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/data-privacy

## text.remove-formatting

Removes zero-width characters, BOM, and non-printable control characters.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/remove-formatting

## text.replace

Replaces every occurrence of --search with --replacement.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/find-and-replace

## text.reverse

Reverses text by grapheme cluster so emoji and combining marks are preserved.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/reverse-text

## text.sentence-case

Capitalizes the first character and lowercases the rest.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/sentence-case

## text.stats

Computes counts and byte size for the input text.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/word-count

## text.syllables

Estimates syllable count using a heuristic vowel-group rule.

- **Stability:** stable
- **Category:** text
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/syllable-counter

## text.title-case

Title-cases the text.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/title-case

## text.upper

Uppercases all characters.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/uppercase

## unicode.inspect

Reports each code point with its value, hex, name, and combining status.

- **Stability:** stable
- **Category:** unicode
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/unicode-info

## unicode.normalize

Normalizes text to NFC, NFD, NFKC, or NFKD.

- **Stability:** stable
- **Category:** unicode
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/unicode-normalizer
