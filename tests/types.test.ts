import { describe, expect, test } from "vitest";
import type { ReportFormat, WebhookCassette } from "../src/types.js";

describe("shared types", () => {
  test("allow cassette shape", () => {
    const format: ReportFormat = "markdown";
    const cassette: WebhookCassette = { version: 1, name: "demo", createdAt: "now", requests: [], redactions: [] };

    expect([format, cassette.version]).toEqual(["markdown", 1]);
  });
});
