import { z } from "zod";

import { parseIdrAmount } from "@/features/booking/domain/idr-amount/idr-amount";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import { catalogNameSchema } from "../catalog-name/catalog-name.schema";

/**
 * The service form and its server check, with the amount typed in the given locale (C-004).
 * @param locale - the formatting locale the base price was typed in
 * @returns the service info schema
 */
export const createServiceInfoSchema = (locale: FormattingLocale) =>
  catalogNameSchema.extend({
    categoryId: z.uuid({ error: "CATEGORY_REQUIRED" }),
    basePrice: z.string().transform((value, context) => {
      const parsed = parseIdrAmount(value, locale);
      if (!parsed.ok) {
        context.addIssue({ code: "custom", message: parsed.problem });
        return z.NEVER;
      }
      return parsed.amount;
    }),
  });
