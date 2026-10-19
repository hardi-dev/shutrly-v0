import "server-only";

import type { AddOnTargetFailure } from "@/features/booking/application/use-cases/add-on-results/add-on-results.types";

import { withRequestDb } from "../../request-db/request-db";
import type { AddOnScope } from "./add-on-scope.types";
import { runAddOnTransaction } from "./add-on-transaction";

export { AddOnRefusal, runAddOnTransaction } from "./add-on-transaction";

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
