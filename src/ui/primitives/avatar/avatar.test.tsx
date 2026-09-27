import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "./avatar";

describe("Avatar (C16)", () => {
  it("renders uppercase initials in the MD variant", () => {
    render(<Avatar initials="ds" aria-label="Dimas Sari" />);

    expect(screen.getByLabelText("Dimas Sari")).toHaveTextContent("DS");
    expect(screen.getByLabelText("Dimas Sari")).toHaveClass("size-(--space-8)");
  });

  it("can be decorative when the adjacent name supplies its accessible name", () => {
    render(<Avatar initials="Dimas Sari" aria-hidden />);

    expect(screen.getByText("DS")).toHaveAttribute("aria-hidden", "true");
  });
});
