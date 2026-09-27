import { describe, expect, it } from "vitest";

import { WorkspaceError } from "../../errors/workspace-errors/workspace-errors";
import { verifyWorkspace } from "./verify-workspace";

describe("verifyWorkspace", () => {
  it("AC-WS-012 rejects malformed and unowned IDs identically", async () => {
    const repository = { findForOwner: () => Promise.resolve(null) };
    await expect(verifyWorkspace(repository, "owner" as never, "bad")).rejects.toMatchObject({
      code: "WORKSPACE_NOT_FOUND",
    } satisfies Partial<WorkspaceError>);
  });
});
