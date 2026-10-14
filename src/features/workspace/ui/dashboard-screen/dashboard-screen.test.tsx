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

  it("AC-DASH-002 shows the overview, not the checklist, once the workspace has a project", () => {
    renderInLocale(
      <DashboardScreen
        workspaceId="ws-1"
        workspaceName="Aster Wedding"
        checklist={null}
        overview={<p>Overview slot</p>}
      />,
      "en",
    );
    expect(screen.getByText("Overview slot")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Set up your workspace" }),
    ).not.toBeInTheDocument();
  });

  it("AC-DASH-001 renders no placeholder copy around the overview", () => {
    renderInLocale(
      <DashboardScreen
        workspaceId="ws-1"
        workspaceName="Aster Wedding"
        checklist={null}
        overview={<p>Overview slot</p>}
      />,
      "en",
    );
    expect(screen.queryByText("Set up this workspace’s brand details")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Set up branding" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Welcome to Aster Wedding" }),
    ).not.toBeInTheDocument();
  });
});
