import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { checkAddOnTarget } from "./check-add-on-target";
import type { CheckAddOnTargetDeps } from "./check-add-on-target.types";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };

function deps(groups: { id: string; status: string }[]) {
  const listGroups = vi.fn(() => Promise.resolve(groups));
  return { selections: { listGroups } } as unknown as CheckAddOnTargetDeps;
}

describe("checkAddOnTarget (BR-ADD-002, A-10)", () => {
  it("AC-ADD-001 accepts an open or submitted group of the project", async () => {
    const d = deps([
      { id: "a", status: "OPEN" },
      { id: "b", status: "SUBMITTED" },
    ]);
    expect(await checkAddOnTarget(d, CONTEXT, "p", "a")).toBe("OK");
    expect(await checkAddOnTarget(d, CONTEXT, "p", "b")).toBe("OK");
  });

  it("AC-ADD-002 refuses a locked group and a group not in the project", async () => {
    const d = deps([{ id: "a", status: "LOCKED" }]);
    expect(await checkAddOnTarget(d, CONTEXT, "p", "a")).toBe("TARGET_LOCKED");
    expect(await checkAddOnTarget(d, CONTEXT, "p", "z")).toBe("TARGET_OTHER_PROJECT");
  });
});
