import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Menu } from "./menu";
import { MenuItem } from "./menu-item";

function handleSelect() {
  return undefined;
}

describe("MenuItem (C09)", () => {
  it("renders an action with its icon and description", () => {
    render(
      <Menu aria-label="Tindakan">
        <MenuItem
          label="Pengaturan"
          description="Atur workspace"
          icon="settings"
          onSelect={handleSelect}
        />
      </Menu>,
    );

    expect(screen.getByRole("menuitem", { name: "Pengaturan Atur workspace" })).toBeInTheDocument();
    expect(screen.getByTestId("menu-item-icon")).toBeInTheDocument();
  });

  it("marks selected and destructive states without relying on colour alone", () => {
    render(
      <Menu aria-label="Tindakan">
        <MenuItem label="Hapus proyek" variant="destructive" isSelected onSelect={handleSelect} />
      </Menu>,
    );

    const item = screen.getByRole("menuitem", { name: "Hapus proyek" });
    expect(item).toHaveClass("text-(--component-menu-item-text-destructive)");
    expect(screen.getByText("Hapus proyek")).toHaveClass("font-semibold");
    expect(screen.getByTestId("menu-item-check")).toBeInTheDocument();
  });

  it("renders a safe link item when href and a new target are supplied", () => {
    render(
      <Menu aria-label="Tindakan">
        <MenuItem label="Buka" href="https://example.com" target="_blank" />
      </Menu>,
    );
    const item = screen.getByRole("menuitem", { name: "Buka" });
    expect(item).toHaveAttribute("href", "https://example.com");
    expect(item).toHaveAttribute("rel", "noopener noreferrer");
  });
});
