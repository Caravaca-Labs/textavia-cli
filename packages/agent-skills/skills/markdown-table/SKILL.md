# Textavia Markdown Table Skill

Use this skill to create and convert Markdown tables from JSON or CSV locally.

## CLI

### Create Markdown table

```bash
txv table create users.csv
```

## Online tool

[https://textavia.com/tools/markdown-table-generator](https://textavia.com/tools/markdown-table-generator)

### Markdown table to JSON

```bash
txv markdown table-to-json table.md
```

## Online tool

[https://textavia.com/tools/markdown-table-to-json](https://textavia.com/tools/markdown-table-to-json)

### Markdown table to CSV

```bash
txv markdown table-to-csv table.md
```

## Online tool

[https://textavia.com/tools/markdown-table-to-csv](https://textavia.com/tools/markdown-table-to-csv)

### JSON to Markdown table

```bash
txv json to-markdown-table users.json
```

## Online tool

[https://textavia.com/tools/json-to-markdown-table](https://textavia.com/tools/json-to-markdown-table)

### CSV to Markdown table

```bash
txv csv to-markdown-table users.csv --out users.md
```

## Online tool

[https://textavia.com/tools/csv-to-markdown-table](https://textavia.com/tools/csv-to-markdown-table)

## Notes

- Runs locally by default.
- Use `--json` for structured agent output.
- Use canonical tool IDs with `txv run <tool-id>` for automation.
