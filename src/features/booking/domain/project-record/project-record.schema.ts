import { z } from "zod";

import type { FormattingLocale } from "@/shared/locale/locale.types";

import { parseIdrAmount } from "../idr-amount/idr-amount";
import {
  fitsCancelReasonLength,
  fitsProjectNotesLength,
  fitsProjectTitleLength,
  trimToNull,
} from "./project-record";

/** BR-PRJ-008: the trimmed title, counted in code points. */
export const projectTitleSchema = z
  .string()
  .trim()
  .min(1, { error: "EMPTY" })
  .refine(fitsProjectTitleLength, { error: "TOO_LONG" });

/** BR-PRJ-008: trimmed notes; blank becomes null. */
export const projectNotesSchema = z
  .string()
  .nullable()
  .transform(trimToNull)
  .refine((notes) => notes === null || fitsProjectNotesLength(notes), { error: "TOO_LONG" });

/** Cancellation reason: trimmed; blank becomes null. */
export const cancelReasonSchema = z
  .string()
  .nullable()
  .transform(trimToNull)
  .refine((reason) => reason === null || fitsCancelReasonLength(reason), { error: "TOO_LONG" });

/**
 * BR-PRJ-008, ADR-007: the agreed price as whole-rupiah digits, typed in the given locale (D-19).
 * @param locale - the formatting locale the amount was typed in
 * @returns a schema that yields the digit string
 */
export const createAgreedPriceSchema = (locale: FormattingLocale) =>
  z.string().transform((raw, ctx) => {
    if (raw.trim().startsWith("-")) {
      ctx.addIssue({ code: "custom", message: "NEGATIVE" });
      return z.NEVER;
    }
    const parsed = parseIdrAmount(raw, locale);
    if (!parsed.ok) {
      ctx.addIssue({ code: "custom", message: parsed.problem });
      return z.NEVER;
    }
    return parsed.amount;
  });
