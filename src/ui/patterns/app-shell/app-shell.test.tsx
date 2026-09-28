import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AppShell } from "./app-shell";

const props = {
  title: "Dasbor",
  workspace: { name: "Studio Lime" },
  account: { name: "Hardi Ansari", email: "hardi@example.com", initials: "HA" },
  nav: <span>Desktop nav</span>,
  mobileBottomNav: {
    items: [
      { href: "/", label: "Dasbor", icon: "layout-grid" as const, isActive: true },
      { href: "/projects", label: "Proyek", icon: "folder-kanban" as const },
      { href: "/clients", label: "Klien", icon: "users" as const },
      { href: "/more", label: "Lainnya", icon: "menu" as const },
    ] as const,
    ctaLabel: "Proyek baru",
    onCtaPress: () => undefined,
  },
};

describe("AppShell (C30/C37)", () => {
  it("renders the skip link and responsive desktop, tablet and mobile shell regions", () => {
    const { container } = render(
      <AppShell {...props}>
        <p>Konten workspace</p>
      </AppShell>,
    );

    expect(container.firstElementChild).toHaveClass(
      "md:pt-(--space-3)",
      "md:pr-(--space-3)",
      "md:pb-(--space-3)",
    );

    expect(screen.getAllByRole("link", { name: "Langsung ke konten" })[0]).toHaveAttribute(
      "href",
      "#app-shell-content",
    );
    expect(screen.getAllByText("Konten workspace").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("main").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("complementary", { name: "Sidebar" }).length).toBeGreaterThan(0);
  });

  it("keeps the tablet overlay closed by default", () => {
    render(
      <AppShell {...props}>
        <p>Konten workspace</p>
      </AppShell>,
    );

    expect(screen.queryByRole("dialog", { name: "Navigasi utama" })).toBeNull();
  });

  it("opens the tablet sidebar as a dismissible navigation dialog", async () => {
    const user = userEvent.setup();
    const { getAllByRole, queryByRole } = render(
      <AppShell {...props}>
        <p>Konten workspace</p>
      </AppShell>,
    );

    await user.click(getAllByRole("button", { name: "Buka sidebar" })[0]);
    expect(screen.getByRole("dialog", { name: "Navigasi utama" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ciutkan sidebar" }));
    expect(queryByRole("dialog", { name: "Navigasi utama" })).toBeNull();
  });
});
