#!/usr/bin/env node
import { createDemo } from "./demo.js";
import { parseFormat, runInspect, runRecord, runReplay } from "./commands.js";

async function main(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);
  if (parsed.command === "help" || parsed.flags.has("help")) {
    process.stdout.write(helpText());
    return 0;
  }
  try {
    if (parsed.command === "record") {
      const input = parsed.positionals[0];
      const out = stringFlag(parsed.flags, "out");
      if (!input || !out) {
        process.stderr.write("record requires <input> and --out\n");
        return 2;
      }
      return emit(await runRecord({ input, out, name: stringFlag(parsed.flags, "name") }));
    }
    if (parsed.command === "inspect") {
      const cassettePath = parsed.positionals[0];
      if (!cassettePath) {
        process.stderr.write("inspect requires <cassette.json>\n");
        return 2;
      }
      return emit(await runInspect({ cassettePath, format: parseFormat(stringFlag(parsed.flags, "format")) }));
    }
    if (parsed.command === "replay") {
      const cassettePath = parsed.positionals[0];
      const url = stringFlag(parsed.flags, "url");
      if (!cassettePath || !url) {
        process.stderr.write("replay requires <cassette.json> and --url\n");
        return 2;
      }
      return emit(await runReplay({ cassettePath, url, dryRun: Boolean(parsed.flags.get("dry-run")) }));
    }
    if (parsed.command === "demo") {
      const out = stringFlag(parsed.flags, "out") ?? parsed.positionals[0] ?? "reports/demo";
      const result = await createDemo(out);
      process.stdout.write(`Wrote demo cassette and reports to ${result.cassettePath}\n`);
      return 0;
    }
    process.stderr.write(`Unknown command: ${parsed.command}\n`);
    return 2;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }
}

function emit(result: { exitCode: number; stdout: string; stderr: string }): number {
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr ? `${result.stderr}\n` : "");
  return result.exitCode;
}

function parseArgs(argv: string[]): { command: string; positionals: string[]; flags: Map<string, string | boolean> } {
  const [command = "help", ...rest] = argv;
  const positionals: string[] = [];
  const flags = new Map<string, string | boolean>();
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index] ?? "";
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = rest[index + 1];
    if (next && !next.startsWith("--")) {
      flags.set(key, next);
      index += 1;
    } else {
      flags.set(key, true);
    }
  }
  return { command, positionals, flags };
}

function stringFlag(flags: Map<string, string | boolean>, key: string): string | undefined {
  const value = flags.get(key);
  return typeof value === "string" ? value : undefined;
}

function helpText(): string {
  return `webhook-cassette

Usage:
  webhook-cassette record <input> --out cassette.json [--name name]
  webhook-cassette replay <cassette.json> --url http://127.0.0.1:3000/webhook [--dry-run]
  webhook-cassette inspect <cassette.json> [--format markdown|json]
  webhook-cassette demo --out reports/demo
`;
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
});
