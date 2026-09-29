import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Menu } from "./menu";
import { MenuCtaItem } from "./menu-cta-item";
import { MenuGroupLabel } from "./menu-group-label";
import { MenuItem } from "./menu-item";
import { MenuSection } from "./menu-section";

function handleSelect() {
  return undefined;
}

describe("MenuCtaItem (C10)", () => {
  it("renders a primary menu item after a labelled section", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Menu aria-label="Pindah workspace" variant="list">
        <MenuSection>
          <MenuGroupLabel>Pindah workspace</MenuGroupLabel>
          <MenuItem label="Aster Wedding" onSelect={handleSelect} />
          <MenuCtaItem label="Buat workspace" icon="plus" onSelect={onSelect} />
        </MenuSection>
      </Menu>,
    );

    const cta = screen.getByRole("menuitem", { name: "Buat workspace" });
    expect(cta.querySelector('[data-variant="primary"]')).toHaveClass(
      "bg-(--component-button-primary-background)",
    );
    await user.click(cta);
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
