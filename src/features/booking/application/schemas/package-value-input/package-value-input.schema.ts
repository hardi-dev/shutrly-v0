import { z } from "zod";

export const packageValueInputSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("NUMBER"), value: z.string() }),
  z.object({ type: z.literal("RANGE"), min: z.string(), max: z.string() }),
]);
