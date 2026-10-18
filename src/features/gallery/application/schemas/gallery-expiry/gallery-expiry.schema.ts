import { z } from "zod";

import { isExpiryPreset } from "@/features/gallery/domain/gallery-expiry/gallery-expiry";

// BR-GAL-005, A-1, A-4: no expiry, an end date, or a preset number of days.
export const galleryExpirySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("NONE") }),
  z.object({ type: z.literal("DATE"), date: z.iso.date("REQUIRED") }),
  z.object({
    type: z.literal("DAYS"),
    days: z.number("REQUIRED").int("NOT_WHOLE").refine(isExpiryPreset, "OUT_OF_RANGE"),
  }),
]);
