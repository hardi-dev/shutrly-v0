import { describe, expect, it } from "vitest";

import { deriveSetupChecklist } from "./setup-checklist";
import type { SetupChecklist, SetupFacts, SetupStepKey } from "./setup-checklist.types";

const SERVICE_ID = "11111111-1111-4111-8111-111111111111";

const NEW_WORKSPACE: SetupFacts = {
  hasProject: false,
  activeServiceCount: 0,
  soleActiveServiceId: null,
  hasSelectionItem: false,
  hasBrandName: false,
};

function stateMap(checklist: SetupChecklist | null) {
  if (!checklist) throw new Error("expected a checklist");
  return Object.fromEntries(checklist.steps.map((step) => [step.key, step.state]));
}

function stepOf(checklist: SetupChecklist | null, key: SetupStepKey) {
  const step = checklist?.steps.find((candidate) => candidate.key === key);
  if (!step) throw new Error(`missing step ${key}`);
  return step;
}

describe("deriveSetupChecklist", () => {
  it("AC-SETUP-001 makes step 1 current and locks steps 2–3 in a new workspace", () => {
    const checklist = deriveSetupChecklist(NEW_WORKSPACE);
    expect(stateMap(checklist)).toEqual({
      service: "current",
      packageItems: "locked",
      firstProject: "locked",
      brandName: "open",
    });
    expect(checklist?.doneCount).toBe(0);
    expect(checklist?.total).toBe(4);
    expect(checklist?.steps.map((step) => step.key)).toEqual([
      "service",
      "packageItems",
      "firstProject",
      "brandName",
    ]);
  });

  it("AC-SETUP-002 returns no checklist once the workspace has a project", () => {
    expect(deriveSetupChecklist({ ...NEW_WORKSPACE, hasProject: true })).toBeNull();
    expect(
      deriveSetupChecklist({
        hasProject: true,
        activeServiceCount: 1,
        soleActiveServiceId: SERVICE_ID,
        hasSelectionItem: true,
        hasBrandName: true,
      }),
    ).toBeNull();
  });

  it("AC-SETUP-006 marks step 1 done and makes step 2 current with one active service", () => {
    const checklist = deriveSetupChecklist({
      ...NEW_WORKSPACE,
      activeServiceCount: 1,
      soleActiveServiceId: SERVICE_ID,
    });
    expect(stateMap(checklist)).toEqual({
      service: "done",
      packageItems: "current",
      firstProject: "open",
      brandName: "open",
    });
    expect(checklist?.doneCount).toBe(1);
  });

  it("AC-SETUP-007 AC-SETUP-015 locks steps 2–3 again when no active service remains", () => {
    const checklist = deriveSetupChecklist({ ...NEW_WORKSPACE, hasBrandName: true });
    expect(stateMap(checklist)).toEqual({
      service: "current",
      packageItems: "locked",
      firstProject: "locked",
      brandName: "done",
    });
  });

  it("AC-SETUP-010 targets the only active service's page for step 2", () => {
    const checklist = deriveSetupChecklist({
      ...NEW_WORKSPACE,
      activeServiceCount: 1,
      soleActiveServiceId: SERVICE_ID,
    });
    expect(stepOf(checklist, "packageItems").target).toEqual({
      kind: "service",
      serviceId: SERVICE_ID,
    });
  });

  it("AC-SETUP-011 targets the services list for step 2 with several active services", () => {
    const checklist = deriveSetupChecklist({ ...NEW_WORKSPACE, activeServiceCount: 2 });
    expect(stepOf(checklist, "packageItems").target).toEqual({ kind: "services" });
  });

  it("AC-SETUP-012 keeps step 3 open as a link to New project while step 2 is current", () => {
    const checklist = deriveSetupChecklist({
      ...NEW_WORKSPACE,
      activeServiceCount: 1,
      soleActiveServiceId: SERVICE_ID,
    });
    expect(stepOf(checklist, "firstProject")).toEqual({
      key: "firstProject",
      state: "open",
      target: { kind: "newProject" },
    });
  });

  it("AC-SETUP-014 follows the brand name and never locks step 4", () => {
    expect(stepOf(deriveSetupChecklist(NEW_WORKSPACE), "brandName")).toEqual({
      key: "brandName",
      state: "open",
      target: { kind: "settings" },
    });
    expect(
      stepOf(deriveSetupChecklist({ ...NEW_WORKSPACE, hasBrandName: true }), "brandName").state,
    ).toBe("done");
  });

  it("AC-SETUP-020 makes exactly one step current in every workspace without a project", () => {
    for (const activeServiceCount of [0, 1, 2]) {
      for (const hasSelectionItem of activeServiceCount > 0 ? [false, true] : [false]) {
        for (const hasBrandName of [false, true]) {
          const checklist = deriveSetupChecklist({
            hasProject: false,
            activeServiceCount,
            soleActiveServiceId: activeServiceCount === 1 ? SERVICE_ID : null,
            hasSelectionItem,
            hasBrandName,
          });
          const current = checklist?.steps.filter((step) => step.state === "current") ?? [];
          expect(current).toHaveLength(1);
        }
      }
    }
  });

  it("AC-SETUP-020 makes step 3 current once steps 1, 2 and 4 are done", () => {
    const checklist = deriveSetupChecklist({
      hasProject: false,
      activeServiceCount: 1,
      soleActiveServiceId: SERVICE_ID,
      hasSelectionItem: true,
      hasBrandName: true,
    });
    expect(stateMap(checklist)).toEqual({
      service: "done",
      packageItems: "done",
      firstProject: "current",
      brandName: "done",
    });
    expect(checklist?.doneCount).toBe(3);
  });
});
