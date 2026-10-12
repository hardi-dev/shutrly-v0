import { screen, within } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { deriveSetupChecklist } from "@/features/workspace/domain/setup-checklist/setup-checklist";
import type { SetupFacts } from "@/features/workspace/domain/setup-checklist/setup-checklist.types";

import { SetupChecklist } from "./setup-checklist";

const NEW_WORKSPACE: SetupFacts = {
  hasProject: false,
  activeServiceCount: 0,
  soleActiveServiceId: null,
  hasSelectionItem: false,
  hasBrandName: false,
};

function renderChecklist(facts: SetupFacts, locale: "en" | "id" = "en") {
  const checklist = deriveSetupChecklist(facts);
  if (!checklist) throw new Error("expected a checklist");
  return renderInLocale(
    <SetupChecklist workspaceId="ws-1" workspaceName="Explore Studio" checklist={checklist} />,
    locale,
  );
}

describe("SetupChecklist", () => {
  it("AC-SETUP-001 lists the four steps in order with one action", () => {
    renderChecklist(NEW_WORKSPACE);
    expect(screen.getByRole("heading", { name: "Set up your workspace" })).toBeInTheDocument();
    expect(
      screen.getByText("Add a service first, then follow the recommended and optional steps."),
    ).toBeInTheDocument();
    expect(screen.getByText("0 of 4 done")).toBeInTheDocument();
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining("Add a service"),
      expect.stringContaining("Add package items"),
      expect.stringContaining("Create your first project"),
      expect.stringContaining("Set your brand name"),
    ]);
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/w/ws-1/services?add=service",
      "/w/ws-1/settings",
    ]);
  });

  it("AC-SETUP-006 AC-SETUP-020 moves the only button to step 2 once step 1 is done", () => {
    renderChecklist({ ...NEW_WORKSPACE, activeServiceCount: 1, soleActiveServiceId: "svc-1" });
    expect(screen.getByText("1 of 4 done")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Add package items" })).toHaveAttribute(
      "href",
      "/w/ws-1/services/svc-1",
    );
    expect(screen.getByRole("link", { name: "Create your first project" })).toHaveAttribute(
      "href",
      "/w/ws-1/projects/new",
    );
    expect(screen.queryByRole("link", { name: "Add service" })).not.toBeInTheDocument();
  });

  it("AC-SETUP-017 renders in Indonesian", () => {
    renderChecklist(NEW_WORKSPACE, "id");
    expect(screen.getByRole("heading", { name: "Siapkan ruang kerjamu" })).toBeInTheDocument();
    expect(screen.getByText("0 dari 4 selesai")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tambah layanan" })).toBeInTheDocument();
  });
});
