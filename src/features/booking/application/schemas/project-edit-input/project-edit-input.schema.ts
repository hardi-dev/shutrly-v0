import { z } from "zod";

import { packageValueInputSchema } from "../package-value-input/package-value-input.schema";

export const addItemInputSchema = z.object({
  definitionId: z.uuid({ error: "REQUIRED" }),
  value: packageValueInputSchema,
});

export const itemValueInputSchema = z.object({ value: packageValueInputSchema });

export const fieldValuesInputSchema = z.object({
  values: z.record(z.string(), z.union([z.string(), z.boolean(), z.null()])),
});
