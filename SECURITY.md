# Security Policy

## Reporting Issues

Please report security issues through GitHub security advisories when available.

## Scope

`webhook-cassette` handles webhook samples that may contain secrets. Bugs that fail to redact documented secret patterns, write outside requested output paths, or send network requests during dry-run replay are in scope.

## Supported Versions

The current `0.x` line receives security fixes.
