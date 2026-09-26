import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "./workspace-context";
import type { WorkspaceContext, WorkspaceId } from "./workspace-context.types";

type ProjectId = string & { readonly __brand: "ProjectId" };
const RAW = "3f2b8c1e-5d4a-4e6b-9c7d-2a1b0c9d8e7f";

function fixtureScopedQuery(ctx: WorkspaceContext): WorkspaceId {
  return ctx.workspaceId;
}

// Checked by `pnpm typecheck`; never called.
export function typeOnlyChecks(): void {
  // @ts-expect-error a plain string is not a WorkspaceId
  fixtureScopedQuery({ workspaceId: RAW });
  // @ts-expect-error another branded ID is not a WorkspaceId
  fixtureScopedQuery({ workspaceId: RAW as ProjectId });
  // @ts-expect-error owner-scoped functions require a WorkspaceContext
  fixtureScopedQuery();
}

describe("WorkspaceId / WorkspaceContext", () => {
  it("accepts a UUID and rejects anything else", () => {
    expect(asWorkspaceId(RAW)).toBe(RAW);
    expect(() => asWorkspaceId("not-a-uuid")).toThrow("Invalid WorkspaceId");
  });

  it("AC-FND-008 owner-scoped code only accepts a verified WorkspaceContext", () => {
    const id = asWorkspaceId(RAW);
    expect(fixtureScopedQuery({ workspaceId: id })).toBe(id);
    expect(typeof typeOnlyChecks).toBe("function");
  });
});
