import { z } from "zod";

import { CLIENT_SEARCH_MAX_LENGTH, searchClientDigits } from "./client-search";

/** A-4: a search over names (text) and numbers (digits); blank or over-long queries fail and the list is unfiltered. */
export const clientSearchSchema = z
  .string()
  .trim()
  .min(1)
  .max(CLIENT_SEARCH_MAX_LENGTH)
  .transform((text) => ({ text, digits: searchClientDigits(text) }));
