import "server-only";

import { createDrizzleItemDefinitionRepository } from "@/adapters/db/catalog-repository/drizzle-item-definition-repository";
import { createDrizzleMessageTemplateRepository } from "@/adapters/db/message-template-repository/drizzle-message-template-repository";
import { createDrizzleWorkspaceRepository } from "@/adapters/db/workspace-repository/drizzle-workspace-repository";
import { createDrizzleWorkspaceSourceRepository } from "@/adapters/db/workspace-source-repository/drizzle-workspace-source-repository";

import { withRequestDb } from "../../request-db/request-db";
import type { WorkspaceCreationScope } from "./workspace-creation-scope.types";

/**
 * Runs workspace creation and its default-template seeding in ONE transaction, so a failure
 * leaves neither behind (BR-MSG-005, AC-MSG-001, ADR-016).
 * @param work - the creation work over transaction-bound repositories
 * @returns the work result once the transaction commits
 */
export function withWorkspaceCreationScope<T>(
  work: (scope: WorkspaceCreationScope) => Promise<T>,
): Promise<T> {
  return withRequestDb((db) =>
    db.transaction((tx) =>
      work({
        repository: createDrizzleWorkspaceRepository(tx),
        templates: createDrizzleMessageTemplateRepository(tx),
        sources: createDrizzleWorkspaceSourceRepository(tx),
        itemDefinitions: createDrizzleItemDefinitionRepository(tx),
      }),
    ),
  );
}
