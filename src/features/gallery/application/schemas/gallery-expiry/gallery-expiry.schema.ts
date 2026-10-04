import { z } from "zod";

import {
  GALLERY_EXPIRY_DAYS_MAX,
  GALLERY_EXPIRY_DAYS_MIN,
} from "@/features/gallery/domain/gallery-expiry/gallery-expiry";

// BR-GAL-005, A-4: no expiry, an end date, or a whole number of days.
export const galleryExpirySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("NONE") }),
  z.object({ type: z.literal("DATE"), date: z.iso.date("REQUIRED") }),
  z.object({
    type: z.literal("DAYS"),
    days: z
      .number("REQUIRED")
      .int("NOT_WHOLE")
      .min(GALLERY_EXPIRY_DAYS_MIN, "OUT_OF_RANGE")
      .max(GALLERY_EXPIRY_DAYS_MAX, "OUT_OF_RANGE"),
  }),
]);
