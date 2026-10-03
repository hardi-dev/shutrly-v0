import { z } from "zod";

import { isRealIsoDate } from "../session/calendar-date";

const dateOrNullSchema = z
  .string()
  .nullable()
  .refine((value) => value === null || isRealIsoDate(value), "INVALID");

/** The dialog's values: `to` before `from` is reported on `to` and nothing is applied. */
export const filterFormSchema = z
  .object({
    statuses: z.array(z.string()),
    from: dateOrNullSchema,
    to: dateOrNullSchema,
    includeNoSchedule: z.boolean(),
    serviceIds: z.array(z.string()),
    clientId: z.string().nullable(),
  })
  .superRefine((value, context) => {
    if (value.from !== null && value.to !== null && value.to < value.from) {
      context.addIssue({ code: "custom", path: ["to"], message: "TO_BEFORE_FROM" });
    }
  });
