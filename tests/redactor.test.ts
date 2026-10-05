import { describe, expect, test } from "vitest";
import { redactRequest } from "../src/redactor.js";
import type { RecordedRequest } from "../src/types.js";

describe("redactRequest", () => {
  test("redacts sensitive headers and body fields", () => {
    const request: RecordedRequest = {
      method: "POST",
      path: "/webhook",
      headers: {
        authorization: "Bearer ghp_1234567890abcdef",
        "stripe-signature": "t=123,v1=abcdef",
        "content-type": "application/json"
      },
      body: {
        email: "user@example.com",
        nested: { api_key: "sk_live_secret" },
        id: "evt_123"
      }
    };

    const result = redactRequest(request);

    expect(result.request.headers.authorization).toBe("[REDACTED]");
    expect(result.request.headers["stripe-signature"]).toBe("[REDACTED]");
    expect(result.request.body).toMatchObject({
      email: "[REDACTED]",
      nested: { api_key: "[REDACTED]" },
      id: "evt_123"
    });
    expect(result.redactions.map((redaction) => redaction.path)).toEqual(
      expect.arrayContaining(["headers.authorization", "headers.stripe-signature", "body.email", "body.nested.api_key"])
    );
  });

  test("redacts sensitive query parameters without changing safe values", () => {
    const request: RecordedRequest = {
      method: "POST",
      path: "/webhook?api_key=sk_live_secret&event=evt_123&email=user%40example.com#debug",
      headers: {},
      body: null
    };

    const result = redactRequest(request);

    expect(result.request.path).toBe(
      "/webhook?api_key=%5BREDACTED%5D&event=evt_123&email=%5BREDACTED%5D#debug"
    );
    expect(result.redactions.map((redaction) => redaction.path)).toEqual([
      "path.query.api_key",
      "path.query.email"
    ]);
  });
});
