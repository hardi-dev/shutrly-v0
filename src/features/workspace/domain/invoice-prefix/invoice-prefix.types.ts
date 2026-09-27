import type { z } from "zod";

import type { invoicePrefixSchema } from "./invoice-prefix.schema";

export type InvoicePrefix = z.infer<typeof invoicePrefixSchema>;
