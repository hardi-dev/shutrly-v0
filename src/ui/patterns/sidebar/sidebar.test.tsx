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

  it("renders the compact rail mode with an expand action on the logo", () => {
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
    screen.getByRole("button", { name: "Buka sidebar" }).click();
    expect(onExpand).toHaveBeenCalledOnce();
  });
});
