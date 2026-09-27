import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NavItem } from "./nav-item";

describe("NavItem (C22)", () => {
  it("AC-WS-021 renders an active destination with its count in the accessible name", () => {
    render(<NavItem href="/projects" label="Proyek" icon="folder-kanban" count={12} isActive />);

    const link = screen.getByRole("link", { name: "Proyek 12" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveClass("bg-(--component-nav-item-background-active)");
  });

  it("renders a default destination with its semantic icon", () => {
    render(<NavItem href="/clients" label="Klien" icon="users" />);

    expect(screen.getByRole("link", { name: "Klien" })).not.toHaveAttribute("aria-current");
    expect(screen.getByTestId("nav-item-icon")).toBeInTheDocument();
  });
});
