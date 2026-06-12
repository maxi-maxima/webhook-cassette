import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { redactRequest } from "./redactor.js";
import type { RecordedRequest, WebhookCassette } from "./types.js";

export function createCassette(name: string, requests: RecordedRequest[]): WebhookCassette {
  const redacted = requests.map((request) => redactRequest(request));
  return {
    version: 1,
    name,
    createdAt: new Date().toISOString(),
    requests: redacted.map((item) => item.request),
    redactions: redacted.flatMap((item) => item.redactions)
  };
}

export async function writeCassette(path: string, cassette: WebhookCassette): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(cassette, null, 2)}\n`, "utf8");
}

export async function readCassette(path: string): Promise<WebhookCassette> {
  const parsed = JSON.parse(await readFile(path, "utf8")) as WebhookCassette;
  if (parsed.version !== 1 || !Array.isArray(parsed.requests) || !Array.isArray(parsed.redactions)) {
    throw new Error("Invalid webhook cassette");
  }
  return parsed;
}
