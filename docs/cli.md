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
| Caesar cipher | cipher | Apply a Caesar shift. | `txv run cipher.caesar` |
| Morse decode | cipher | Decode Morse code to text. | `txv run cipher.morse.decode` |
| Morse encode | cipher | Encode text as Morse code. | `txv run cipher.morse.encode` |
| NATO decode | cipher | Decode NATO phonetic words. | `txv run cipher.nato.decode` |
| NATO encode | cipher | Encode text with the NATO alphabet. | `txv run cipher.nato.encode` |
| ROT13 | cipher | Apply ROT13 substitution. | `txv run cipher.rot13` |
| Clean CSV | data | Trim CSV cells and remove empty rows. | `txv run data.csv.clean` |
| CSV dedupe | data | Remove duplicate CSV rows. | `txv run data.csv.dedupe` |
| CSV select | data | Select CSV columns. | `txv run data.csv.select` |
| CSV sort | data | Sort CSV rows. | `txv run data.csv.sort` |
| CSV to JSON | data | Convert header-based CSV to JSON. | `txv run data.csv.to-json` |
| CSV to Markdown table | data | Convert CSV to a Markdown table. | `txv run data.csv.to-markdown-table` |
| CSV to TSV | data | Convert CSV to TSV. | `txv run data.csv.to-tsv` |
| Validate CSV | data | Validate CSV row widths. | `txv run data.csv.validate` |
| Excel info | data | Run Excel info. | `txv run data.excel.info` |
| Excel sheets | data | Run Excel sheets. | `txv run data.excel.sheets` |
| Excel to-csv | data | Run Excel to-csv. | `txv run data.excel.to-csv` |
| Excel to-json | data | Run Excel to-json. | `txv run data.excel.to-json` |
| Excel to-markdown-table | data | Run Excel to-markdown-table. | `txv run data.excel.to-markdown-table` |
| HTML escape | data | Escape HTML-sensitive characters. | `txv run data.html.escape` |
| HTML strip | data | Remove HTML tags. | `txv run data.html.strip` |
| HTML to Markdown | data | Convert HTML to Markdown. | `txv run data.html.to-markdown` |
| HTML unescape | data | Unescape common HTML entities. | `txv run data.html.unescape` |
| JSON to CSV | data | Convert JSON objects to CSV. | `txv run data.json.to-csv` |
| JSON to Markdown table | data | Convert JSON objects to a Markdown table. | `txv run data.json.to-markdown-table` |
| JSON to YAML | data | Convert JSON to YAML. | `txv run data.json.to-yaml` |
| Strip Markdown | data | Strip common Markdown syntax. | `txv run data.markdown.strip` |
| Create Markdown table | data | Create a Markdown table from JSON or CSV. | `txv run data.markdown.table-create` |
| Markdown table to CSV | data | Convert a Markdown table to CSV. | `txv run data.markdown.table-to-csv` |
| Markdown table to JSON | data | Convert a Markdown table to JSON. | `txv run data.markdown.table-to-json` |
| Markdown to HTML | data | Convert Markdown to HTML. | `txv run data.markdown.to-html` |
| Google Sheets to-csv | data | Run Google Sheets to-csv. | `txv run data.sheets.to-csv` |
| Google Sheets to-json | data | Run Google Sheets to-json. | `txv run data.sheets.to-json` |
| Google Sheets to-markdown-table | data | Run Google Sheets to-markdown-table. | `txv run data.sheets.to-markdown-table` |
| Format TOML | data | Format a conservative TOML subset. | `txv run data.toml.format` |
| TOML to JSON | data | Convert TOML to JSON. | `txv run data.toml.to-json` |
| TOML to YAML | data | Convert TOML to YAML. | `txv run data.toml.to-yaml` |
| Validate TOML | data | Validate a conservative TOML subset. | `txv run data.toml.validate` |
| Format XML | data | Format XML with indentation. | `txv run data.xml.format` |
| XML to JSON | data | Convert XML to JSON. | `txv run data.xml.to-json` |
| Validate XML | data | Validate basic XML tag balance. | `txv run data.xml.validate` |
| Format YAML | data | Format Textavia YAML subset. | `txv run data.yaml.format` |
| YAML to JSON | data | Convert YAML to JSON. | `txv run data.yaml.to-json` |
| YAML to TOML | data | Convert YAML to TOML. | `txv run data.yaml.to-toml` |
| Validate YAML | data | Validate Textavia YAML subset. | `txv run data.yaml.validate` |
| Color contrast | dev | Calculate WCAG contrast between two colors. | `txv run dev.color.contrast` |
| Color convert | dev | Convert a hex color to RGB. | `txv run dev.color.convert` |
| Cron explain | dev | Explain a five-field cron expression. | `txv run dev.cron.explain` |
| Cron next runs | dev | List upcoming cron run times. | `txv run dev.cron.next` |
| Hash file | dev | Hash text, stdin, or a file with a selected algorithm. | `txv run dev.hash.file` |
| MD5 hash | dev | Compute the MD5 digest. | `txv run dev.hash.md5` |
| SHA1 hash | dev | Compute the SHA1 digest. | `txv run dev.hash.sha1` |
| SHA224 hash | dev | Compute the SHA224 digest. | `txv run dev.hash.sha224` |
| SHA256 hash | dev | Compute the SHA256 digest. | `txv run dev.hash.sha256` |
| SHA384 hash | dev | Compute the SHA384 digest. | `txv run dev.hash.sha384` |
| SHA512 hash | dev | Compute the SHA512 digest. | `txv run dev.hash.sha512` |
| Format JSON | dev | Pretty-print JSON. | `txv run dev.json.format` |
| Minify JSON | dev | Minify JSON. | `txv run dev.json.minify` |
| JSON query | dev | Read a dot-path from JSON. | `txv run dev.json.query` |
| Repair JSON | dev | Repair common JSON formatting mistakes. | `txv run dev.json.repair` |
| JSON sort keys | dev | Sort JSON object keys recursively. | `txv run dev.json.sort-keys` |
| JSON stringify text | dev | Escape text as a JSON string. | `txv run dev.json.stringify` |
| JSON to TOML | dev | Convert a flat JSON object to TOML. | `txv run dev.json.to-toml` |
| JSON to TypeScript types | dev | Infer TypeScript interfaces from JSON. | `txv run dev.json.to-types` |
| JSON unstringify text | dev | Decode a JSON string literal. | `txv run dev.json.unstringify` |
| Validate JSON | dev | Validate JSON and report diagnostics. | `txv run dev.json.validate` |
| JWT decode | dev | Decode a JWT without verifying it. | `txv run dev.jwt.decode` |
| QR SVG | dev | Generate a local QR code SVG. | `txv run dev.qr` |
| Regex explain | dev | Explain simple regex features. | `txv run dev.regex.explain` |
| Regex test | dev | Test a regular expression with timeout protection. | `txv run dev.regex.test` |
| Date to Unix | dev | Convert a date to a Unix timestamp. | `txv run dev.timestamp.from-date` |
| Timestamp now | dev | Show the current timestamp. | `txv run dev.timestamp.now` |
| Parse timestamp | dev | Parse a timestamp string. | `txv run dev.timestamp.parse` |
| Unix to date | dev | Convert a Unix timestamp to a date. | `txv run dev.timestamp.to-date` |
| UTM builder | dev | Build a URL with UTM parameters. | `txv run dev.utm.build` |
| Basic auth decode | encoding | Decode a Basic auth header. | `txv run encoding.base64.basic-auth-decode` |
| CSS data URI | encoding | Create a CSS url(data:...) value. | `txv run encoding.base64.css-data-uri` |
| Base64 data URL | encoding | Convert between bytes and a Base64 data URL. | `txv run encoding.base64.data-url` |
| Data URL to file bytes | encoding | Decode a Base64 data URL to bytes. | `txv run encoding.base64.data-url-to-file` |
| Base64 decode | encoding | Decode Base64 to text or bytes. | `txv run encoding.base64.decode` |
| Base64 detect | encoding | Detect whether text is likely Base64. | `txv run encoding.base64.detect` |
| Base64 encode | encoding | Encode text or bytes to Base64. | `txv run encoding.base64.encode` |
| Hex to Base64 | encoding | Encode hex bytes as Base64. | `txv run encoding.base64.from-hex` |
| Base64 gzip check | encoding | Check whether Base64 content is gzipped. | `txv run encoding.base64.gzip-check` |
| Base64 gzip decode | encoding | Decode gzipped Base64 bytes. | `txv run encoding.base64.gzip-decode` |
| Base64 gzip encode | encoding | Gzip text and encode as Base64. | `txv run encoding.base64.gzip-encode` |
| Base64 normalize | encoding | Normalize a Base64 string (whitespace and padding). | `txv run encoding.base64.normalize` |
| Base64 repair | encoding | Attempt to repair a malformed Base64 string. | `txv run encoding.base64.repair` |
| Base64 to ASCII | encoding | Decode Base64 as ASCII text. | `txv run encoding.base64.to-ascii` |
| Base64 to hex | encoding | Decode Base64 and emit hex. | `txv run encoding.base64.to-hex` |
| Base64 validate | encoding | Check whether text is valid Base64. | `txv run encoding.base64.validate` |
| Binary decode | encoding | Decode 8-bit binary groups to text. | `txv run encoding.binary.decode` |
| Binary encode | encoding | Encode text or bytes as binary. | `txv run encoding.binary.encode` |
| Hex decode | encoding | Decode hexadecimal to text or bytes. | `txv run encoding.hex.decode` |
| Hex encode | encoding | Encode text or bytes as hexadecimal. | `txv run encoding.hex.encode` |
| Number to Roman | encoding | Convert a number to Roman numerals. | `txv run encoding.roman.from-number` |
| Roman to number | encoding | Convert a Roman numeral to a number. | `txv run encoding.roman.to-number` |
| URL decode | encoding | URL-decode text. | `txv run encoding.url.decode` |
| URL encode | encoding | URL-encode text. | `txv run encoding.url.encode` |
| UTF-8 decode | encoding | Decode UTF-8 hex bytes. | `txv run encoding.utf8.decode` |
| UTF-8 encode | encoding | Show UTF-8 bytes for text. | `txv run encoding.utf8.encode` |
| CSS formatter | format | Format CSS source. | `txv run format.css` |
| GraphQL formatter | format | Format GRAPHQL source. | `txv run format.graphql` |
| HTML formatter | format | Format HTML source. | `txv run format.html` |
| JavaScript formatter | format | Format JS source. | `txv run format.js` |
| JSX formatter | format | Format JSX source. | `txv run format.jsx` |
| Less formatter | format | Format LESS source. | `txv run format.less` |
| Markdown formatter | format | Format MARKDOWN source. | `txv run format.markdown` |
| CSS minifier | format | Minify CSS source. | `txv run format.minify.css` |
| HTML minifier | format | Minify HTML source. | `txv run format.minify.html` |
| JS minifier | format | Minify JS source. | `txv run format.minify.js` |
| JSON minifier | format | Minify JSON source. | `txv run format.minify.json` |
| XML minifier | format | Minify XML source. | `txv run format.minify.xml` |
| SCSS formatter | format | Format SCSS source. | `txv run format.scss` |
| SQL formatter | format | Format SQL source. | `txv run format.sql` |
| TOML formatter | format | Format TOML source. | `txv run format.toml` |
| TypeScript formatter | format | Format TS source. | `txv run format.ts` |
| TSX formatter | format | Format TSX source. | `txv run format.tsx` |
| XML formatter | format | Format XML source. | `txv run format.xml` |
| YAML formatter | format | Format YAML source. | `txv run format.yaml` |
| Compare line lists | lines | Compare two line lists. | `txv run lines.compare` |
| Count lines | lines | Count the number of lines. | `txv run lines.count` |
| Find duplicate lines | lines | List lines that appear more than once. | `txv run lines.duplicates` |
| Intersect lines | lines | Return lines present in both lists. | `txv run lines.intersect` |
| Remove duplicate lines | lines | Remove duplicate lines. | `txv run lines.remove-duplicates` |
| Remove empty lines | lines | Remove empty lines. | `txv run lines.remove-empty` |
| Reverse lines | lines | Reverse line order. | `txv run lines.reverse` |
| Shuffle lines | lines | Shuffle line order. | `txv run lines.shuffle` |
| Sort lines | lines | Sort lines. | `txv run lines.sort` |
| Subtract lines | lines | Return lines only in the first list. | `txv run lines.subtract` |
| Trim lines | lines | Trim whitespace from every line. | `txv run lines.trim` |
| Union lines | lines | Return unique lines from both lists. | `txv run lines.union` |
| Unique lines | lines | Remove duplicate lines. | `txv run lines.unique` |
| Lorem paragraphs | lorem | Generate lorem ipsum paragraphs. | `txv run lorem.paragraphs` |
| Lorem sentences | lorem | Generate lorem ipsum sentences. | `txv run lorem.sentences` |
| Lorem words | lorem | Generate lorem ipsum words. | `txv run lorem.words` |
| Image ASCII art | media | Render image pixels as ASCII art. | `txv run media.image.ascii` |
| Image compress | media | Compress an image. | `txv run media.image.compress` |
| Image convert | media | Convert images between formats. | `txv run media.image.convert` |
| Image crop | media | Crop an image. | `txv run media.image.crop` |
| Image EXIF | media | View image EXIF metadata. | `txv run media.image.exif` |
| Image info | media | Inspect image metadata. | `txv run media.image.info` |
| Image metadata | media | View image metadata. | `txv run media.image.metadata` |
| Image OCR | media | Extract text from an image. | `txv run media.image.ocr` |
| Remove image EXIF | media | Remove image EXIF metadata. | `txv run media.image.remove-exif` |
| Image resize | media | Resize an image. | `txv run media.image.resize` |
| Image rotate | media | Rotate an image. | `txv run media.image.rotate` |
| PDF compress | media | Compress a PDF file. | `txv run media.pdf.compress` |
| PDF extract images | media | Extract images from a PDF. | `txv run media.pdf.extract-images` |
| PDF extract text | media | Extract text from a PDF. | `txv run media.pdf.extract-text` |
| Images to PDF | media | Create a PDF from images. | `txv run media.pdf.images-to-pdf` |
| PDF info | media | Inspect PDF metadata. | `txv run media.pdf.info` |
| PDF merge | media | Merge PDF files. | `txv run media.pdf.merge` |
| PDF split | media | Split a PDF file. | `txv run media.pdf.split` |
| Word cloud | media | Generate a word cloud image. | `txv run media.wordcloud` |
| Sort numbers | numbers | Sort numeric values. | `txv run numbers.sort` |
| Number statistics | numbers | Summarize numeric values. | `txv run numbers.stats` |
| Random boolean | random | Generate random booleans. | `txv run random.boolean` |
| Random choice | random | Pick random items from input lines. | `txv run random.choice` |
| Random date | random | Generate random dates. | `txv run random.date` |
| Random float | random | Generate random floats. | `txv run random.float` |
| Random integer | random | Generate random integers. | `txv run random.integer` |
| Random IPv4 | random | Generate random IPv4 addresses. | `txv run random.ip` |
| Random letter | random | Generate random letters. | `txv run random.letter` |
| Random month | random | Generate random month names. | `txv run random.month` |
| Random number | random | Generate random numbers. | `txv run random.number` |
| Random password | random | Generate a cryptographically secure password. | `txv run random.password` |
| Random UUID | random | Generate cryptographically secure UUIDs. | `txv run random.uuid` |
| Style aesthetic | style | Apply the aesthetic text style. | `txv run style.aesthetic` |
| Style big | style | Apply the big text style. | `txv run style.big` |
| Style bold | style | Apply the bold text style. | `txv run style.bold` |
| Style bubble | style | Apply the bubble text style. | `txv run style.bubble` |
| Style cursive | style | Apply the cursive text style. | `txv run style.cursive` |
| Style discord | style | Apply the discord text style. | `txv run style.discord` |
| Style facebook | style | Apply the facebook text style. | `txv run style.facebook` |
| Style glitch | style | Apply the glitch text style. | `txv run style.glitch` |
| Style gothic | style | Apply the gothic text style. | `txv run style.gothic` |
| Style instagram | style | Apply the instagram text style. | `txv run style.instagram` |
| Style invisible | style | Apply the invisible text style. | `txv run style.invisible` |
| Style italic | style | Apply the italic text style. | `txv run style.italic` |
| Style mirror | style | Apply the mirror text style. | `txv run style.mirror` |
| Style phonetic-spelling | style | Apply the phonetic-spelling text style. | `txv run style.phonetic-spelling` |
| Style pig-latin | style | Apply the pig-latin text style. | `txv run style.pig-latin` |
| Style slash | style | Apply the slash text style. | `txv run style.slash` |
| Style small | style | Apply the small text style. | `txv run style.small` |
| Style stacked | style | Apply the stacked text style. | `txv run style.stacked` |
| Style strike | style | Apply the strike text style. | `txv run style.strike` |
| Style subscript | style | Apply the subscript text style. | `txv run style.subscript` |
| Style superscript | style | Apply the superscript text style. | `txv run style.superscript` |
| Symbol list | style | List Unicode symbols. | `txv run style.symbols.list` |
| Random symbol | style | Pick a random Unicode symbol. | `txv run style.symbols.random` |
| Symbol search | style | Search Unicode symbols. | `txv run style.symbols.search` |
| Style twitter | style | Apply the twitter text style. | `txv run style.twitter` |
| Style typewriter | style | Apply the typewriter text style. | `txv run style.typewriter` |
| Style underline | style | Apply the underline text style. | `txv run style.underline` |
| Style upside-down | style | Apply the upside-down text style. | `txv run style.upside-down` |
| Style wide | style | Apply the wide text style. | `txv run style.wide` |
| Style wingdings | style | Apply the wingdings text style. | `txv run style.wingdings` |
| Style zalgo | style | Apply the zalgo text style. | `txv run style.zalgo` |
| Alternating case | text | Alternate letter case. | `txv run text.alternating-case` |
| Capitalize text | text | Capitalize each word. | `txv run text.capitalize` |
| Clean text | text | Collapse whitespace and trim. | `txv run text.clean` |
| Text diff | text | Compare two text blocks line by line. | `txv run text.diff` |
| Duplicate words | text | List repeated words. | `txv run text.duplicate-words` |
| Word frequency | text | Count occurrences of each word. | `txv run text.frequency` |
| Inverse case | text | Invert the case of every letter. | `txv run text.inverse-case` |
| Lowercase text | text | Lowercase text. | `txv run text.lower` |
| Normalize whitespace | text | Collapse whitespace and trim. | `txv run text.normalize-whitespace` |
| Plain text | text | Strip HTML/XML tags to plain text. | `txv run text.plain` |
| Privacy scrub | text | Redact likely-sensitive substrings. | `txv run text.privacy-scrub` |
| Remove characters | text | Remove selected characters from text. | `txv run text.remove-chars` |
| Remove formatting | text | Remove zero-width and control characters. | `txv run text.remove-formatting` |
| Remove line breaks | text | Replace line breaks with spaces. | `txv run text.remove-line-breaks` |
| Repeat text | text | Repeat input text. | `txv run text.repeat` |
| Replace text | text | Replace all occurrences of a substring. | `txv run text.replace` |
| Reverse text | text | Reverse text by grapheme cluster. | `txv run text.reverse` |
| Sentence case | text | Capitalize the first character only. | `txv run text.sentence-case` |
| Sentence count | text | Count sentences in text. | `txv run text.sentence-count` |
| Text statistics | text | Report character, word, line, and sentence counts. | `txv run text.stats` |
| Syllable count | text | Estimate syllables in a word. | `txv run text.syllables` |
| Title case | text | Capitalize the first letter of each word. | `txv run text.title-case` |
| Uppercase text | text | Uppercase text. | `txv run text.upper` |
| Unicode inspect | unicode | Inspect code points in text. | `txv run unicode.inspect` |
| Unicode normalize | unicode | Normalize Unicode text. | `txv run unicode.normalize` |
| Sort words | words | Sort words alphabetically. | `txv run words.sort` |
| Unique words | words | Remove duplicate words. | `txv run words.unique` |
