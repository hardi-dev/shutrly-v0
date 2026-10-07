import { z } from "zod";

// F-20: the folder *Edit*'s mapping; a path left out stays proofs.
export const setFolderMappingSchema = z.object({
  mappings: z
    .array(z.object({ path: z.string().min(1).max(1000), projectItemId: z.uuid() }))
    .max(200),
});
