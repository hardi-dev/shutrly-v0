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

  it("F-17 sub-page: breadcrumb parent and a Compact Bar back link to the parent", () => {
    render(
      <AppShell
        {...props}
        title="Bagikan gallery"
        subPage={{ parent: { label: "Template pesan", href: "/w/A/message-templates" } }}
      >
        <p>isi</p>
      </AppShell>,
    );
    expect(screen.getAllByText("Template pesan").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Kembali" })).toHaveAttribute(
      "href",
      "/w/A/message-templates",
    );
  });

  it("passes a reusable breadcrumb trail to the desktop page header", () => {
    render(
      <AppShell
        {...props}
        title="Kategori"
        panelBreadcrumbs={[
          { label: "Aster", href: "/w/A" },
          { label: "Layanan", href: "/w/A/services" },
          { label: "Kategori" },
        ]}
      >
        <p>isi</p>
      </AppShell>,
    );

    expect(screen.getAllByRole("link", { name: "Layanan" })[0]).toHaveAttribute(
      "href",
      "/w/A/services",
    );
  });

  it("uses mobileSubtitle for the mobile header and falls back to subtitle", () => {
    const { rerender } = render(
      <AppShell {...props} subtitle="Ringkasan desktop" mobileSubtitle="Ringkasan ponsel">
        <p>isi</p>
      </AppShell>,
    );

    expect(screen.getByText("Ringkasan ponsel")).toBeInTheDocument();

    rerender(
      <AppShell {...props} subtitle="Ringkasan desktop">
        <p>isi</p>
      </AppShell>,
    );
    expect(screen.getAllByText("Ringkasan desktop")).toHaveLength(2);
  });
});
