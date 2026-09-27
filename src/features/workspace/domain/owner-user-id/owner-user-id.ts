import { ownerUserIdSchema } from "./owner-user-id.schema";
import type { OwnerUserId } from "./owner-user-id.types";

/** Brands an opaque authenticated user ID for workspace ownership. @param raw - the authenticated user ID @returns the branded owner user ID */
export function asOwnerUserId(raw: string): OwnerUserId {
  return ownerUserIdSchema.parse(raw);
}
