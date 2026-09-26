import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("joins conditional classes and drops falsy ones", () => {
    expect(cn("a", ["b"], { c: true, d: false }, undefined)).toBe("a b c");
  });

  it("lets a later Tailwind utility win a conflict", () => {
    expect(cn("px-(--space-2)", "px-(--space-4)")).toBe("px-(--space-4)");
  });

  it("keeps a font-size and a text colour, which don't conflict", () => {
    expect(cn("text-(length:--font-size-body)", "text-(--color-semantic-text-primary)")).toBe(
      "text-(length:--font-size-body) text-(--color-semantic-text-primary)",
    );
  });
});
