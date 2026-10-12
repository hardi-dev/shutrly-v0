import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Menu } from "../menu/menu";
import { MenuItem } from "../menu/menu-item";
import { MenuTrigger } from "../menu/menu-trigger";
import { NavItem } from "../nav-item/nav-item";
import { Sidebar } from "./sidebar";

describe("Sidebar (C29)", () => {
  it("opens the account menu from the account block", async () => {
    const user = userEvent.setup();
    const renderAccountMenu = (trigger: ReactNode) => (
      <MenuTrigger label="Menu akun">
        {trigger}
        <Menu aria-label="Menu akun">
          <MenuItem label="Profil" />
        </Menu>
      </MenuTrigger>
    );
    render(
      <Sidebar
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
        accountMenu={renderAccountMenu}
      >
        <span>Nav</span>
      </Sidebar>,
    );

    expect(screen.queryByRole("button", { name: "Keluar" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Menu akun" }));
    expect(screen.getByRole("menuitem", { name: "Profil" })).toBeInTheDocument();
  });

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

  it("exposes the logout action and owns no sidebar toggle (F-22)", () => {
    const onLogout = vi.fn();
    render(
      <Sidebar
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
        onLogout={onLogout}
      >
        <span>Nav</span>
      </Sidebar>,
    );

    screen.getByRole("button", { name: "Keluar" }).click();
    expect(onLogout).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Ciutkan navigasi samping" })).toBeNull();
  });

  it("renders the compact rail mode with a grouped nav and no expand control (F-22)", () => {
    render(
      <Sidebar
        workspace={{ name: "Studio Lime" }}
        account={{ name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" }}
        isCompact
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
    expect(screen.queryByRole("button", { name: "Buka navigasi samping" })).toBeNull();
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
