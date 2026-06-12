# webhook-cassette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish `webhook-cassette`, a Node.js CLI that records, redacts, inspects, and dry-runs replayable webhook request fixtures.

**Architecture:** The CLI parses raw HTTP or JSON request samples into a normalized request model, redacts sensitive fields, writes cassette JSON, renders inspection reports, and supports dry-run or real replay with Node fetch. The implementation is split into focused TypeScript modules with Vitest coverage.

**Tech Stack:** Node.js 20+, TypeScript, Vitest, ESLint, npm package CLI, GitHub Actions.

---

## File Structure

- `package.json`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `.gitignore`: project tooling.
- `.github/workflows/ci.yml`: CI gate.
- `src/types.ts`: request, cassette, report, and CLI types.
- `src/parser.ts`: raw HTTP and JSON request parsing.
- `src/redactor.ts`: key and value based redaction.
- `src/cassette.ts`: cassette creation and read/write helpers.
- `src/replay.ts`: dry-run and fetch replay.
- `src/reporters.ts`: Markdown and JSON inspection output.
- `src/commands.ts`: record, inspect, replay orchestration.
- `src/demo.ts`: demo input, cassette, and reports.
- `src/cli.ts`: CLI entrypoint.
- `tests/*.test.ts`: parser, redactor, cassette, replay, reporters, commands, demo.
- Bilingual docs and MIT license.

## Tasks

1. Scaffold TypeScript CLI and verify `npm run check`.
2. Write failing tests for parser and redactor, then implement them.
3. Write failing tests for cassette and reporters, then implement them.
4. Write failing tests for replay, commands, and demo, then implement them.
5. Add bilingual docs, MIT license, and CI.
6. Run `npm run check`, `node dist/cli.js demo --out reports/demo`, and `npm pack --dry-run --ignore-scripts`.
7. Create public GitHub repo `maxi-maxima/webhook-cassette`, push `main`, and verify public sync.

## Verification Commands

```bash
npm run check
node dist/cli.js demo --out reports/demo
npm pack --dry-run --ignore-scripts
git status --short --branch
git ls-remote --heads origin main
```

## Self-Review

- Spec coverage: parser, redactor, cassette, replay, reporters, CLI, demo, docs, CI, package verification, and GitHub publish are covered.
- Placeholder scan: no TBD or TODO placeholders.
- Type consistency: shared types are introduced before module use.
