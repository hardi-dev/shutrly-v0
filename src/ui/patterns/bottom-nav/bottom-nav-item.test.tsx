import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BottomNavItem } from "./bottom-nav-item";

describe("BottomNavItem (C34)", () => {
  it("AC-WS-021 uses colour and weight for the active tab", () => {
    render(<BottomNavItem href="/" label="Dasbor" icon="layout-grid" isActive />);

    const link = screen.getByRole("link", { name: "Dasbor" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveClass("text-(--component-bottom-nav-item-active)", "font-semibold");
  });
});
