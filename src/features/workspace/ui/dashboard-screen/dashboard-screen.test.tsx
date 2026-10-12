import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { DashboardScreen } from "./dashboard-screen";

describe("DashboardScreen copy", () => {
  it("AC-L10N-002 renders the empty workspace dashboard in English", () => {
    renderInLocale(<DashboardScreen workspaceId="ws-1" workspaceName="Aster Wedding" />, "en");
    expect(screen.getByRole("heading", { name: "Welcome to Aster Wedding" })).toBeInTheDocument();
    expect(
      screen.getByText("Use the navigation to open your projects, clients or services."),
    ).toBeInTheDocument();
    expect(screen.getByText("Set up this workspace’s brand details")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Set up branding" })).toHaveAttribute(
      "href",
      "/w/ws-1/settings",
    );
  });

  it("AC-L10N-002 renders the empty workspace dashboard in Indonesian", () => {
    renderInLocale(<DashboardScreen workspaceId="ws-1" workspaceName="Aster Wedding" />, "id");
    expect(
      screen.getByRole("heading", { name: "Selamat datang di Aster Wedding" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Buka proyek, klien, atau layanan lewat navigasi."),
    ).toBeInTheDocument();
    expect(screen.getByText("Lengkapi identitas merek ruang kerja ini")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lengkapi identitas merek" })).toBeInTheDocument();
  });
});
