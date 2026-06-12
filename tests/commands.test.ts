import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { runInspect, runRecord, runReplay } from "../src/commands.js";

async function workspace(): Promise<string> {
  return mkdtemp(join(tmpdir(), "webhook-cassette-commands-"));
}

describe("commands", () => {
  test("records raw input to sanitized cassette", async () => {
    const root = await workspace();
    const input = join(root, "sample.http");
    const out = join(root, "cassette.json");
    await writeFile(input, "POST /webhook HTTP/1.1\nAuthorization: Bearer abc\n\n{}", "utf8");

    const result = await runRecord({ input, out, name: "demo" });

    expect(result.exitCode).toBe(0);
    expect(await readFile(out, "utf8")).toContain("[REDACTED]");
  });

  test("inspects cassette as markdown", async () => {
    const root = await workspace();
    const input = join(root, "sample.http");
    const out = join(root, "cassette.json");
    await writeFile(input, "POST /webhook HTTP/1.1\n\n{}", "utf8");
    await runRecord({ input, out, name: "demo" });

    const result = await runInspect({ cassettePath: out, format: "markdown" });

    expect(result.stdout).toContain("# webhook-cassette inspection");
  });

  test("dry-runs replay", async () => {
    const root = await workspace();
    const input = join(root, "sample.http");
    const out = join(root, "cassette.json");
    await writeFile(input, "POST /webhook HTTP/1.1\n\n{}", "utf8");
    await runRecord({ input, out, name: "demo" });

    const result = await runReplay({ cassettePath: out, url: "http://127.0.0.1:3000/webhook", dryRun: true });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("DRY POST http://127.0.0.1:3000/webhook");
  });
});
