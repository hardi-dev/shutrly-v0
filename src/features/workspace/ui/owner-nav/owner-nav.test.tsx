import { render, screen } from "@testing-library/react";
import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { OwnerNav, OwnerNavBottom, resolveActiveNav, resolvePageHeading } from "./owner-nav";

const t = copyTranslator("ownerNav");

describe("Owner navigation", () => {
  it("leaves Settings to the account menu", () => {
    render(<OwnerNavBottom workspaceId="workspace-1" pathname="/w/workspace-1" />);

    expect(screen.queryByRole("link", { name: "Pengaturan" })).toBeNull();
    expect(screen.getByRole("link", { name: "Templat pesan" })).toBeInTheDocument();
  });

  it("keeps the catalog group between primary and bottom navigation", () => {
    render(
      <>
        <OwnerNav workspaceId="workspace-1" pathname="/w/workspace-1/clients" />
        <OwnerNavBottom workspaceId="workspace-1" pathname="/w/workspace-1/settings" />
      </>,
    );

    expect(screen.getByText("Katalog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dasbor" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Klien" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Layanan" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Templat pesan" })).toBeInTheDocument();
  });

  it("AC-MSG-004 keeps Template pesan active on a template editor route", () => {
    const pathname = "/w/A/message-templates/gallery-share";
    render(
      <>
        <OwnerNav workspaceId="A" pathname={pathname} />
        <OwnerNavBottom workspaceId="A" pathname={pathname} />
      </>,
    );

    expect(screen.getByRole("link", { name: "Templat pesan" })).toHaveAttribute(
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
    [
      "/w/A",
      {
        title: "Dasbor",
        subtitle: "Pantau proyek aktif, sesi, dan hasil yang sudah dikirim.",
      },
    ],
    [
      "/w/A/clients",
      {
        title: "Klien",
        subtitle: "Simpan kontak klien agar bisa dipilih saat membuat proyek.",
        mobileSubtitle: "Klien yang memesan sesi foto.",
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
        subtitle: "Simpan kontak klien agar bisa dipilih saat membuat proyek.",
        mobileSubtitle: "Klien yang memesan sesi foto.",
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
      "/w/A/team",
      {
        title: "Tim",
        subtitle: "Catat siapa yang bertugas di tiap sesi dan perannya.",
        mobileSubtitle: "Anggota tim dan peran tiap sesi.",
        tabs: {
          label: t("teamTabsLabel"),
          tabs: [
            { label: "Aktif", href: "/w/A/team", isActive: true },
            { label: "Arsip", href: "/w/A/team/archived", isActive: false },
            { label: "Peran", href: "/w/A/team/roles", isActive: false },
          ],
        },
      },
    ],
    [
      "/w/A/team/archived",
      expect.objectContaining({
        tabs: expect.objectContaining({
          tabs: [
            expect.objectContaining({ label: "Aktif", isActive: false }),
            expect.objectContaining({ label: "Arsip", isActive: true }),
            expect.objectContaining({ label: "Peran", isActive: false }),
          ],
        }) as unknown,
      }),
    ],
    [
      "/w/A/team/roles",
      expect.objectContaining({
        tabs: expect.objectContaining({
          tabs: [
            expect.objectContaining({ label: "Aktif", isActive: false }),
            expect.objectContaining({ label: "Arsip", isActive: false }),
            expect.objectContaining({ label: "Peran", isActive: true }),
          ],
        }) as unknown,
      }),
    ],
    [
      "/w/A/services",
      {
        title: "Layanan",
        subtitle: t("servicesSubtitle"),
        breadcrumbs: [{ label: "Aster", href: "/w/A" }, { label: "Layanan" }],
        tabs: {
          label: t("servicesTabsLabel"),
          tabs: [
            { href: "/w/A/services", label: "Layanan", isActive: true },
            { href: "/w/A/services/categories", label: "Kategori", isActive: false },
            { href: "/w/A/services/items", label: "Isi paket", isActive: false },
          ],
        },
      },
    ],
    [
      "/w/A/services/items",
      {
        title: "Isi paket",
        subtitle: t("servicesSubtitle"),
        breadcrumbs: [
          { label: "Aster", href: "/w/A" },
          { label: "Layanan", href: "/w/A/services" },
          { label: "Isi paket" },
        ],
        tabs: {
          label: t("servicesTabsLabel"),
          tabs: [
            { href: "/w/A/services", label: "Layanan", isActive: false },
            { href: "/w/A/services/categories", label: "Kategori", isActive: false },
            { href: "/w/A/services/items", label: "Isi paket", isActive: true },
          ],
        },
      },
    ],
    ["/w/A/services/9b6e", { title: "Layanan", subtitle: t("servicesSubtitle") }],
    ["/w/A/search", { title: "Cari", subtitle: "Fitur ini belum tersedia." }],
    ["/w/A/notifications", { title: "Notifikasi", subtitle: "Fitur ini belum tersedia." }],
    [
      "/w/A/settings",
      {
        title: "Pengaturan",
        subtitle: "Atur nama merek, kontak, dan awalan nomor tagihan ruang kerja ini.",
      },
    ],
    ["/w/A/message-templates", { title: "Templat pesan", subtitle: t("messageTemplatesSubtitle") }],
    ["/w/A/photo-sources", { title: "Sumber foto", subtitle: t("photoSourcesSubtitle") }],
    ["/profile", null],
  ])("resolves %s", (pathname, heading) => {
    expect(resolvePageHeading(pathname, "A", "Aster", t)).toEqual(heading);
  });

  it("D-17 keeps the Tim nav item active on every team route", () => {
    render(<OwnerNav workspaceId="A" pathname="/w/A/team/roles" />);
    expect(screen.getByRole("link", { name: "Tim" })).toHaveAttribute("aria-current", "page");
  });

  it("builds the catalog hierarchy for service categories", () => {
    expect(resolvePageHeading("/w/A/services/categories", "A", "Aster", t)).toMatchObject({
      breadcrumbs: [
        { label: "Aster", href: "/w/A" },
        { label: "Layanan", href: "/w/A/services" },
        { label: "Kategori" },
      ],
    });
  });

  it("builds the catalog hierarchy for service items", () => {
    expect(resolvePageHeading("/w/A/services/items", "A", "Aster", t)).toMatchObject({
      breadcrumbs: [
        { label: "Aster", href: "/w/A" },
        { label: "Layanan", href: "/w/A/services" },
        { label: "Isi paket" },
      ],
    });
  });
});

describe("projects heading", () => {
  it("AC-PRJ-001 gives the list routes tabs with the active one marked", () => {
    const heading = resolvePageHeading("/w/ws/projects/completed", "ws", "Aster", t);
    const tabs = heading && "tabs" in heading ? (heading.tabs?.tabs ?? []) : [];
    expect(heading?.title).toBe("Proyek");
    expect(heading?.subtitle).toContain("pemotretan");
    expect(tabs.map((tab) => [tab.label, tab.isActive])).toEqual([
      ["Aktif", false],
      ["Selesai", true],
      ["Dibatalkan", false],
    ]);
  });

  it("AC-PRJ-007 gives Proyek baru and a detail no tabs", () => {
    expect(resolvePageHeading("/w/ws/projects/new", "ws", "Aster", t)).toEqual({ title: "Proyek" });
    expect(resolvePageHeading("/w/ws/projects/abc", "ws", "Aster", t)).toEqual({ title: "Proyek" });
  });
});
