import type { RecordedRequest, Redaction } from "./types.js";

const KEY_PATTERNS = [/authorization/iu, /cookie/iu, /signature/iu, /token/iu, /secret/iu, /password/iu, /api[_-]?key/iu];
const VALUE_PATTERNS = [/bearer\s+[a-z0-9._-]+/iu, /gh[pousr]_[a-z0-9_]+/iu, /sk_(live|test)_[a-z0-9_]+/iu, /[^\s@]+@[^\s@]+\.[^\s@]+/iu];

export function redactRequest(request: RecordedRequest): { request: RecordedRequest; redactions: Redaction[] } {
  const redactions: Redaction[] = [];
  const path = redactPath(request.path, redactions);
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(request.headers)) {
    const path = `headers.${key}`;
    if (isSensitiveKey(key) || isSensitiveValue(value)) {
      headers[key] = "[REDACTED]";
      redactions.push({ path, reason: reasonFor(key, value) });
    } else {
      headers[key] = value;
    }
  }
  const body = redactValue(request.body, "body", redactions);
  return {
    request: { ...request, path, headers, body },
    redactions
  };
}

function redactPath(path: string, redactions: Redaction[]): string {
  const queryStart = path.indexOf("?");
  if (queryStart < 0) {
    return path;
  }

  const fragmentStart = path.indexOf("#", queryStart);
  const queryEnd = fragmentStart < 0 ? path.length : fragmentStart;
  const output = new URLSearchParams();
  let changed = false;

  for (const [key, value] of new URLSearchParams(path.slice(queryStart + 1, queryEnd))) {
    if (isSensitiveKey(key) || isSensitiveValue(value)) {
      output.append(key, "[REDACTED]");
      redactions.push({ path: `path.query.${key}`, reason: reasonFor(key, value) });
      changed = true;
    } else {
      output.append(key, value);
    }
  }

  if (!changed) {
    return path;
  }
  return `${path.slice(0, queryStart)}?${output.toString()}${fragmentStart < 0 ? "" : path.slice(fragmentStart)}`;
}

function redactValue(value: unknown, path: string, redactions: Redaction[]): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) => redactValue(item, `${path}[${index}]`, redactions));
  }
  if (isRecord(value)) {
    const output: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      const childPath = `${path}.${key}`;
      if (isSensitiveKey(key) || (typeof child === "string" && isSensitiveValue(child))) {
        output[key] = "[REDACTED]";
        redactions.push({ path: childPath, reason: reasonFor(key, typeof child === "string" ? child : "") });
      } else {
        output[key] = redactValue(child, childPath, redactions);
      }
    }
    return output;
  }
  if (typeof value === "string" && isSensitiveValue(value)) {
    redactions.push({ path, reason: "value-pattern" });
    return "[REDACTED]";
  }
  return value;
}

function isSensitiveKey(key: string): boolean {
  return KEY_PATTERNS.some((pattern) => pattern.test(key));
}

function isSensitiveValue(value: string): boolean {
  return VALUE_PATTERNS.some((pattern) => pattern.test(value));
}

function reasonFor(key: string, value: string): string {
  if (/signature/iu.test(key)) {
    return "signature";
  }
  if (isSensitiveKey(key)) {
    return "sensitive-key";
  }
  return isSensitiveValue(value) ? "value-pattern" : "sensitive";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
