import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeClientRepository } from "../../../../../../tests/support/booking/fake-client-repository";
import { addClient } from "./add-client";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("addClient", () => {
  it("AC-CLI-006 stores normalised data in row order with the editor", async () => {
    const repository = new FakeClientRepository();
    expect(
      await addClient(repository, context, "user-a", {
        name: "  Rina Wedding ",
        whatsappNumber: "0812-3456-7890",
        socialLinks: [
          { platform: "INSTAGRAM", value: "@rina.wed" },
          { platform: "TIKTOK", value: "https://www.tiktok.com/@rina" },
        ],
      }),
    ).toEqual({ ok: true });
    expect(repository.rows[0]).toMatchObject({
      name: "Rina Wedding",
      whatsappNumber: "6281234567890",
      updatedBy: "user-a",
      socialLinks: [
        { platform: "INSTAGRAM", value: "rina.wed" },
        { platform: "TIKTOK", value: "https://www.tiktok.com/@rina" },
      ],
    });
  });

  it("AC-CLI-007 accepts no number and blank social rows", async () => {
    const repository = new FakeClientRepository();
    await addClient(repository, context, "user", {
      name: "ade",
      whatsappNumber: "",
      socialLinks: [{ platform: "INSTAGRAM", value: "" }],
    });
    expect(repository.rows[0]).toMatchObject({ whatsappNumber: null, socialLinks: [] });
  });

  it("AC-CLI-008 AC-CLI-009 AC-CLI-011 returns field errors without storing", async () => {
    const repository = new FakeClientRepository();
    await expect(
      addClient(repository, context, "user", { name: "  ", whatsappNumber: "", socialLinks: [] }),
    ).resolves.toMatchObject({ fieldErrors: { name: "EMPTY" } });
    await expect(
      addClient(repository, context, "user", {
        name: "A",
        whatsappNumber: "0812",
        socialLinks: [],
      }),
    ).resolves.toMatchObject({ fieldErrors: { whatsappNumber: "INVALID" } });
    await expect(
      addClient(repository, context, "user", {
        name: "A",
        whatsappNumber: "",
        socialLinks: [{ platform: "MYSPACE", value: "x" }],
      }),
    ).resolves.toMatchObject({ fieldErrors: { "socialLinks.0.platform": "UNKNOWN_PLATFORM" } });
    expect(repository.rows).toHaveLength(0);
  });
});
