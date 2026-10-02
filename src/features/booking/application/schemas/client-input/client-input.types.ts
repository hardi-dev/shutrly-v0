import type { z } from "zod";

import type { clientInputSchema } from "./client-input.schema";

/** The form values: raw strings, social rows in the Owner's order. */
export type ClientInput = z.input<typeof clientInputSchema>;
/** The stored fields: trimmed name, WhatsappNumber or null, links without blank rows. */
export type ClientFields = z.output<typeof clientInputSchema>;
