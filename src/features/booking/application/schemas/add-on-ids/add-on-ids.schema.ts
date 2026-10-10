import { z } from "zod";

export const addOnIdInputSchema = z.object({ addOnId: z.uuid() });
