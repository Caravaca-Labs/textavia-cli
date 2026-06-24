# Textavia Text Cleaner Skill

Use this skill to clean, normalize, and inspect text locally.

## CLI

### Clean text

```bash
txv text clean "  a   b  "
```

## Online tool

[https://textavia.com/tools/clean-text](https://textavia.com/tools/clean-text)

### Remove formatting

```bash
txv text remove-formatting "a\u200Bb"
```

## Online tool

[https://textavia.com/tools/remove-formatting](https://textavia.com/tools/remove-formatting)

### Text statistics

```bash
txv text stats "Hello world"
```

## Online tool

[https://textavia.com/tools/word-count](https://textavia.com/tools/word-count)

## Notes

- Runs locally by default.
- Use `--json` for structured agent output.
- Use canonical tool IDs with `txv run <tool-id>` for automation.
