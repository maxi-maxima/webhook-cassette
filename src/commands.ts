import { readFile } from "node:fs/promises";
import { createCassette, readCassette, writeCassette } from "./cassette.js";
import { parseRequests } from "./parser.js";
import { renderInspection } from "./reporters.js";
import { replayCassette } from "./replay.js";
import type { ReportFormat } from "./types.js";

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function runRecord(options: { input: string; out: string; name?: string }): Promise<CommandResult> {
  try {
    const requests = parseRequests(await readFile(options.input, "utf8"));
    const cassette = createCassette(options.name ?? "webhook-cassette", requests);
    await writeCassette(options.out, cassette);
    return { exitCode: 0, stdout: `Wrote ${options.out}\n`, stderr: "" };
  } catch (error) {
    return { exitCode: 2, stdout: "", stderr: messageOf(error) };
  }
}

export async function runInspect(options: { cassettePath: string; format: ReportFormat }): Promise<CommandResult> {
  try {
    const cassette = await readCassette(options.cassettePath);
    return { exitCode: 0, stdout: renderInspection(cassette, options.format), stderr: "" };
  } catch (error) {
    return { exitCode: 2, stdout: "", stderr: messageOf(error) };
  }
}

export async function runReplay(options: { cassettePath: string; url: string; dryRun: boolean }): Promise<CommandResult> {
  try {
    const cassette = await readCassette(options.cassettePath);
    const results = await replayCassette(cassette, options.url, options.dryRun);
    const stdout = results
      .map((result) => `${result.dryRun ? "DRY " : ""}${result.method} ${result.url}${result.status ? ` -> ${result.status}` : ""}`)
      .join("\n");
    return { exitCode: results.every((result) => result.ok) ? 0 : 1, stdout: `${stdout}\n`, stderr: "" };
  } catch (error) {
    return { exitCode: 2, stdout: "", stderr: messageOf(error) };
  }
}

export function parseFormat(value: string | undefined): ReportFormat {
  if (value === undefined) {
    return "markdown";
  }
  if (value === "markdown" || value === "json") {
    return value;
  }
  throw new Error(`Unsupported format: ${value}`);
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
