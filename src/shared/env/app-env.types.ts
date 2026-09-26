import type { z } from "zod";

import type { appEnvSchema } from "./app-env.schema";

export type AppEnv = z.infer<typeof appEnvSchema>;
