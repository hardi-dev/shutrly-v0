import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileShell } from "./mobile-shell";

describe("MobileShell (C33)", () => {
  it("keeps the compact bar, the content sheet and the Bottom Nav", () => {
    render(
      <MobileShell
        compactBar={<header>Detail</header>}
        bottomNav={<nav aria-label="Bottom Nav">Tabs</nav>}
      >
        <p>Konten</p>
      </MobileShell>,
    );

    expect(screen.getByRole("main")).toHaveClass(
      "bg-(--color-semantic-surface-canvas)",
      "rounded-t-(--component-panel-app-radius)",
    );
    expect(screen.getByRole("navigation", { name: "Bottom Nav" })).toBeInTheDocument();
    expect(screen.getByText("Detail")).toBeInTheDocument();
  });
});
