import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileAppShell } from "./mobile-app-shell";

describe("MobileAppShell (C35)", () => {
  it("renders the skip link, app bar, content main and bottom navigation", () => {
    const { container } = render(
      <MobileAppShell title="Dasbor" bottomNav={<nav aria-label="Navigasi bawah">Nav</nav>}>
        <p>Konten mobile</p>
      </MobileAppShell>,
    );

    expect(container.firstElementChild).toHaveClass("w-full");
    expect(screen.getByRole("link", { name: "Langsung ke konten" })).toHaveAttribute(
      "href",
      "#mobile-app-content",
    );
    expect(screen.getByRole("banner")).toContainElement(
      screen.getByRole("heading", { name: "Dasbor" }),
    );
    expect(screen.getByRole("main")).toHaveTextContent("Konten mobile");
    expect(screen.getByRole("navigation", { name: "Navigasi bawah" })).toBeInTheDocument();
  });

  it("marks content and bottom navigation inert while a sheet is open", () => {
    render(
      <MobileAppShell
        title="Dasbor"
        isOverlayOpen
        bottomNav={<nav aria-label="Navigasi bawah">Nav</nav>}
        sheet={<div>Sheet</div>}
      >
        <p>Konten mobile</p>
      </MobileAppShell>,
    );

    expect(screen.getByRole("main")).toHaveAttribute("inert");
    expect(
      screen.getByRole("navigation", { name: "Navigasi bawah" }).parentElement,
    ).toHaveAttribute("inert");
    expect(screen.getByText("Sheet")).toBeInTheDocument();
  });
});
