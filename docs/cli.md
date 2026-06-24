# Textavia CLI Commands

Generated from the tool registry. Do not edit by hand; run `pnpm generate:docs`.

| Tool | Category | Summary | Command |
|------|----------|---------|---------|
| Alternating case | case | Alternate letter case. | `txv run case.alternating` |
| camelCase | case | Convert to camelCase. | `txv run case.camel` |
| Capitalized | case | Capitalize the first character, keep the rest. | `txv run case.capitalized` |
| dot.case | case | Convert to dot.case. | `txv run case.dot` |
| Inverse case | case | Invert the case of every letter. | `txv run case.inverse` |
| kebab-case | case | Convert to kebab-case. | `txv run case.kebab` |
| Lowercase | case | Convert text to lowercase. | `txv run case.lower` |
| PascalCase | case | Convert to PascalCase. | `txv run case.pascal` |
| SCREAMING_SNAKE | case | Convert to SCREAMING_SNAKE_CASE. | `txv run case.screaming-snake` |
| Sentence case | case | Capitalize the first character only. | `txv run case.sentence` |
| URL slug | case | Convert to a URL slug. | `txv run case.slug` |
| snake_case | case | Convert to snake_case. | `txv run case.snake` |
| Title case | case | Capitalize the first letter of each word. | `txv run case.title` |
| Uppercase | case | Convert text to uppercase. | `txv run case.upper` |
| Clean CSV | data | Trim CSV cells and remove empty rows. | `txv run data.csv.clean` |
| CSV to JSON | data | Convert header-based CSV to JSON. | `txv run data.csv.to-json` |
| CSV to Markdown table | data | Convert CSV to a Markdown table. | `txv run data.csv.to-markdown-table` |
| HTML escape | data | Escape HTML-sensitive characters. | `txv run data.html.escape` |
| HTML strip | data | Remove HTML tags. | `txv run data.html.strip` |
| HTML to Markdown | data | Convert HTML to Markdown. | `txv run data.html.to-markdown` |
| HTML unescape | data | Unescape common HTML entities. | `txv run data.html.unescape` |
| JSON to CSV | data | Convert JSON objects to CSV. | `txv run data.json.to-csv` |
| JSON to Markdown table | data | Convert JSON objects to a Markdown table. | `txv run data.json.to-markdown-table` |
| JSON to YAML | data | Convert JSON to YAML. | `txv run data.json.to-yaml` |
| Create Markdown table | data | Create a Markdown table from JSON or CSV. | `txv run data.markdown.table-create` |
| Markdown table to CSV | data | Convert a Markdown table to CSV. | `txv run data.markdown.table-to-csv` |
| Markdown table to JSON | data | Convert a Markdown table to JSON. | `txv run data.markdown.table-to-json` |
| Markdown to HTML | data | Convert Markdown to HTML. | `txv run data.markdown.to-html` |
| Format XML | data | Format XML with indentation. | `txv run data.xml.format` |
| XML to JSON | data | Convert XML to JSON. | `txv run data.xml.to-json` |
| YAML to JSON | data | Convert YAML to JSON. | `txv run data.yaml.to-json` |
| Color contrast | dev | Calculate WCAG contrast between two colors. | `txv run dev.color.contrast` |
| Cron explain | dev | Explain a five-field cron expression. | `txv run dev.cron.explain` |
| Cron next runs | dev | List upcoming cron run times. | `txv run dev.cron.next` |
| MD5 hash | dev | Compute the MD5 digest. | `txv run dev.hash.md5` |
| SHA1 hash | dev | Compute the SHA1 digest. | `txv run dev.hash.sha1` |
| SHA256 hash | dev | Compute the SHA256 digest. | `txv run dev.hash.sha256` |
| SHA512 hash | dev | Compute the SHA512 digest. | `txv run dev.hash.sha512` |
| Format JSON | dev | Pretty-print JSON. | `txv run dev.json.format` |
| Minify JSON | dev | Minify JSON. | `txv run dev.json.minify` |
| Validate JSON | dev | Validate JSON and report diagnostics. | `txv run dev.json.validate` |
| JWT decode | dev | Decode a JWT without verifying it. | `txv run dev.jwt.decode` |
| QR SVG | dev | Generate a local QR code SVG. | `txv run dev.qr` |
| Regex test | dev | Test a regular expression with timeout protection. | `txv run dev.regex.test` |
| Date to Unix | dev | Convert a date to a Unix timestamp. | `txv run dev.timestamp.from-date` |
| Timestamp now | dev | Show the current timestamp. | `txv run dev.timestamp.now` |
| Parse timestamp | dev | Parse a timestamp string. | `txv run dev.timestamp.parse` |
| Unix to date | dev | Convert a Unix timestamp to a date. | `txv run dev.timestamp.to-date` |
| UTM builder | dev | Build a URL with UTM parameters. | `txv run dev.utm.build` |
| Base64 data URL | encoding | Convert between bytes and a Base64 data URL. | `txv run encoding.base64.data-url` |
| Base64 decode | encoding | Decode Base64 to text or bytes. | `txv run encoding.base64.decode` |
| Base64 detect | encoding | Detect whether text is likely Base64. | `txv run encoding.base64.detect` |
| Base64 encode | encoding | Encode text or bytes to Base64. | `txv run encoding.base64.encode` |
| Base64 gzip check | encoding | Check whether Base64 content is gzipped. | `txv run encoding.base64.gzip-check` |
| Base64 normalize | encoding | Normalize a Base64 string (whitespace and padding). | `txv run encoding.base64.normalize` |
| Base64 repair | encoding | Attempt to repair a malformed Base64 string. | `txv run encoding.base64.repair` |
| Base64 validate | encoding | Check whether text is valid Base64. | `txv run encoding.base64.validate` |
| URL decode | encoding | URL-decode text. | `txv run encoding.url.decode` |
| URL encode | encoding | URL-encode text. | `txv run encoding.url.encode` |
| CSS formatter | format | Format CSS source. | `txv run format.css` |
| GraphQL formatter | format | Format GRAPHQL source. | `txv run format.graphql` |
| HTML formatter | format | Format HTML source. | `txv run format.html` |
| JavaScript formatter | format | Format JS source. | `txv run format.js` |
| Markdown formatter | format | Format MARKDOWN source. | `txv run format.markdown` |
| SCSS formatter | format | Format SCSS source. | `txv run format.scss` |
| TypeScript formatter | format | Format TS source. | `txv run format.ts` |
| XML formatter | format | Format XML source. | `txv run format.xml` |
| YAML formatter | format | Format YAML source. | `txv run format.yaml` |
| Compare line lists | lines | Compare two line lists. | `txv run lines.compare` |
| Count lines | lines | Count the number of lines. | `txv run lines.count` |
| Find duplicate lines | lines | List lines that appear more than once. | `txv run lines.duplicates` |
| Remove duplicate lines | lines | Remove duplicate lines. | `txv run lines.remove-duplicates` |
| Remove empty lines | lines | Remove empty lines. | `txv run lines.remove-empty` |
| Sort lines | lines | Sort lines. | `txv run lines.sort` |
| Trim lines | lines | Trim whitespace from every line. | `txv run lines.trim` |
| Unique lines | lines | Remove duplicate lines. | `txv run lines.unique` |
| Image ASCII art | media | Render image pixels as ASCII art. | `txv run media.image.ascii` |
| Image convert | media | Convert images between formats. | `txv run media.image.convert` |
| Image EXIF | media | View image EXIF metadata. | `txv run media.image.exif` |
| Image OCR | media | Extract text from an image. | `txv run media.image.ocr` |
| Remove image EXIF | media | Remove image EXIF metadata. | `txv run media.image.remove-exif` |
| Image resize | media | Resize an image. | `txv run media.image.resize` |
| PDF extract text | media | Extract text from a PDF. | `txv run media.pdf.extract-text` |
| PDF info | media | Inspect PDF metadata. | `txv run media.pdf.info` |
| PDF merge | media | Merge PDF files. | `txv run media.pdf.merge` |
| Word cloud | media | Generate a word cloud image. | `txv run media.wordcloud` |
| Random password | random | Generate a cryptographically secure password. | `txv run random.password` |
| Random UUID | random | Generate cryptographically secure UUIDs. | `txv run random.uuid` |
| Clean text | text | Collapse whitespace and trim. | `txv run text.clean` |
| Word frequency | text | Count occurrences of each word. | `txv run text.frequency` |
| Inverse case | text | Invert the case of every letter. | `txv run text.inverse-case` |
| Lowercase text | text | Lowercase text. | `txv run text.lower` |
| Plain text | text | Strip HTML/XML tags to plain text. | `txv run text.plain` |
| Privacy scrub | text | Redact likely-sensitive substrings. | `txv run text.privacy-scrub` |
| Remove formatting | text | Remove zero-width and control characters. | `txv run text.remove-formatting` |
| Replace text | text | Replace all occurrences of a substring. | `txv run text.replace` |
| Reverse text | text | Reverse text by grapheme cluster. | `txv run text.reverse` |
| Sentence case | text | Capitalize the first character only. | `txv run text.sentence-case` |
| Text statistics | text | Report character, word, line, and sentence counts. | `txv run text.stats` |
| Syllable count | text | Estimate syllables in a word. | `txv run text.syllables` |
| Title case | text | Capitalize the first letter of each word. | `txv run text.title-case` |
| Uppercase text | text | Uppercase text. | `txv run text.upper` |
| Unicode inspect | unicode | Inspect code points in text. | `txv run unicode.inspect` |
| Unicode normalize | unicode | Normalize Unicode text. | `txv run unicode.normalize` |
