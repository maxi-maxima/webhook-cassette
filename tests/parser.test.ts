import { describe, expect, test } from "vitest";
import { parseRequests } from "../src/parser.js";

describe("parseRequests", () => {
  test("parses raw HTTP request text", () => {
    const requests = parseRequests(`POST /webhook HTTP/1.1
Host: example.test
Content-Type: application/json
X-API-Key: secret

{"id":"evt_123","ok":true}`);

    expect(requests).toEqual([
      {
        method: "POST",
        path: "/webhook",
        headers: {
          host: "example.test",
          "content-type": "application/json",
          "x-api-key": "secret"
        },
        body: { id: "evt_123", ok: true }
      }
    ]);
  });

  test("parses JSON request arrays", () => {
    const requests = parseRequests(
      JSON.stringify([{ method: "post", path: "/hook", headers: { Authorization: "Bearer abc" }, body: "{\"hello\":true}" }])
    );

    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.headers.authorization).toBe("Bearer abc");
    expect(requests[0]?.body).toEqual({ hello: true });
  });
});
