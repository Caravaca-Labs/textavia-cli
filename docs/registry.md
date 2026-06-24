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

## cipher.caesar

Shifts A-Z letters by --shift positions. Default shift is 3.

- **Stability:** stable
- **Category:** cipher
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/caesar-cipher

## cipher.morse.decode

Decodes Morse words separated by slash characters.

- **Stability:** stable
- **Category:** cipher
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/morse-code

## cipher.morse.encode

Encodes alphanumeric text to Morse code.

- **Stability:** stable
- **Category:** cipher
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/morse-code

## cipher.nato.decode

Converts NATO phonetic words back to letters.

- **Stability:** stable
- **Category:** cipher
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/nato-phonetic

## cipher.nato.encode

Converts A-Z letters to NATO phonetic words.

- **Stability:** stable
- **Category:** cipher
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/nato-phonetic

## cipher.rot13

Applies the reversible ROT13 substitution cipher.

- **Stability:** stable
- **Category:** cipher
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/rot13

## data.csv.clean

Parses CSV, trims every cell, drops fully empty rows, and writes deterministic CSV.

- **Stability:** stable
- **Category:** data
- **Input:** csv, text, file
- **Output:** csv, text
- **Web:** https://textavia.com/tools/csv-cleaner

## data.csv.dedupe

Removes duplicate CSV rows while preserving the first occurrence.

- **Stability:** stable
- **Category:** data
- **Input:** csv, text, file
- **Output:** csv, text
- **Web:** https://textavia.com/tools/csv-dedupe

## data.csv.select

Selects columns by header name from a simple delimited table.

- **Stability:** experimental
- **Category:** data
- **Input:** csv, text, file
- **Output:** csv, text
- **Web:** https://textavia.com/tools/csv-select

## data.csv.sort

Sorts CSV rows by a header column, preserving the header row.

- **Stability:** experimental
- **Category:** data
- **Input:** csv, text, file
- **Output:** csv, text
- **Web:** https://textavia.com/tools/csv-sort

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

## data.csv.to-tsv

Converts simple delimited rows from comma-separated to tab-separated.

- **Stability:** stable
- **Category:** data
- **Input:** csv, text, file
- **Output:** text
- **Web:** https://textavia.com/tools/csv-to-tsv

## data.csv.validate

Checks whether every CSV row has the same column count for a simple delimiter.

- **Stability:** stable
- **Category:** data
- **Input:** csv, text, file
- **Output:** json
- **Web:** https://textavia.com/tools/csv-validator

## data.excel.info

Excel info is provided by the optional data plugin.

- **Stability:** future
- **Category:** data
- **Input:** file, bytes
- **Output:** json

## data.excel.sheets

Excel sheets is provided by the optional data plugin.

- **Stability:** future
- **Category:** data
- **Input:** file, bytes
- **Output:** json

## data.excel.to-csv

Excel to-csv is provided by the optional data plugin.

- **Stability:** future
- **Category:** data
- **Input:** file, bytes
- **Output:** text

## data.excel.to-json

Excel to-json is provided by the optional data plugin.

- **Stability:** future
- **Category:** data
- **Input:** file, bytes
- **Output:** json

## data.excel.to-markdown-table

Excel to-markdown-table is provided by the optional data plugin.

- **Stability:** future
- **Category:** data
- **Input:** file, bytes
- **Output:** text

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

## data.markdown.strip

Removes common Markdown markup while preserving readable text.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/markdown-strip

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

## data.sheets.to-csv

Google Sheets to-csv is provided by the optional data plugin and requires --allow-network.

- **Stability:** future
- **Category:** data
- **Input:** text
- **Output:** text

## data.sheets.to-json

Google Sheets to-json is provided by the optional data plugin and requires --allow-network.

- **Stability:** future
- **Category:** data
- **Input:** text
- **Output:** json

## data.sheets.to-markdown-table

Google Sheets to-markdown-table is provided by the optional data plugin and requires --allow-network.

