import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MenuGroupLabel } from "./menu-group-label";

describe("MenuGroupLabel (C10)", () => {
  it("renders the group name with the menu overline token", () => {
    render(<MenuGroupLabel>Workspace</MenuGroupLabel>);

    expect(screen.getByText("Workspace")).toHaveClass(
      "text-(--component-menu-group-label)",
      "text-(length:--font-size-overline)",
    );
  });
});
