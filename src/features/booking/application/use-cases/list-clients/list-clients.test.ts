import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeClientRepository } from "../../../../../../tests/support/booking/fake-client-repository";
import { listClients } from "./list-clients";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;

describe("listClients", () => {
  it("AC-CLI-005 pages 65 clients thirty at a time", async () => {
    const repository = new FakeClientRepository();
    for (let index = 1; index <= 65; index += 1)
      await repository.create(context, {
        name: `Klien ${String(index).padStart(3, "0")}`,
        whatsappNumber: null,
        socialLinks: [],
        editorUserId: "user",
      });
    const first = await listClients(repository, context, {
      status: "ACTIVE",
      q: "",
      afterId: null,
    });
    const second = await listClients(repository, context, {
      status: "ACTIVE",
      q: "",
      afterId: first.nextCursor,
    });
    const third = await listClients(repository, context, {
      status: "ACTIVE",
      q: "",
      afterId: second.nextCursor,
    });
    expect([first.items.length, second.items.length, third.items.length]).toEqual([30, 30, 5]);
    expect(third.nextCursor).toBeNull();
  });

  it("AC-CLI-004 sends parsed search and ignores over-long q", async () => {
    const repository = new FakeClientRepository();
    await listClients(repository, context, { status: "ACTIVE", q: "0812 3456", afterId: null });
    expect(repository.lastListQuery?.search).toEqual({ text: "0812 3456", digits: "628123456" });
    await listClients(repository, context, { status: "ACTIVE", q: "a".repeat(101), afterId: null });
    expect(repository.lastListQuery?.search).toBeNull();
  });
});
