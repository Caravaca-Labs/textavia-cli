# Recipes

Generated from built-in recipe definitions. Config recipes use the same `[toolId, options]` step format.

## seo-slugs

Clean text and convert each line/title to URL slugs.

| Step | Tool | Options |
|------|------|---------|
| 1 | `text.clean` | `{}` |
| 2 | `case.slug` | `{"separator":"-"}` |

## clean-keywords

Lowercase, trim, remove empty lines, dedupe, and sort.

| Step | Tool | Options |
|------|------|---------|
| 1 | `text.lower` | `{}` |
| 2 | `lines.trim` | `{}` |
| 3 | `lines.remove-empty` | `{}` |
| 4 | `lines.unique` | `{}` |
| 5 | `lines.sort` | `{}` |

## normalize-lines

Trim every line and remove empty lines.

| Step | Tool | Options |
|------|------|---------|
| 1 | `lines.trim` | `{}` |
| 2 | `lines.remove-empty` | `{}` |

## safe-filenames

Clean text and convert it to filesystem-safe slugs.

| Step | Tool | Options |
|------|------|---------|
| 1 | `text.clean` | `{}` |
| 2 | `case.slug` | `{"separator":"-"}` |

## json-api

Pretty-format JSON for API fixtures and examples.

| Step | Tool | Options |
|------|------|---------|
| 1 | `dev.json.format` | `{"indent":2}` |

## csv-clean

Normalize CSV whitespace and remove empty rows.

| Step | Tool | Options |
|------|------|---------|
| 1 | `data.csv.clean` | `{}` |