- **Stability:** future
- **Category:** data
- **Input:** text
- **Output:** text

## data.toml.format

Parses simple TOML and re-emits keys in sorted order.

- **Stability:** experimental
- **Category:** data
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/toml-formatter

## data.toml.to-json

Converts simple key/value TOML to JSON.

- **Stability:** experimental
- **Category:** data
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/toml-to-json

## data.toml.to-yaml

Converts simple TOML to a JSON-compatible YAML subset.

- **Stability:** experimental
- **Category:** data
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/toml-to-yaml

## data.toml.validate

Validates simple key/value TOML used by Textavia conversion tools.

- **Stability:** experimental
- **Category:** data
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/toml-validator

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

## data.xml.validate

Checks whether XML-like input has balanced tags using a conservative scanner.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/xml-validator

## data.yaml.format

Parses the built-in YAML subset and re-emits deterministic YAML.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/yaml-formatter

## data.yaml.to-json

Parses Textavia’s deterministic YAML subset and returns JSON-compatible data.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/yaml-to-json

## data.yaml.to-toml

Converts the built-in YAML subset to simple TOML.

- **Stability:** experimental
- **Category:** data
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/yaml-to-toml

## data.yaml.validate

Validates YAML accepted by the built-in YAML to JSON converter.

- **Stability:** stable
- **Category:** data
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/yaml-validator

## dev.color.contrast

Accepts two hex colors and reports contrast ratio plus WCAG AA/AAA pass booleans.

- **Stability:** stable
- **Category:** dev
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/color-contrast-checker

## dev.color.convert

Converts a 6-digit hex color to RGB and CSS rgb() output.

- **Stability:** stable
- **Category:** dev
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/color-converter

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

## dev.hash.file

Convenience wrapper around the hash tools. Defaults to SHA256 and reads files byte-safely.

- **Stability:** stable
- **Category:** dev
- **Input:** text, bytes, file
- **Output:** text
- **Web:** https://textavia.com/tools/hash-file

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

## dev.hash.sha224

Hashes text, stdin, or a streaming file to a SHA224 hex digest.

- **Stability:** stable
- **Category:** dev
- **Input:** text, bytes, file
- **Output:** text
- **Web:** https://textavia.com/tools/sha224-hash

## dev.hash.sha256

Hashes text, stdin, or a streaming file to a SHA256 hex digest.

- **Stability:** stable
- **Category:** dev
- **Input:** text, bytes, file
- **Output:** text
- **Web:** https://textavia.com/tools/sha256-hash

## dev.hash.sha384

Hashes text, stdin, or a streaming file to a SHA384 hex digest.

- **Stability:** stable
- **Category:** dev
- **Input:** text, bytes, file
- **Output:** text
- **Web:** https://textavia.com/tools/sha384-hash

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

## dev.json.query

Queries a JSON value with a simple dot path. Arrays use numeric path segments.

- **Stability:** stable
- **Category:** dev
- **Input:** json, text, file
- **Output:** json
- **Web:** https://textavia.com/tools/json-query

## dev.json.repair

Attempts conservative repairs such as removing trailing commas before parsing.

- **Stability:** experimental
- **Category:** dev
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/json-repair

## dev.json.sort-keys

Parses JSON and re-emits it with recursively sorted object keys.

- **Stability:** stable
- **Category:** dev
- **Input:** json, text, file
- **Output:** text
- **Web:** https://textavia.com/tools/json-sort-keys

## dev.json.stringify

Converts raw text into a JSON string literal.

- **Stability:** stable
- **Category:** dev
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/json-stringify-text

## dev.json.to-toml

Converts a flat JSON object with scalar or array values to TOML.

- **Stability:** experimental
- **Category:** dev
- **Input:** json, text, file
- **Output:** text
- **Web:** https://textavia.com/tools/json-to-toml

## dev.json.to-types

Generates a basic TypeScript interface from a representative JSON object.

