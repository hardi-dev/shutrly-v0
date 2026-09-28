import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OwnerNav, OwnerNavBottom, resolveActiveNav } from "./owner-nav";

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
