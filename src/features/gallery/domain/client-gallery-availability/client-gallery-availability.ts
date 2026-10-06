import type { AvailabilityInput } from "./client-gallery-availability.types";

/**
 * Whether a client may open this gallery at all (BR-ACC-001, BR-GAL-005, BR-PRJ-010, A-3).
 * @param input - project status, stored gallery status, expiry and the clock
 * @returns true for a PUBLISHED, unexpired gallery of a project that isn't cancelled
 */
export function isAvailableToClient(input: AvailabilityInput): boolean {
  if (input.galleryStatus !== "PUBLISHED") return false;
  if (input.projectStatus === "CANCELLED") return false;
  return input.expiresAt === null || input.expiresAt.getTime() > input.now.getTime();
}
