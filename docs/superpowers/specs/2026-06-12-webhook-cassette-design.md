# webhook-cassette Design

Date: 2026-06-12
Status: Approved for implementation

## Goal

`webhook-cassette` is a local-first CLI that turns webhook and API callback samples into sanitized, replayable test cassettes. It helps developers capture request fixtures from logs or raw HTTP text, redact sensitive values, normalize headers and bodies, and replay the cassette against a local endpoint in CI.

The tool intentionally avoids the crowded hosted webhook inbox and relay market. It focuses on durable local fixtures that can be committed safely and used by tests.

## Non-Goals

- Do not run a public webhook relay or hosted inspector.
- Do not duplicate `deny-lens`, `runbook-lint`, `secret-surface`, `screenlint`, or npm package audit tools.
- Do not require cloud services, API keys, or long-lived storage.
- Do not store unsanitized secrets by default.

## Users

- Developers integrating Stripe, GitHub, Slack, Shopify, Discord, and other webhook-heavy APIs.
- Teams that want repeatable CI tests from real callback samples.
- AI coding-agent users who need safe fixtures instead of pasting live tokens and signatures into prompts.

## CLI Surface

```text
webhook-cassette record <input> --out cassette.json [--name name]
webhook-cassette replay <cassette.json> --url http://127.0.0.1:3000/webhook [--dry-run]
webhook-cassette inspect <cassette.json> [--format markdown|json]
webhook-cassette demo --out reports/demo
```

`record` reads raw HTTP text or JSON request samples and writes a sanitized cassette. `replay` posts recorded requests to a target URL. `inspect` summarizes cassette contents and redaction coverage. `demo` generates realistic sample input, cassette, replay dry run, and reports.

## Cassette Format

```json
{
  "version": 1,
  "name": "stripe-payment-succeeded",
  "createdAt": "2026-06-12T00:00:00.000Z",
  "requests": [
    {
      "method": "POST",
      "path": "/webhook",
      "headers": {
        "content-type": "application/json",
        "stripe-signature": "[REDACTED]"
      },
      "body": {
        "id": "evt_123",
        "api_key": "[REDACTED]"
      }
    }
  ],
  "redactions": [
    { "path": "headers.stripe-signature", "reason": "signature" }
  ]
}
```

## Architecture

### input-loader

Reads input from a file path. The first release supports:

- raw HTTP request text
- JSON object with `method`, `path`, `headers`, and `body`
- JSON array of request objects

### normalizer

Converts inputs into a stable `RecordedRequest` model:

- uppercase HTTP method
- normalized lowercase header names
- parsed JSON body when possible
- preserved string body when not JSON

### redactor

Redacts sensitive values by key and value pattern:

- `authorization`, `cookie`, `set-cookie`, `x-api-key`
- `signature`, `token`, `secret`, `password`, `api_key`
- bearer tokens, GitHub tokens, Stripe-style signatures, email addresses

### cassette

Builds cassette JSON with version, name, created time, requests, and redaction metadata.

### replay

Posts each request to a target URL using Node's built-in `fetch`. `--dry-run` prints the replay plan without network calls.

### reporter

Renders cassette inspection as Markdown or JSON, including request count, methods, paths, headers, body type, and redaction summary.

## Data Flow

1. Resolve input path.
2. Load and parse raw HTTP or JSON samples.
3. Normalize request fields.
4. Redact sensitive headers and body fields.
5. Write cassette JSON.
6. Inspect or replay the cassette.

## Exit Codes

- `0`: command succeeded.
- `1`: replay target returned a non-2xx response.
- `2`: usage error, unreadable input, invalid cassette, unsupported format, or network failure.

## Testing

Use Vitest with fixtures for:

- raw HTTP parsing
- JSON request parsing
- header normalization
- redaction by key and value pattern
- cassette read/write
- dry-run replay
- Markdown/JSON inspection
- demo generation

Release gate:

```text
npm run check
node dist/cli.js demo --out reports/demo
npm pack --dry-run --ignore-scripts
```

## Documentation

Ship paired English and Simplified Chinese docs:

- `README.md`
- `README.zh-CN.md`
- `CHANGELOG.md`
- `CHANGELOG.zh-CN.md`
- `CONTRIBUTING.md`
- `CONTRIBUTING.zh-CN.md`
- `SECURITY.md`
- `SECURITY.zh-CN.md`

The README must show a raw webhook sample, record command, sanitized cassette excerpt, dry-run replay, and inspection report.

## Release Shape

The package is a Node.js 20+ TypeScript CLI with no runtime cloud dependency. The public repository will be `https://github.com/maxi-maxima/webhook-cassette` unless GitHub reports a name conflict.
