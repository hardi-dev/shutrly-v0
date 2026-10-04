import "server-only";

import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";

import { withRequestDb } from "../../request-db/request-db";
import type { ProjectCancellationScope } from "./project-cancellation-scope.types";

/**
 * Runs cancelling a project and archiving its gallery in ONE transaction, so a failure in either
 * leaves neither changed (BR-PRJ-010, C-005, ADR-016, TD D-15). The repositories' own
 * transactions become savepoints inside it.
 * @param work - the work over transaction-bound repositories
 * @returns the work result once the transaction commits
 */
export function withProjectCancellationScope<T>(
  work: (scope: ProjectCancellationScope) => Promise<T>,
): Promise<T> {
  return withRequestDb((db) =>
    db.transaction((tx) =>
      work({
        projects: createDrizzleProjectRepository(tx),
        galleries: createDrizzleGallerySourceRepository(tx),
        now: new Date(),
      }),
    ),
  );
}
