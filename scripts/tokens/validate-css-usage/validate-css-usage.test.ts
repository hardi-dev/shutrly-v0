import { describe, expect, it } from "vitest";

import { findUnknownCssVariables } from "./validate-css-usage";

describe("findUnknownCssVariables", () => {
  const knownVariables = new Set([
    "--component-panel-app-background",
    "--color-semantic-surface-panel",
  ]);

  it("accepts var() and Tailwind arbitrary-value references to known variables", () => {
    const issues = findUnknownCssVariables(
      [
        {
          path: "src/example.tsx",
          contents:
            '<div className="bg-(--component-panel-app-background)" style={{ color: "var(--color-semantic-surface-panel)" }} />',
        },
      ],
      knownVariables,
    );

    expect(issues).toEqual([]);
  });

  it("reports an unknown Tailwind variable with its source line", () => {
    const issues = findUnknownCssVariables(
      [{ path: "src/app-panel.tsx", contents: "\n  bg-(--component-panel-background)\n" }],
      knownVariables,
    );

    expect(issues).toEqual([
      { line: 2, path: "src/app-panel.tsx", variable: "--component-panel-background" },
    ]);
  });

  it("allows locally declared custom properties", () => {
    const issues = findUnknownCssVariables(
      [
        {
          path: "src/example.css",
          contents: ":root { --local-panel: red; }\n.card { color: var(--local-panel); }",
        },
      ],
      knownVariables,
    );

    expect(issues).toEqual([]);
  });
});
