import type { RecordedRequest } from "./types.js";

export function parseRequests(input: string): RecordedRequest[] {
  const trimmed = input.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed) as unknown;
    const items = Array.isArray(parsed) ? parsed : [parsed];
    return items.map(normalizeJsonRequest);
  }
  return [parseRawHttp(trimmed)];
}

function parseRawHttp(input: string): RecordedRequest {
  const [head = "", ...bodyParts] = input.split(/\r?\n\r?\n/u);
  const lines = head.split(/\r?\n/u).filter(Boolean);
  const requestLine = lines.shift() ?? "";
  const match = /^([A-Z]+)\s+(\S+)\s+HTTP\/\d(?:\.\d)?$/iu.exec(requestLine.trim());
  if (!match) {
    throw new Error("Invalid raw HTTP request line");
  }
  const headers: Record<string, string> = {};
  for (const line of lines) {
    const separator = line.indexOf(":");
    if (separator > 0) {
      headers[line.slice(0, separator).trim().toLowerCase()] = line.slice(separator + 1).trim();
    }
  }
  const bodyText = bodyParts.join("\n\n").trim();
  return {
    method: (match[1] ?? "GET").toUpperCase(),
    path: match[2] ?? "/",
    headers,
    body: parseBody(bodyText)
  };
}

function normalizeJsonRequest(value: unknown): RecordedRequest {
  if (!isRecord(value)) {
    throw new Error("JSON request must be an object");
  }
  return {
    method: String(value.method ?? "POST").toUpperCase(),
    path: String(value.path ?? "/"),
    headers: normalizeHeaders(isRecord(value.headers) ? value.headers : {}),
    body: typeof value.body === "string" ? parseBody(value.body) : value.body ?? null
  };
}

function normalizeHeaders(headers: Record<string, unknown>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = String(value);
  }
  return normalized;
}

function parseBody(bodyText: string): unknown {
  if (!bodyText) {
    return null;
  }
  try {
    return JSON.parse(bodyText) as unknown;
  } catch {
    return bodyText;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
