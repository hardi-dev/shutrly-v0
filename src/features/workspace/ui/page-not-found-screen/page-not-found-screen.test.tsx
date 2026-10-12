import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PageNotFoundScreen } from "./page-not-found-screen";

const nav = vi.hoisted(() => ({ pathname: "/w/W/projects/x" }));

vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

describe("PageNotFoundScreen (AC-SFX-011, AC-SFX-012)", () => {
  beforeEach(() => {
    nav.pathname = "/w/W/projects/x";
  });

  it("says the page is missing and links back to its section in English", () => {
    renderInLocale(<PageNotFoundScreen />, "en");
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByText("This page doesn’t exist or was removed.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Projects" })).toHaveAttribute(
      "href",
      "/w/W/projects",
    );
  });

  it("says the page is missing and links back to its section in Indonesian", () => {
    renderInLocale(<PageNotFoundScreen />, "id");
    expect(screen.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeInTheDocument();
    expect(screen.getByText("Halaman ini tidak ada atau sudah dihapus.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke Proyek" })).toHaveAttribute(
      "href",
      "/w/W/projects",
    );
  });

  it("links to the dashboard when the path has no known section", () => {
    nav.pathname = "/w/W/unknown";
    renderInLocale(<PageNotFoundScreen />, "en");
    expect(screen.getByRole("link", { name: "Back to dashboard" })).toHaveAttribute("href", "/w/W");
  });

  it("never says the workspace was not found (AC-SFX-011)", () => {
    renderInLocale(<PageNotFoundScreen />, "en");
    expect(screen.queryByText("Workspace not found")).not.toBeInTheDocument();
  });
});