- **Stability:** experimental
- **Category:** dev
- **Input:** json, text, file
- **Output:** text
- **Web:** https://textavia.com/tools/json-to-types

## dev.json.unstringify

Parses a JSON string literal and outputs raw text.

- **Stability:** stable
- **Category:** dev
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/json-unstringify-text

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

## dev.regex.explain

Provides a concise structural summary of a JavaScript regular expression.

- **Stability:** experimental
- **Category:** dev
- **Input:** text
- **Output:** text
- **Web:** https://textavia.com/tools/regex-tester

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

## encoding.base64.basic-auth-decode

Decodes a Basic base64 user:password value. Decoded only; not verified.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/basic-auth-decoder

## encoding.base64.css-data-uri

Encodes text or file bytes as a data URL wrapped for CSS.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, bytes, file
- **Output:** text
- **Web:** https://textavia.com/tools/css-data-uri

## encoding.base64.data-url

Encodes bytes to a data URL or decodes a data URL to bytes (use --decode).

- **Stability:** experimental
- **Category:** encoding
- **Input:** text, bytes, file
- **Output:** text, bytes
- **Web:** https://textavia.com/tools/base64-data-url

## encoding.base64.data-url-to-file

Returns decoded bytes from a data URL; use --out to write the file.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** bytes
- **Web:** https://textavia.com/tools/base64-data-url

## encoding.base64.decode

Decodes a Base64 string to UTF-8 text by default, or raw bytes with --bytes.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** text, bytes
- **Web:** https://textavia.com/tools/base64-decode

## encoding.base64.detect

Uses a conservative local heuristic to detect Base64-looking text.

- **Stability:** stable
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

## encoding.base64.from-hex

Converts a hexadecimal byte string to Base64.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/hex-to-base64

## encoding.base64.gzip-check

Decodes Base64 locally and checks for a gzip payload.

- **Stability:** stable
- **Category:** encoding
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/base64-gzip-check

## encoding.base64.gzip-decode

Utility companion for gzip-check; decodes and gunzips Base64 input.

- **Stability:** experimental
- **Category:** encoding
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/base64-gzip-check

## encoding.base64.gzip-encode

Compresses UTF-8 text with gzip and emits Base64.

- **Stability:** experimental
- **Category:** encoding
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/base64-gzip-check

## encoding.base64.normalize

Normalizes whitespace, URL-safe alphabet variants, and padding.

- **Stability:** stable
- **Category:** encoding
- **Input:** text
- **Output:** text
- **Web:** https://textavia.com/tools/base64-normalize

## encoding.base64.repair

Repairs common copy/paste issues such as whitespace, missing padding, and URL-safe alphabet characters.

- **Stability:** stable
- **Category:** encoding
- **Input:** text
- **Output:** text
- **Web:** https://textavia.com/tools/base64-repair

## encoding.base64.to-ascii

Decodes Base64 bytes using ASCII encoding.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/base64-to-ascii

## encoding.base64.to-hex

Decodes Base64 bytes and prints a hexadecimal string.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/base64-to-hex

## encoding.base64.validate

Reports whether the input is well-formed Base64.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/base64-validate

## encoding.binary.decode

Decodes whitespace-separated 8-bit binary groups into UTF-8 text.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/binary

## encoding.binary.encode

Encodes UTF-8 text or file bytes into 8-bit binary groups.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, bytes, file
- **Output:** text
- **Web:** https://textavia.com/tools/binary

## encoding.hex.decode

Decodes a hex string to UTF-8 text by default, or bytes with --bytes.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** text, bytes
- **Web:** https://textavia.com/tools/hex-decoder

## encoding.hex.encode

Encodes UTF-8 text or file bytes to a hex string.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, bytes, file
- **Output:** text
- **Web:** https://textavia.com/tools/hex-encoder

## encoding.roman.from-number

Converts integers from 1 to 3999 into canonical Roman numerals.

