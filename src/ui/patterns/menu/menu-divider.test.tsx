import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MenuDivider } from "./menu-divider";

describe("MenuDivider (C10)", () => {
  it("renders a decorative separator with the approved border token", () => {
    const { container } = render(<MenuDivider />);

    expect(container.firstElementChild).toHaveAttribute("role", "separator");
    expect(container.firstElementChild).toHaveClass("bg-(--component-menu-divider)");
  });
});
