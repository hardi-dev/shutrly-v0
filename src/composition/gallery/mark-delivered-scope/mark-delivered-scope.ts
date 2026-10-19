import "server-only";

import type { FinalDeliveryWriteResult } from "@/features/gallery/application/use-cases/record-final-delivery/record-final-delivery.types";

import { withRequestDb } from "../../request-db/request-db";
import type { MarkDeliveredTarget } from "./mark-delivered-scope.types";
import { runMarkDeliveredTransaction } from "./mark-delivered-transaction";

export {
  markDeliveredWithProject,
  runMarkDeliveredTransaction,
} from "./mark-delivered-transaction";

/** `runMarkDeliveredTransaction` on the request database. @param target - verified workspace, actor and project @returns undefined, or the refusal */
export function withMarkDeliveredScope(
  target: MarkDeliveredTarget,
): Promise<FinalDeliveryWriteResult> {
  return withRequestDb((db) => runMarkDeliveredTransaction(db, target));
}
