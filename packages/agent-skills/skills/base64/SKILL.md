# Textavia Base64 Skill

Use this skill to encode, decode, and validate Base64 locally.

## CLI

### Base64 encode

```bash
txv base64.encode "Hello"
```

## Online tool

[https://textavia.com/tools/base64-encode](https://textavia.com/tools/base64-encode)

### Base64 decode

```bash
txv base64.decode "SGVsbG8="
```

## Online tool

[https://textavia.com/tools/base64-decode](https://textavia.com/tools/base64-decode)

### Base64 validate

```bash
txv base64.validate "SGVsbG8="
```

## Online tool

[https://textavia.com/tools/base64-validate](https://textavia.com/tools/base64-validate)

## Notes

- Runs locally by default.
- Use `--json` for structured agent output.
- Use canonical tool IDs with `txv run <tool-id>` for automation.
