import { z } from "zod";

import { fitsClientNameLength } from "./client-name";

/** BR-CLI-001: the trimmed name, counted in code points so emoji count once. */
export const clientNameSchema = z
  .string()
  .trim()
  .min(1, { error: "EMPTY" })
  .refine(fitsClientNameLength, { error: "TOO_LONG" });
