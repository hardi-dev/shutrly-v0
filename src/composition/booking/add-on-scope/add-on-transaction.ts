import "server-only";

import { createDrizzleAddOnRepository } from "@/adapters/db/add-on-repository/drizzle-add-on-repository";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleSelectionRepository } from "@/adapters/db/selection-repository/drizzle-selection-repository";
import type { AddOnTargetFailure } from "@/features/booking/application/use-cases/add-on-results/add-on-results.types";

import type { AddOnScope } from "./add-on-scope.types";

// Scope-free: no request database or next/headers import, so the seed script can run add-on
// changes with its own `db` (D-13, D-14). The request-bound wrapper lives in add-on-scope.ts.

/** Carries a group refusal out of the transaction so the add-on's status change rolls back (D-16). */
export class AddOnRefusal extends Error {
  constructor(readonly failure: AddOnTargetFailure) {
    super("add-on change refused by its selection group");
  }
}

/** The transaction behind `withAddOnScope`, on a given database (tests and scripts use it directly). @param db - the database @param work - the change over transaction-bound repositories @returns the work result, or the refusal */
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