- **Stability:** stable
- **Category:** encoding
- **Input:** text
- **Output:** text
- **Web:** https://textavia.com/tools/roman-numeral-converter

## encoding.roman.to-number

Parses canonical Roman numerals from I to MMMCMXCIX.

- **Stability:** stable
- **Category:** encoding
- **Input:** text
- **Output:** json
- **Web:** https://textavia.com/tools/roman-numeral-converter

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

## encoding.utf8.decode

Decodes space-separated UTF-8 hex bytes into text.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/utf8-encoding

## encoding.utf8.encode

Encodes text to space-separated UTF-8 hex bytes.

- **Stability:** stable
- **Category:** encoding
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/utf8-encoding

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

## format.jsx

JSX formatter is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.less

Less formatter is provided by the optional formatter plugin.

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

## format.minify.css

CSS minification is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.minify.html

HTML minification is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.minify.js

JS minification is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.minify.json

JSON minification is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.minify.xml

XML minification is provided by the optional formatter plugin.

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

## format.sql

SQL formatter is provided by the optional formatter plugin.

- **Stability:** future
- **Category:** format
- **Input:** text, file
- **Output:** text

## format.toml

TOML formatter is provided by the optional formatter plugin.

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

## format.tsx

TSX formatter is provided by the optional formatter plugin.

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

## lines.intersect

Computes line intersection. Use --other or separate blocks with a line containing "---".

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/list-intersect

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

## lines.reverse

Reverses the order of input lines.

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/reverse-lines

## lines.shuffle

Randomly shuffles input lines locally.

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/shuffle-lines

## lines.sort

Sorts lines with optional direction, numeric, and case-insensitive flags.

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/sort-text

## lines.subtract

Computes A minus B. Use --other or separate blocks with a line containing "---".

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/list-subtract

## lines.trim

Trims surrounding whitespace from each line.

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/trim-lines

## lines.union

Computes a first-seen union. Use --other or separate blocks with a line containing "---".

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/list-union

## lines.unique

Removes duplicate lines, preserving first-seen order. Requires full input.

- **Stability:** stable
- **Category:** lines
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/remove-duplicate-lines

## lorem.paragraphs

Generates placeholder lorem ipsum paragraphs.

- **Stability:** stable
- **Category:** lorem
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/lorem-ipsum

## lorem.sentences

Generates placeholder lorem ipsum sentences.

- **Stability:** stable
- **Category:** lorem
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/lorem-ipsum

## lorem.words

Generates placeholder lorem ipsum words.

- **Stability:** stable
- **Category:** lorem
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/lorem-ipsum

## media.image.ascii

Image ASCII art is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** image, file
- **Output:** text

## media.image.compress

Image compression is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** image, file
- **Output:** image, file

## media.image.convert

Image conversion is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** image, file
- **Output:** image, file

## media.image.crop

Image cropping is provided by the optional media plugin.

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

## media.image.info

Image inspection is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** image, file
- **Output:** json

## media.image.metadata

Image metadata inspection is provided by the optional media plugin.

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

## media.image.rotate

Image rotation is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** image, file
- **Output:** image, file

## media.pdf.compress

PDF compression is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** pdf, file
- **Output:** pdf, file

## media.pdf.extract-images

PDF image extraction is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** pdf, file
- **Output:** file

## media.pdf.extract-text

PDF text extraction is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** pdf, file
- **Output:** text

## media.pdf.images-to-pdf

Image-to-PDF conversion is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** files
- **Output:** pdf, file

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

## media.pdf.split

PDF splitting is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** pdf, file
- **Output:** pdf, file

## media.wordcloud

Word cloud generation is provided by the optional media plugin.

- **Stability:** future
- **Category:** media
- **Input:** text, file
- **Output:** image, file

## numbers.sort

Parses whitespace/comma-separated numbers and sorts them.

- **Stability:** stable
- **Category:** numbers
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/number-sorter

