<div align="center">

# Webhook Cassette

**Record, redact, inspect, and replay webhook request fixtures.**

[简体中文](README.zh-CN.md)

</div>

`webhook-cassette` is a local-first CLI for turning real webhook samples into safe, replayable test cassettes. It reads raw HTTP text or JSON request samples, normalizes headers and bodies, redacts secrets from query strings, headers, and bodies, and writes fixtures you can commit and replay in CI.

It is not a hosted webhook inbox or public relay.

## Install

```bash
npm install -g webhook-cassette
```

## Quick Start

Record a raw webhook sample:

```bash
webhook-cassette record stripe.http --out cassettes/stripe.json --name stripe-demo
```

Inspect the sanitized cassette:

```bash
webhook-cassette inspect cassettes/stripe.json
```

Dry-run replay:

```bash
webhook-cassette replay cassettes/stripe.json --url http://127.0.0.1:3000/webhook --dry-run
```

Replay drops the recorded `Content-Length` header so the HTTP client recalculates it after redaction and JSON serialization.

Generate demo assets:

```bash
webhook-cassette demo --out reports/demo
```

## Raw Sample

```http
POST /webhook HTTP/1.1
Content-Type: application/json
Authorization: Bearer ghp_1234567890
Stripe-Signature: t=123,v1=abcdef

{"id":"evt_123","email":"user@example.com","api_key":"sk_live_secret"}
```

## Sanitized Cassette Excerpt

```json
{
  "version": 1,
  "name": "stripe-demo",
  "requests": [
    {
      "method": "POST",
      "path": "/webhook",
      "headers": {
        "authorization": "[REDACTED]",
        "stripe-signature": "[REDACTED]"
      },
      "body": {
        "id": "evt_123",
        "email": "[REDACTED]",
        "api_key": "[REDACTED]"
      }
    }
  ]
}
```

## Commands

- `record <input> --out cassette.json [--name name]`
- `inspect <cassette.json> [--format markdown|json]`
- `replay <cassette.json> --url <url> [--dry-run]`
- `demo --out reports/demo`

## Development

```bash
npm install
npm run check
node dist/cli.js demo --out reports/demo
npm pack --dry-run --ignore-scripts
```

## License

MIT
