import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { deriveSetupChecklist } from "@/features/workspace/domain/setup-checklist/setup-checklist";

import { DashboardScreen } from "./dashboard-screen";

describe("DashboardScreen copy", () => {
  it("AC-SETUP-001 shows the setup checklist instead of the branding prompt", () => {
    const checklist = deriveSetupChecklist({
      hasProject: false,
      activeServiceCount: 0,
      soleActiveServiceId: null,
      hasSelectionItem: false,
      hasBrandName: false,
    });
    renderInLocale(
      <DashboardScreen workspaceId="ws-1" workspaceName="Aster Wedding" checklist={checklist} />,
      "en",
    );
    expect(screen.getByRole("heading", { name: "Set up your workspace" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Set up branding" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Welcome to Aster Wedding" }),
    ).not.toBeInTheDocument();
  });

  it("AC-SETUP-002 keeps today's placeholder once the workspace has a project", () => {
    renderInLocale(
      <DashboardScreen workspaceId="ws-1" workspaceName="Aster Wedding" checklist={null} />,
      "en",
    );
    expect(
      screen.queryByRole("heading", { name: "Set up your workspace" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Set up branding" })).toBeInTheDocument();
  });

  it("AC-L10N-002 renders the empty workspace dashboard in English", () => {
    renderInLocale(
      <DashboardScreen workspaceId="ws-1" workspaceName="Aster Wedding" checklist={null} />,
      "en",
    );
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
    renderInLocale(
      <DashboardScreen workspaceId="ws-1" workspaceName="Aster Wedding" checklist={null} />,
      "id",
    );
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
