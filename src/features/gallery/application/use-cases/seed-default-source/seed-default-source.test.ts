import { FakeWorkspaceSourceRepository } from "@tests/support/gallery/fake-workspace-source-repository";
import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { seedDefaultSource } from "./seed-default-source";

describe("seedDefaultSource", () => {
  it("AC-SRC-001 is idempotent and creates one active Google Drive source", async () => {
    const repository = new FakeWorkspaceSourceRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await seedDefaultSource(repository, context);
    await seedDefaultSource(repository, context);

    expect(repository.rows).toHaveLength(1);
    expect(repository.rows[0]).toMatchObject({
      provider: "GOOGLE_DRIVE",
      displayName: "Google Drive",
      isActive: true,
      configData: {},
    });
  });
});
