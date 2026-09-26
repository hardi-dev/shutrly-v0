import { z } from "zod";

// Worker bindings read per request. Features extend this object with their own keys.
export const appEnvSchema = z.object({
  DATABASE_URL: z.url(),
  APP_STAGE: z.enum(["development", "test", "production"]),
});
