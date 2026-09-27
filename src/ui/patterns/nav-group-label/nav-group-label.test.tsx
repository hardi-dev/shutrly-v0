import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NavGroupLabel } from "./nav-group-label";

describe("NavGroupLabel (C22)", () => {
  it("renders the group name with the approved overline token", () => {
    render(<NavGroupLabel>Katalog</NavGroupLabel>);

    expect(screen.getByText("Katalog")).toHaveClass("text-(length:--font-size-overline)");
  });
});
