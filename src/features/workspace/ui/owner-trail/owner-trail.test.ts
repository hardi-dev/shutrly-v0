import { describe, expect, it } from "vitest";

import type { OwnerNavTranslator } from "../owner-nav/owner-nav.types";
import {
  dashboardTrail,
  ownerTrail,
  projectCrumb,
  sectionCrumb,
  staticOwnerTrail,
} from "./owner-trail";

// The owner-nav messages (Indonesian) the trail reads; the translator stands in for next-intl.
const LABELS: Readonly<Record<string, string>> = {
  dashboard: "Dasbor",
  projects: "Proyek",
  clients: "Klien",
  team: "Tim",
  services: "Layanan",
  messageTemplates: "Templat pesan",
  photoSources: "Sumber foto",
  settings: "Pengaturan",
  invoices: "Tagihan",
  search: "Cari",
  notifications: "Notifikasi",
  create: "Proyek baru",
  projectTabCompleted: "Selesai",
  projectTabCancelled: "Dibatalkan",
  clientTabArchived: "Arsip",
  teamTabArchived: "Arsip",
  teamTabRoles: "Peran",
  serviceTabCategories: "Kategori",
  serviceTabItems: "Item paket",
};

const t = ((key: string) => LABELS[key] ?? key) as OwnerNavTranslator;

describe("owner trail (F-23 R-1…R-5)", () => {
  it("AC-CRUMB-001 the Dashboard is the single crumb Dasbor", () => {
    expect(dashboardTrail(t)).toEqual([{ label: "Dasbor" }]);
  });

  it("puts the workspace root first, then the ancestors, then the current page", () => {
    expect(
      ownerTrail({
        workspaceId: "A",
        workspaceName: "Aster",
        ancestors: [sectionCrumb("A", "projects", t), projectCrumb("A", "p1", "Rina & Dimas")],
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
      ["message-templates", "Templat pesan"],
      ["photo-sources", "Sumber foto"],
      ["settings", "Pengaturan"],
      ["invoices", "Tagihan"],
      ["search", "Cari"],
      ["notifications", "Notifikasi"],
    ];
    for (const [segment, label] of cases) {
      expect(staticOwnerTrail([segment], "A", "Aster", t)).toEqual([
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
      expect(staticOwnerTrail([section, sub], "A", "Aster", t)).toEqual([
        { label: "Aster", href: "/w/A" },
        { label: sectionLabel, href: `/w/A/${section}` },
        { label },
      ]);
    }
  });

  it("returns null for a path it does not know, so the route's notFound decides", () => {
    expect(staticOwnerTrail(["unknown"], "A", "Aster", t)).toBeNull();
    expect(staticOwnerTrail(["projects", "p1"], "A", "Aster", t)).toBeNull();
    expect(staticOwnerTrail(["constructor"], "A", "Aster", t)).toBeNull();
    expect(staticOwnerTrail([], "A", "Aster", t)).toBeNull();
  });
});
