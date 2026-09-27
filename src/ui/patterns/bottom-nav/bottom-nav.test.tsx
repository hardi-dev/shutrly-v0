import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BottomNav } from "./bottom-nav";

describe("BottomNav (C34)", () => {
  it("AC-WS-022 renders four tabs and an accessible create CTA", () => {
    render(
      <BottomNav
        items={[
          { href: "/", label: "Dasbor", icon: "layout-grid", isActive: true },
          { href: "/projects", label: "Proyek", icon: "folder-kanban", count: 12 },
          { href: "/clients", label: "Klien", icon: "users" },
          { href: "/more", label: "Lainnya", icon: "menu" },
        ]}
        ctaLabel="Proyek baru"
        onCtaPress={vi.fn()}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Utama" })).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Proyek baru" })).toBeInTheDocument();
  });
});
