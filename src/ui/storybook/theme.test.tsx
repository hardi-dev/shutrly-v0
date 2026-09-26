import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThemeFrame } from "./theme";

describe("ThemeFrame", () => {
  it.each(["light", "dark"] as const)("sets the %s theme", (mode) => {
    render(
      <ThemeFrame mode={mode}>
        <span>content</span>
      </ThemeFrame>,
    );

    expect(screen.getByText("content").parentElement).toHaveAttribute("data-theme", mode);
  });
});
