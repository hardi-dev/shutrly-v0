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
});

describe("resolveActiveNav", () => {
  it.each([
    ["/w/A", "A", "dashboard", "dashboard"],
    ["/w/A/projects", "A", "projects", "projects"],
    ["/w/A/invoices", "A", "invoices", "invoices"],
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
    ["/w/A/services", { title: "Layanan", subtitle: "Segera hadir." }],
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
});
