import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NavRailItem } from "./nav-rail-item";

describe("NavRailItem (C37)", () => {
  it("uses the label as the accessible name and marks the active route", () => {
    render(<NavRailItem href="/settings" label="Pengaturan" icon="settings" isActive />);

    const link = screen.getByRole("link", { name: "Pengaturan" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("aria-describedby");
    expect(link).toHaveClass("size-(--space-10)");
  });
});
