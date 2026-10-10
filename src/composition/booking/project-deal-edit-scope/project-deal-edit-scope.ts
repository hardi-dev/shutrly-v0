import "server-only";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { createDrizzleSelectionRepository } from "@/adapters/db/selection-repository/drizzle-selection-repository";
import type { ProjectFailure } from "@/features/booking/application/use-cases/project-results/project-results.types";

import { withRequestDb } from "../../request-db/request-db";
import type { ProjectDealEditScope } from "./project-deal-edit-scope.types";

/** Carries a group refusal out of the transaction so the item edit rolls back (D-10c). */
export class DealEditRefusal extends Error {
  constructor(readonly failure: ProjectFailure) {
    super("deal edit refused by its selection group");
  }
}

/**
 * Runs a package-item edit and its selection-group follow-up in ONE transaction (ADR-016,
 * TD D-10c): a refusal thrown as `DealEditRefusal` rolls both back and is returned.
 * @param work - the edit over transaction-bound repositories
 * @returns the work result, or the refusal
 */
export function withProjectDealEditScope<T>(
  work: (scope: ProjectDealEditScope) => Promise<T>,
): Promise<T | ProjectFailure> {
  return withRequestDb((db) => runDealEditTransaction(db, work));
}

/** The transaction behind `withProjectDealEditScope`, on a given database (tests use it directly). @param db - the database @param work - the edit over transaction-bound repositories @returns the work result, or the refusal */
export async function runDealEditTransaction<T>(
  db: Db,
  work: (scope: ProjectDealEditScope) => Promise<T>,
): Promise<T | ProjectFailure> {
  try {
    return await db.transaction((tx) =>
      work({
        projects: createDrizzleProjectRepository(tx),
        selections: createDrizzleSelectionRepository(tx),
      }),
    );
  } catch (error) {
    if (error instanceof DealEditRefusal) return error.failure;
    throw error;
  }
}
