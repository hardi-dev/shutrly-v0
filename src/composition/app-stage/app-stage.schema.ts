import { z } from "zod";

// The one binding the production gate reads (ADR-021).
export const appStageSchema = z.object({
  APP_STAGE: z.enum(["development", "test", "production"]),
});
