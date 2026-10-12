import { describe, expect, it } from "vitest";

import {
  dashboardTrail,
  ownerTrail,
  projectCrumb,
  sectionCrumb,
  staticOwnerTrail,
} from "./owner-trail";

describe("owner trail (F-22 R-1…R-5)", () => {
  it("AC-CRUMB-001 the Dashboard is the single crumb Dasbor", () => {
    expect(dashboardTrail()).toEqual([{ label: "Dasbor" }]);
  });

  it("puts the workspace root first, then the ancestors, then the current page", () => {
    expect(
      ownerTrail({
        workspaceId: "A",
        workspaceName: "Aster",
        ancestors: [sectionCrumb("A", "projects"), projectCrumb("A", "p1", "Rina & Dimas")],
        current: "Galeri",
      }),
    ).toEqual([
      { label: "Aster", href: "/w/A" },
      { label: "Proyek", href: "/w/A/projects" },
      { label: "Rina & Dimas", href: "/w/A/projects/p1" },
      { label: "Galeri" },
    ]);
  });

  it("AC-CRUMB-002 gives each section Aster › section", () => {
    const cases: [string, string][] = [
      ["projects", "Proyek"],
      ["clients", "Klien"],
      ["team", "Tim"],
      ["services", "Layanan"],
      ["message-templates", "Template pesan"],
      ["photo-sources", "Sumber foto"],
      ["settings", "Pengaturan"],
      ["invoices", "Invoice"],
      ["search", "Pencarian"],
      ["notifications", "Notifikasi"],
    ];
    for (const [segment, label] of cases) {
      expect(staticOwnerTrail([segment], "A", "Aster")).toEqual([
        { label: "Aster", href: "/w/A" },
        { label },
      ]);
    }
  });

  it("AC-CRUMB-003 adds one crumb for a tab route and for Proyek baru", () => {
    const cases: [string, string, string, string][] = [
      ["projects", "completed", "Proyek", "Selesai"],
      ["projects", "cancelled", "Proyek", "Dibatalkan"],
      ["projects", "new", "Proyek", "Proyek baru"],
      ["clients", "archived", "Klien", "Arsip"],
      ["team", "archived", "Tim", "Arsip"],
      ["team", "roles", "Tim", "Peran"],
      ["services", "categories", "Layanan", "Kategori"],
      ["services", "items", "Layanan", "Item paket"],
    ];
    for (const [section, sub, sectionLabel, label] of cases) {
      expect(staticOwnerTrail([section, sub], "A", "Aster")).toEqual([
        { label: "Aster", href: "/w/A" },
        { label: sectionLabel, href: `/w/A/${section}` },
        { label },
      ]);
    }
  });

  it("returns null for a path it does not know, so the route's notFound decides", () => {
    expect(staticOwnerTrail(["unknown"], "A", "Aster")).toBeNull();
    expect(staticOwnerTrail(["projects", "p1"], "A", "Aster")).toBeNull();
    expect(staticOwnerTrail(["constructor"], "A", "Aster")).toBeNull();
    expect(staticOwnerTrail([], "A", "Aster")).toBeNull();
  });
});
