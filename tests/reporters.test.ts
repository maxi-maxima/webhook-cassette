import { describe, expect, test } from "vitest";
import { createCassette } from "../src/cassette.js";
import { parseRequests } from "../src/parser.js";
import { renderInspection } from "../src/reporters.js";

const cassette = createCassette("demo", parseRequests("POST /webhook HTTP/1.1\nAuthorization: Bearer abc\n\n{}"));

describe("renderInspection", () => {
  test("renders markdown", () => {
    const markdown = renderInspection(cassette, "markdown");

    expect(markdown).toContain("# webhook-cassette inspection");
    expect(markdown).toContain("Redactions: 1");
  });

  test("renders JSON", () => {
    const json = JSON.parse(renderInspection(cassette, "json"));

    expect(json.name).toBe("demo");
    expect(json.requestCount).toBe(1);
  });
});
