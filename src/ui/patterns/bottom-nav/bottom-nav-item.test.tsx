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

  it("places the count badge beside the icon wrapper", () => {
    render(<BottomNavItem href="/projects" label="Proyek" icon="folder-kanban" count={12} />);

    expect(screen.getByText("12")).toHaveClass(
      "left-(--space-4)",
      "top-[calc(var(--space-0-5)*-1)]",
      "z-10",
    );
  });
});
