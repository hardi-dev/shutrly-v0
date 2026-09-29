import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NavItem } from "../nav-item/nav-item";
import { Sidebar } from "./sidebar";

describe("Sidebar (C29)", () => {
  it("renders the workspace switcher, navigation slots and account controls", () => {
    render(
      <Sidebar
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
      >
        <NavItem href="/projects" label="Proyek" icon="folder-kanban" isActive />
      </Sidebar>,
    );

    expect(screen.getByRole("complementary")).toHaveClass("w-(--component-sidebar-width)");
    expect(screen.getByRole("button", { name: "Studio Lime" })).toHaveAttribute(
      "aria-haspopup",
      "menu",
    );
    expect(
      screen.getByRole("button", { name: "Studio Lime" }).querySelector('svg[data-icon="camera"]'),
    ).toBeNull();
    expect(screen.getByRole("link", { name: "Proyek" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Hardi Ansari")).toBeInTheDocument();
    expect(screen.getByText("hardi@example.com")).toBeInTheDocument();
  });

  it("exposes collapse and logout actions", () => {
    const onCollapse = vi.fn();
    const onLogout = vi.fn();
    render(
      <Sidebar
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
        onCollapse={onCollapse}
        onLogout={onLogout}
      >
        <span>Nav</span>
      </Sidebar>,
    );

    screen.getByRole("button", { name: "Ciutkan sidebar" }).click();
    screen.getByRole("button", { name: "Keluar" }).click();
    expect(onCollapse).toHaveBeenCalledOnce();
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("renders the compact rail mode with a grouped nav and an expand control", () => {
    const onExpand = vi.fn();
    render(
      <Sidebar
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
        isCompact
        onExpand={onExpand}
      >
        <NavItem href="/projects" label="Proyek" icon="folder-kanban" isActive isCompact />
      </Sidebar>,
    );

    expect(screen.getByRole("complementary")).toHaveClass("w-(--size-rail)");
    expect(screen.queryByText("shutrly")).toBeNull();
    const workspaceSwitcher = screen.getByRole("button", { name: "Studio Lime" });
    expect(
      workspaceSwitcher.querySelector('svg[data-icon="chevrons-up-down"]'),
    ).toBeInTheDocument();
    expect(workspaceSwitcher.querySelector('svg[data-icon="camera"]')).toBeNull();
    expect(screen.getAllByTestId("sidebar-divider")[0]).toHaveClass("w-(--space-8)");
    screen.getByRole("button", { name: "Buka sidebar" }).click();
    expect(onExpand).toHaveBeenCalledOnce();
  });

  it("uses the aperture brand mark in the expanded and compact logo", () => {
    const { container, rerender } = render(
      <Sidebar
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
      >
        <span />
      </Sidebar>,
    );
    expect(container.querySelector('svg[data-icon="aperture"]')).toHaveClass(
      "size-(--size-mark-lg)",
      "text-(--component-sidebar-logo)",
    );
    expect(screen.getByText("shutrly")).toBeInTheDocument();

    rerender(
      <Sidebar
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
        isCompact
      >
        <span />
      </Sidebar>,
    );
    expect(container.querySelector('svg[data-icon="aperture"]')).toBeInTheDocument();
    expect(container.querySelector('svg[data-icon="camera"]')).toBeNull();
  });
});
