import "server-only";

import { createDrizzleAddOnRepository } from "@/adapters/db/add-on-repository/drizzle-add-on-repository";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleSelectionRepository } from "@/adapters/db/selection-repository/drizzle-selection-repository";
import type { AddOnTargetFailure } from "@/features/booking/application/use-cases/add-on-results/add-on-results.types";

import { withRequestDb } from "../../request-db/request-db";
import type { AddOnScope } from "./add-on-scope.types";

/** Carries a group refusal out of the transaction so the add-on's status change rolls back (D-16). */
export class AddOnRefusal extends Error {
  constructor(readonly failure: AddOnTargetFailure) {
    super("add-on change refused by its selection group");
  }
}

/**
 * Runs an add-on approval or cancellation and its group-limit change in ONE transaction (ADR-016,
 * BR-ADD-004, TD D-16); lock order is add-on, then group. A refusal thrown as `AddOnRefusal`
 * rolls both back and is returned.
 * @param work - the change over transaction-bound repositories
 * @returns the work result, or the refusal
 */
export function withAddOnScope<T>(
  work: (scope: AddOnScope) => Promise<T>,
): Promise<T | AddOnTargetFailure> {
  return withRequestDb((db) => runAddOnTransaction(db, work));
}

/** The transaction behind `withAddOnScope`, on a given database (tests use it directly). @param db - the database @param work - the change over transaction-bound repositories @returns the work result, or the refusal */
export async function runAddOnTransaction<T>(
  db: Db,
  work: (scope: AddOnScope) => Promise<T>,
): Promise<T | AddOnTargetFailure> {
  try {
    return await db.transaction((tx) =>
      work({
        addOns: createDrizzleAddOnRepository(tx),
        selections: createDrizzleSelectionRepository(tx),
      }),
    );
  } catch (error) {
    if (error instanceof AddOnRefusal) return error.failure;
    throw error;
  }
}
