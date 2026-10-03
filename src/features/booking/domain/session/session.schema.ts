import { z } from "zod";

import { isRealIsoDate } from "./calendar-date";
import {
  codePointCount,
  DATE_PATTERN,
  SESSION_LOCATION_MAX_LENGTH,
  SESSION_NAME_MAX_LENGTH,
  TIME_PATTERN,
} from "./session";

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable();

/** BR-TEAM-003: one session as the Owner types it. */
export const sessionInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "EMPTY")
      .refine((value) => codePointCount(value) <= SESSION_NAME_MAX_LENGTH, "TOO_LONG"),
    date: z
      .string()
      .min(1, "EMPTY")
      .regex(DATE_PATTERN, "INVALID")
      .refine(isRealIsoDate, "INVALID"),
    startTime: z.string().regex(TIME_PATTERN, "INVALID").nullable(),
    endTime: z.string().regex(TIME_PATTERN, "INVALID").nullable(),
    location: optionalTextSchema.refine(
      (value) => value === null || codePointCount(value) <= SESSION_LOCATION_MAX_LENGTH,
      "TOO_LONG",
    ),
  })
  .superRefine((session, ctx) => {
    if (session.endTime === null) return;
    if (session.startTime === null) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "END_WITHOUT_START" });
    } else if (session.endTime <= session.startTime) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "END_NOT_AFTER_START" });
    }
  });
