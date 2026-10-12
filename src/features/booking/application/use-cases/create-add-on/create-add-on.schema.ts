import { z } from "zod";

import {
  ADD_ON_DESCRIPTION_MAX,
  ADD_ON_QUANTITY_MAX,
  addOnTotal,
  isAddOnTotalInRange,
} from "@/features/booking/domain/add-on/add-on";
import { createAgreedPriceSchema } from "@/features/booking/domain/project-record/project-record.schema";
import type { FormattingLocale } from "@/shared/locale/locale.types";

/** A-10: a whole number ≥ 1, typed as text in the form. */
const addOnQuantitySchema = z.union([z.string(), z.number()]).transform((raw, ctx) => {
  const text = String(raw).trim();
  if (text.length === 0) {
    ctx.addIssue({ code: "custom", message: "EMPTY" });
    return z.NEVER;
  }
  if (!/^-?\d+$/.test(text)) {
    ctx.addIssue({
      code: "custom",
      message: /^-?\d+[.,]\d+$/.test(text) ? "NOT_WHOLE" : "INVALID",
    });
    return z.NEVER;
  }
  const quantity = Number(text);
  if (quantity < 1) ctx.addIssue({ code: "custom", message: "TOO_SMALL" });
  if (quantity > ADD_ON_QUANTITY_MAX) ctx.addIssue({ code: "custom", message: "TOO_LARGE" });
  return quantity;
});

// The form and createAddOnAction share this schema (AC-ADD-006). Status, total, currency and
// project are never read from the browser (C-004).
export const createAddOnSchema = (locale: FormattingLocale) =>
  z
    .object({
      description: z.string().trim().min(1, "EMPTY").max(ADD_ON_DESCRIPTION_MAX, "TOO_LONG"),
      selectionGroupId: z
        .union([z.uuid({ error: "NOT_AN_OPTION" }), z.literal(""), z.null()])
        .optional()
        .transform((id) => id || null),
      quantity: addOnQuantitySchema,
      unitPrice: createAgreedPriceSchema(locale),
    })
    .superRefine((input, ctx) => {
      if (!isAddOnTotalInRange(addOnTotal(input.quantity, input.unitPrice))) {
        ctx.addIssue({ code: "custom", path: ["unitPrice"], message: "TOO_LARGE" });
      }
    });
