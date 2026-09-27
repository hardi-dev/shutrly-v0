import { describe, expect, it } from "vitest";

import { resolveOwnerDestination } from "./resolve-owner-destination";

describe("resolveOwnerDestination", () => {
  it("AC-WS-001 sends an owner with no workspaces to onboarding", async () => {
    await expect(
      resolveOwnerDestination({ countForOwner: () => Promise.resolve(0) }, "owner" as never),
    ).resolves.toBe("ONBOARDING");
  });

  it("AC-WS-008 sends an owner with workspaces to the workspace destination", async () => {
    await expect(
      resolveOwnerDestination({ countForOwner: () => Promise.resolve(1) }, "owner" as never),
    ).resolves.toBe("WORKSPACE");
  });
});
