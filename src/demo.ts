import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { runInspect, runRecord, runReplay } from "./commands.js";

export interface DemoResult {
  rawInput: string;
  cassettePath: string;
  markdownReport: string;
  jsonReport: string;
  replayPlan: string;
}

export async function createDemo(outDir: string): Promise<DemoResult> {
  const out = resolve(outDir);
  await mkdir(out, { recursive: true });
  const rawInput = join(out, "stripe-webhook.http");
  const cassettePath = join(out, "stripe-webhook.cassette.json");
  const markdownReport = join(out, "inspection.md");
  const jsonReport = join(out, "inspection.json");
  const replayPlan = join(out, "replay-plan.txt");
  await writeFile(
    rawInput,
    "POST /webhook HTTP/1.1\nContent-Type: application/json\nAuthorization: Bearer ghp_1234567890\nStripe-Signature: t=123,v1=abcdef\n\n{\"id\":\"evt_123\",\"email\":\"user@example.com\",\"api_key\":\"sk_live_secret\"}\n",
    "utf8"
  );
  await runRecord({ input: rawInput, out: cassettePath, name: "stripe-demo" });
  await writeFile(markdownReport, (await runInspect({ cassettePath, format: "markdown" })).stdout, "utf8");
  await writeFile(jsonReport, (await runInspect({ cassettePath, format: "json" })).stdout, "utf8");
  await writeFile(replayPlan, (await runReplay({ cassettePath, url: "http://127.0.0.1:3000/webhook", dryRun: true })).stdout, "utf8");
  return { rawInput, cassettePath, markdownReport, jsonReport, replayPlan };
}
