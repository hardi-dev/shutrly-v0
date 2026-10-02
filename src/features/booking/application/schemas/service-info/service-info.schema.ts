import { z } from "zod";

import { parseIdrAmount } from "@/features/booking/domain/idr-amount/idr-amount";

import { catalogNameSchema } from "../catalog-name/catalog-name.schema";

export const serviceInfoSchema = catalogNameSchema.extend({
  categoryId: z.uuid({ error: "CATEGORY_REQUIRED" }),
  basePrice: z.string().transform((value, context) => {
    const parsed = parseIdrAmount(value);
    if (!parsed.ok) {
      context.addIssue({ code: "custom", message: parsed.problem });
      return z.NEVER;
    }
    return parsed.amount;
  }),
});
