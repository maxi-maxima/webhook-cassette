import type { ReplayResult, WebhookCassette } from "./types.js";

export async function replayCassette(cassette: WebhookCassette, targetUrl: string, dryRun: boolean): Promise<ReplayResult[]> {
  const results: ReplayResult[] = [];
  for (const request of cassette.requests) {
    const url = new URL(targetUrl);
    if (request.path && request.path !== "/") {
      url.pathname = request.path;
    }
    if (dryRun) {
      results.push({ method: request.method, url: url.toString(), ok: true, dryRun: true });
      continue;
    }
    const response = await fetch(url, {
      method: request.method,
      headers: request.headers,
      body: request.body === null || request.body === undefined ? undefined : typeof request.body === "string" ? request.body : JSON.stringify(request.body)
    });
    results.push({ method: request.method, url: url.toString(), status: response.status, ok: response.ok, dryRun: false });
  }
  return results;
}
