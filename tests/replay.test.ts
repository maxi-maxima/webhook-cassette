import { describe, expect, test } from "vitest";
import { replayCassette } from "../src/replay.js";
import type { WebhookCassette } from "../src/types.js";

const cassette: WebhookCassette = {
  version: 1,
  name: "demo",
  createdAt: "2026-06-12T00:00:00.000Z",
  requests: [{ method: "POST", path: "/webhook", headers: { "content-type": "application/json" }, body: { ok: true } }],
  redactions: []
};

describe("replayCassette", () => {
  test("dry-runs without network calls", async () => {
    const results = await replayCassette(cassette, "http://127.0.0.1:3000/webhook", true);

    expect(results).toEqual([{ method: "POST", url: "http://127.0.0.1:3000/webhook", ok: true, dryRun: true }]);
  });

  test("preserves recorded query strings", async () => {
    const withQuery: WebhookCassette = {
      ...cassette,
      requests: [{ ...cassette.requests[0]!, path: "/webhook?event=paid&attempt=2" }]
    };

    const results = await replayCassette(withQuery, "http://127.0.0.1:3000/webhook", true);

    expect(results[0]?.url).toBe("http://127.0.0.1:3000/webhook?event=paid&attempt=2");
  });
});
