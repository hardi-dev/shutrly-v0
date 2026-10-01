import { z } from "zod";

import { sourceNameSchema } from "../source-name/source-name.schema";

export const addSourceSchema = sourceNameSchema.extend({
  provider: z.literal("GOOGLE_DRIVE", { error: "PROVIDER_UNAVAILABLE" }),
});
