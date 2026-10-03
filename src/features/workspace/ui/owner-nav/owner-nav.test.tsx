import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OwnerNav, OwnerNavBottom, resolveActiveNav, resolvePageHeading } from "./owner-nav";
import { OWNER_NAV_COPY } from "./owner-nav.copy";

describe("Owner navigation", () => {
  it("keeps the catalog group between primary and bottom navigation", () => {
    render(
      <>
        <OwnerNav workspaceId="workspace-1" pathname="/w/workspace-1/clients" />
        <OwnerNavBottom workspaceId="workspace-1" pathname="/w/workspace-1/settings" />
      </>,
    );

    expect(screen.getByText("KATALOG")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dasbor" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Klien" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Layanan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Template pesan" })).toBeInTheDocument();
  });

  it("AC-MSG-004 keeps Template pesan active on a template editor route", () => {
    const pathname = "/w/A/message-templates/gallery-share";
    render(
      <>
        <OwnerNav workspaceId="A" pathname={pathname} />
        <OwnerNavBottom workspaceId="A" pathname={pathname} />
      </>,
    );

    expect(screen.getByRole("link", { name: "Template pesan" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Dasbor" })).not.toHaveAttribute("aria-current");
  });

  it("AC-SRC-004 exposes Sumber foto with the folder-open route", () => {
    render(<OwnerNavBottom workspaceId="ws" pathname="/w/ws/photo-sources" />);

    expect(screen.getByRole("link", { name: "Sumber foto" })).toHaveAttribute(
      "href",
      "/w/ws/photo-sources",
    );
    expect(screen.getByRole("link", { name: "Sumber foto" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("AC-CAT-003 keeps Layanan active on nested catalog routes", () => {
    render(<OwnerNav workspaceId="ws" pathname="/w/ws/services/9b6e" />);

    expect(screen.getByRole("link", { name: "Layanan" })).toHaveAttribute("aria-current", "page");
  });
});

describe("resolveActiveNav", () => {
  it.each([
    ["/w/A", "A", "dashboard", "dashboard"],
    ["/w/A/projects", "A", "projects", "projects"],
    ["/w/A/invoices", "A", "invoices", "invoices"],
    ["/w/A/clients", "A", "clients", "clients"],
    ["/w/A/clients/archived", "A", "clients", "clients"],
    ["/w/A/services", "A", "services", null],
    ["/w/A/settings", "A", "settings", null],
    ["/w/A/search", "A", null, null],
    ["/profile", "A", null, null],
  ])("resolves %s", (pathname, workspaceId, nav, tab) => {
    expect(resolveActiveNav(pathname, workspaceId)).toEqual({ nav, tab });
  });
});

describe("resolvePageHeading", () => {
  it.each([
    ["/w/A", { title: "Dasbor", subtitle: "Ringkasan workspace Aster." }],
    ["/w/A/projects", { title: "Proyek", subtitle: "Segera hadir." }],
    [
      "/w/A/clients",
      {
        title: "Klien",
        subtitle: "Orang yang memesan sesi foto. Pilih mereka saat membuat proyek.",
        mobileSubtitle: "Orang yang memesan sesi foto.",
        tabs: {
          label: "Status klien",
          tabs: [
            { label: "Aktif", href: "/w/A/clients", isActive: true },
            { label: "Arsip", href: "/w/A/clients/archived", isActive: false },
          ],
        },
      },
    ],
    [
      "/w/A/clients/archived",
      {
        title: "Klien",
        subtitle: "Orang yang memesan sesi foto. Pilih mereka saat membuat proyek.",
        mobileSubtitle: "Orang yang memesan sesi foto.",
        tabs: {
          label: "Status klien",
          tabs: [
            { label: "Aktif", href: "/w/A/clients", isActive: false },
            { label: "Arsip", href: "/w/A/clients/archived", isActive: true },
          ],
        },
      },
    ],
    [
      "/w/A/services",
      {
        title: "Layanan",
        subtitle: OWNER_NAV_COPY.servicesSubtitle,
        breadcrumbs: [{ label: "Aster", href: "/w/A" }, { label: "Layanan" }],
        tabs: {
          label: OWNER_NAV_COPY.servicesTabsLabel,
          tabs: [
            { href: "/w/A/services", label: "Layanan", isActive: true },
            { href: "/w/A/services/categories", label: "Kategori", isActive: false },
            { href: "/w/A/services/items", label: "Item paket", isActive: false },
          ],
        },
      },
    ],
    [
      "/w/A/services/items",
      {
        title: "Item paket",
        subtitle: OWNER_NAV_COPY.servicesSubtitle,
        breadcrumbs: [
          { label: "Aster", href: "/w/A" },
          { label: "Layanan", href: "/w/A/services" },
          { label: "Item paket" },
        ],
        tabs: {
          label: OWNER_NAV_COPY.servicesTabsLabel,
          tabs: [
            { href: "/w/A/services", label: "Layanan", isActive: false },
            { href: "/w/A/services/categories", label: "Kategori", isActive: false },
            { href: "/w/A/services/items", label: "Item paket", isActive: true },
          ],
        },
      },
    ],
    ["/w/A/services/9b6e", { title: "Layanan", subtitle: OWNER_NAV_COPY.servicesSubtitle }],
    ["/w/A/search", { title: "Pencarian", subtitle: "Segera hadir." }],
    ["/w/A/notifications", { title: "Notifikasi", subtitle: "Segera hadir." }],
    [
      "/w/A/settings",
      {
        title: "Pengaturan",
        subtitle: "Atur identitas brand, kontak, dan format invoice workspace ini.",
      },
    ],
    [
      "/w/A/message-templates",
      { title: "Template pesan", subtitle: OWNER_NAV_COPY.messageTemplatesSubtitle },
    ],
    ["/w/A/photo-sources", { title: "Sumber foto", subtitle: OWNER_NAV_COPY.photoSourcesSubtitle }],
    ["/profile", null],
  ])("resolves %s", (pathname, heading) => {
    expect(resolvePageHeading(pathname, "A", "Aster")).toEqual(heading);
  });

  it("builds the catalog hierarchy for service categories", () => {
    expect(resolvePageHeading("/w/A/services/categories", "A", "Aster")).toMatchObject({
      breadcrumbs: [
        { label: "Aster", href: "/w/A" },
        { label: "Layanan", href: "/w/A/services" },
        { label: "Kategori" },
      ],
    });
  });

  it("builds the catalog hierarchy for service items", () => {
    expect(resolvePageHeading("/w/A/services/items", "A", "Aster")).toMatchObject({
      breadcrumbs: [
        { label: "Aster", href: "/w/A" },
        { label: "Layanan", href: "/w/A/services" },
        { label: "Item paket" },
      ],
    });
  });
});
