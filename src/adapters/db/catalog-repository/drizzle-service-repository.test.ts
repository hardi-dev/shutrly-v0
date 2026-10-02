import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { createDrizzleServiceRepository } from "./drizzle-service-repository";

describe("Drizzle service repository", () => {
  it("maps a project foreign-key violation to IN_USE", async () => {
    const db = {
      delete: () => ({
        where: () => ({
          returning: () => {
            const error = new Error("foreign key");
            Object.assign(error, { cause: { code: "23503" } });
            return Promise.reject(error);
          },
        }),
      }),
    } as unknown as DbExecutor;
    const repository = createDrizzleServiceRepository(db);
    const context = {
      workspaceId: "00000000-0000-4000-8000-000000000001",
    } as unknown as WorkspaceContext;

    await expect(repository.delete(context, "service-id")).resolves.toBe("IN_USE");
  });
});
