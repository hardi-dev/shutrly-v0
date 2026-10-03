import { z } from "zod";

import {
  normaliseWhatsappNumber,
  optionalWhatsappValue,
  WHATSAPP_NUMBER_PATTERN,
} from "./whatsapp-number";

/** BR-CLI-002: a typed number, normalised to the stored digits, or the issue `INVALID`. */
export const whatsappNumberSchema = z
  .string()
  .transform(normaliseWhatsappNumber)
  .pipe(z.string().regex(WHATSAPP_NUMBER_PATTERN, { error: "INVALID" }).brand<"WhatsappNumber">());

/** BR-CLI-002: the form field, where a blank (after removing separators) means no number. */
export const optionalWhatsappNumberSchema = z
  .string()
  .transform(optionalWhatsappValue)
  .pipe(whatsappNumberSchema.nullable());
