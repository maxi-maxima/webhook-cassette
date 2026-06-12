import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { createCassette, readCassette, writeCassette } from "../src/cassette.js";
import { parseRequests } from "../src/parser.js";

describe("cassette helpers", () => {
  test("creates sanitized cassette with redaction metadata", () => {
    const cassette = createCassette("stripe-demo", parseRequests("POST /webhook HTTP/1.1\nAuthorization: Bearer abc\n\n{}"));

    expect(cassette.version).toBe(1);
    expect(cassette.name).toBe("stripe-demo");
    expect(cassette.requests[0]?.headers.authorization).toBe("[REDACTED]");
    expect(cassette.redactions[0]?.path).toBe("headers.authorization");
  });

  test("writes and reads cassette JSON", async () => {
    const dir = await mkdtemp(join(tmpdir(), "webhook-cassette-"));
    const path = join(dir, "cassette.json");
    const cassette = createCassette("demo", parseRequests("POST /webhook HTTP/1.1\n\n{}"));

    await writeCassette(path, cassette);

    expect(await readFile(path, "utf8")).toContain("\"version\": 1");
    expect((await readCassette(path)).name).toBe("demo");
  });
});
