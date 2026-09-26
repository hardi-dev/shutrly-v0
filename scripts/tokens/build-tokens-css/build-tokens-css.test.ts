import { describe, expect, it } from "vitest";

import { buildTokensCss, cssVarName } from "./build-tokens-css";

describe("buildTokensCss", () => {
  it("AC-FND-012 emits light and dark token variables", () => {
    const result = buildTokensCss({
      color: { x: { $value: "#fff", $extensions: { "dev.pen.modes": { dark: "#000" } } } },
      space: { sm: { $value: 2 } },
    });
    expect(cssVarName(["color", "x"])).toBe("--color-x");
    expect(result.count).toBe(2);
    expect(result.css).toContain("--color-x: #fff;");
    expect(result.css).toContain("--color-x: #000;");
  });
});
