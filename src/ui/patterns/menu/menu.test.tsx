import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Button } from "@/ui/primitives/button/button";

import { Menu } from "./menu";
import { MenuItem } from "./menu-item";
import { MenuTrigger } from "./menu-trigger";

function handleSelect() {
  return undefined;
}

describe("Menu (C10)", () => {
  it("opens from the trigger, supports menu keyboard navigation and closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <MenuTrigger label="Tindakan">
        <Button>Tindakan</Button>
        <Menu aria-label="Tindakan">
          <MenuItem label="Edit" onSelect={handleSelect} />
          <MenuItem label="Hapus" variant="destructive" onSelect={handleSelect} />
        </Menu>
      </MenuTrigger>,
    );

    await user.click(screen.getByRole("button", { name: "Tindakan" }));
    const menu = screen.getByRole("menu", { name: "Tindakan" });
    expect(menu).toBeVisible();
    expect(menu).toHaveFocus();
    expect(menu).not.toHaveClass("max-h-(--space-80)", "min-w-60");

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Tindakan" })).toHaveFocus();
    });
  });
});
