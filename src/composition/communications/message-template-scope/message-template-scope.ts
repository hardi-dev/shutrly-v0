import "server-only";

import { createDrizzleMessageTemplateRepository } from "@/adapters/db/message-template-repository/drizzle-message-template-repository";
import { createDrizzleWorkspaceRepository } from "@/adapters/db/workspace-repository/drizzle-workspace-repository";

import { withRequestDb } from "../../request-db/request-db";
import type { MessageTemplateScope } from "./message-template-scope.types";

/**
 * Runs message-template work with request-scoped repositories (ADR-009).
 * @param work - the work over the template and workspace repositories
 * @returns the work result
 */
export function withMessageTemplateScope<T>(
  work: (scope: MessageTemplateScope) => Promise<T>,
): Promise<T> {
  return withRequestDb((db) =>
    work({
      templates: createDrizzleMessageTemplateRepository(db),
      workspaces: createDrizzleWorkspaceRepository(db),
    }),
  );
}
