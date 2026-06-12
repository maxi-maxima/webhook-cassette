import type { ReportFormat, WebhookCassette } from "./types.js";

export function renderInspection(cassette: WebhookCassette, format: ReportFormat): string {
  const summary = {
    name: cassette.name,
    version: cassette.version,
    requestCount: cassette.requests.length,
    redactionCount: cassette.redactions.length,
    methods: [...new Set(cassette.requests.map((request) => request.method))],
    paths: [...new Set(cassette.requests.map((request) => request.path))]
  };
  if (format === "json") {
    return `${JSON.stringify(summary, null, 2)}\n`;
  }
  return [
    "# webhook-cassette inspection",
    "",
    `Name: \`${summary.name}\``,
    `Requests: ${summary.requestCount}`,
    `Redactions: ${summary.redactionCount}`,
    `Methods: ${summary.methods.join(", ") || "none"}`,
    `Paths: ${summary.paths.join(", ") || "none"}`,
    "",
    "## Redactions",
    "",
    ...cassette.redactions.map((redaction) => `- \`${redaction.path}\`: ${redaction.reason}`)
  ].join("\n").trimEnd() + "\n";
}
