import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tabs } from "./tabs";

const TABS = [
  { href: "/w/ws/services", label: "Layanan", isActive: true },
  { href: "/w/ws/services/categories", label: "Kategori", isActive: false },
  { href: "/w/ws/services/items", label: "Item paket", isActive: false },
];

describe("Tabs (C45)", () => {
  it("AC-CAT-003 renders link tabs and marks the current one", () => {
    render(<Tabs label="Bagian layanan" tabs={TABS} />);
    const nav = screen.getByRole("navigation", { name: "Bagian layanan" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Layanan" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Kategori" })).not.toHaveAttribute("aria-current");
  });
});
