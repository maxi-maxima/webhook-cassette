# Changelog

## Unreleased

- Preserve recorded query strings when replaying webhook cassettes.
- Drop recorded `Content-Length` headers before replay so serialized bodies use the correct length.
- Run CI checkout and Node setup actions on their Node 24 releases.

## 0.1.0 - 2026-06-12

- Initial public release.
- Added raw HTTP and JSON request parsing.
- Added key and value pattern redaction.
- Added cassette record, inspect, replay, and demo commands.
