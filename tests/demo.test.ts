import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { createDemo } from "../src/demo.js";

describe("createDemo", () => {
  test("writes sample input cassette and reports", async () => {
    const out = await mkdtemp(join(tmpdir(), "webhook-cassette-demo-"));

    const result = await createDemo(out);

    expect(await readFile(result.rawInput, "utf8")).toContain("POST /webhook");
    expect(await readFile(result.cassettePath, "utf8")).toContain("[REDACTED]");
    expect(await readFile(result.markdownReport, "utf8")).toContain("# webhook-cassette inspection");
    expect(JSON.parse(await readFile(result.jsonReport, "utf8")).requestCount).toBe(1);
  });
});