## numbers.stats

Reports count, min, max, sum, mean, and median.

- **Stability:** stable
- **Category:** numbers
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/number-statistics

## random.boolean

Outputs true or false with equal probability.

- **Stability:** stable
- **Category:** random
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/random-boolean

## random.choice

Chooses one or more random non-empty lines from the input.

- **Stability:** stable
- **Category:** random
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/random-choice

## random.date

Generates random ISO dates between --from and --to.

- **Stability:** stable
- **Category:** random
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/random-date

## random.float

Alias-style float generator for decimal random values.

- **Stability:** stable
- **Category:** random
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/random-number

## random.integer

Generates random integers between --min and --max.

- **Stability:** stable
- **Category:** random
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/random-number

## random.ip

Generates random IPv4 addresses.

- **Stability:** stable
- **Category:** random
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/random-ip

## random.letter

Generates random lowercase letters.

- **Stability:** stable
- **Category:** random
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/random-letter

## random.month

Picks random month names.

- **Stability:** stable
- **Category:** random
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/random-month

## random.number

Generates random floating point numbers between --min and --max.

- **Stability:** stable
- **Category:** random
- **Input:** generated
- **Output:** text
- **Web:** https://textavia.com/tools/random-number

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

## style.aesthetic

aesthetic styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.big

big styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.bold

bold styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.bubble

bubble styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.cursive

cursive styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.discord

discord styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.facebook

facebook styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.glitch

glitch styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.gothic

gothic styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.instagram

instagram styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.invisible

invisible styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.italic

italic styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.mirror

mirror styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.phonetic-spelling

phonetic-spelling styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.pig-latin

pig-latin styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.slash

slash styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.small

small styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.stacked

stacked styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.strike

strike styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.subscript

subscript styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.superscript

superscript styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.symbols.list

Symbol listing is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** generated
- **Output:** json

## style.symbols.random

Random symbols are provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** generated
- **Output:** text

## style.symbols.search

Symbol search is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text
- **Output:** json

## style.twitter

twitter styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.typewriter

typewriter styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.underline

underline styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.upside-down

upside-down styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.wide

wide styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.wingdings

wingdings styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## style.zalgo

zalgo styling is provided by the optional style plugin.

- **Stability:** future
- **Category:** style
- **Input:** text, file
- **Output:** text

## text.alternating-case

Alternates casing across letters in the input text.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/alternating-case

## text.capitalize

Capitalizes each word for a readable capitalized style.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/capitalized-case

## text.clean

Collapses runs of whitespace into single spaces and trims the result.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/clean-text

## text.diff

Reports added, removed, and unchanged lines. Use --other or separate blocks with a line containing "---".

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/diff-checker

## text.duplicate-words

Reports case-insensitive words that appear more than once.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/duplicate-word-finder

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

## text.normalize-whitespace

Collapses repeated whitespace into single spaces and trims the result.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/whitespace-remover

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

## text.remove-chars

Removes every character listed in --chars from the input.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/character-remover

## text.remove-formatting

Removes zero-width characters, BOM, and non-printable control characters.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/remove-formatting

## text.remove-line-breaks

Converts multi-line text into a single line with normalized spacing.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/remove-line-breaks

## text.repeat

Repeats the input --count times with an optional separator.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/repeat-text

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

## text.sentence-count

Counts sentences using the same heuristic as text stats.

- **Stability:** stable
- **Category:** text
- **Input:** text, file
- **Output:** json
- **Web:** https://textavia.com/tools/sentence-counter

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

## words.sort

Splits input into words and sorts them alphabetically.

- **Stability:** stable
- **Category:** words
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/sort-words

## words.unique

Splits input into words and preserves the first occurrence of each word.

- **Stability:** stable
- **Category:** words
- **Input:** text, file
- **Output:** text
- **Web:** https://textavia.com/tools/unique-words
