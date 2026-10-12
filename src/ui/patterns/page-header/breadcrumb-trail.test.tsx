import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BreadcrumbTrail } from "./breadcrumb-trail";

const LONG_TITLE = "Pernikahan Rina dan Dimas di Gedung Serbaguna Kota Lama Semarang";

const ITEMS = [
  { label: "Aster", href: "/w/A" },
  { label: "Proyek", href: "/w/A/projects" },
  { label: LONG_TITLE, href: "/w/A/projects/p1" },
  { label: "Galeri", href: "/w/A/projects/p1/gallery" },
  { label: "Pilihan klien", href: "/w/A/projects/p1/gallery/picks" },
  { label: "Foto album keluarga besar" },
];

describe("BreadcrumbTrail (F-22 OQ-5)", () => {
  it("AC-CRUMB-013 keeps the root and the current page whole", () => {
    render(<BreadcrumbTrail label="Breadcrumb" items={ITEMS} />);

    const root = screen.getByRole("link", { name: "Aster" });
    expect(root).toHaveClass("shrink-0");
    expect(root).not.toHaveAttribute("title");
    const current = screen.getByText("Foto album keluarga besar");
    expect(current).toHaveClass("shrink-0");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("AC-CRUMB-013 lets the middle crumbs shrink with their full label as a tooltip", () => {
    render(<BreadcrumbTrail label="Breadcrumb" items={ITEMS} />);

    const middle = screen.getByRole("link", { name: LONG_TITLE });
    expect(middle).toHaveClass("min-w-0", "truncate");
    expect(middle).not.toHaveClass("shrink-0");
    expect(middle).toHaveAttribute("title", LONG_TITLE);
    expect(middle).toHaveAttribute("href", "/w/A/projects/p1");
  });

  it("AC-CRUMB-013 keeps every ancestor a keyboard-reachable link", () => {
    render(<BreadcrumbTrail label="Breadcrumb" items={ITEMS} />);

    expect(screen.getAllByRole("link")).toHaveLength(5);
  });

  it("treats a single crumb as both edges", () => {
    render(<BreadcrumbTrail label="Breadcrumb" items={[{ label: "Dasbor" }]} />);

    expect(screen.getByText("Dasbor")).toHaveClass("shrink-0");
  });
});
