import { describe, expect, it } from "vitest";

import tokens from "../../../../docs/design-system/tokens.json";
import { flattenTokens, toCssVariableName } from "./token-data";

describe("toCssVariableName", () => {
  it("uses the token path format used by tokens.css", () => {
    expect(toCssVariableName("color.semantic.surface.canvas")).toBe(
      "--color-semantic-surface-canvas",
    );
    expect(toCssVariableName("space.0-5")).toBe("--space-0-5");
  });
});

describe("flattenTokens", () => {
  it("keeps aliases and mode values in one record", () => {
    const records = flattenTokens({
      color: {
        $type: "color",
        semantic: {
          canvas: {
            $value: "{color.primitive.neutral.0}",
            $extensions: { "dev.pen.modes": { dark: "{color.primitive.neutral.950}" } },
          },
        },
      },
    });

    expect(records).toEqual([
      expect.objectContaining({
        path: "color.semantic.canvas",
        alias: "color.primitive.neutral.0",
        dark: "{color.primitive.neutral.950}",
      }),
    ]);
  });

  it("flattens the canonical token payload", () => {
    const records = flattenTokens(tokens);
    expect(records).toHaveLength(597);
    expect(records.find((record) => record.path === "color.semantic.surface.canvas")).toBeDefined();
  });
});
