import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { loadSetupChecklist } from "./load-setup-checklist";

const context = { workspaceId: asWorkspaceId("4f6c1a52-2f8e-4a0b-9d4e-8f1d2c3b4a5e") };

describe("loadSetupChecklist", () => {
  it("AC-SETUP-001 derives the checklist from the facts the reader returns", async () => {
    const reader = {
      read: () =>
        Promise.resolve({
          hasProject: false,
          activeServiceCount: 0,
          soleActiveServiceId: null,
          hasSelectionItem: false,
          hasBrandName: false,
        }),
    };
    const checklist = await loadSetupChecklist(reader, context);
    expect(checklist?.steps.map((step) => step.state)).toEqual([
      "current",
      "locked",
      "locked",
      "open",
    ]);
  });

  it("AC-SETUP-002 returns null once the workspace has a project", async () => {
    const reader = {
      read: () =>
        Promise.resolve({
          hasProject: true,
          activeServiceCount: 1,
          soleActiveServiceId: null,
          hasSelectionItem: false,
          hasBrandName: false,
        }),
    };
    expect(await loadSetupChecklist(reader, context)).toBeNull();
  });
});
