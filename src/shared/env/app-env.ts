import { appEnvSchema } from "./app-env.schema";
import type { AppEnv } from "./app-env.types";

/**
 * Parse Worker bindings into the typed app environment, naming invalid keys but never their values.
 * @param raw - the bindings object from the Cloudflare context
 * @returns the validated environment, without unknown bindings
 */
export function parseAppEnv(raw: unknown): AppEnv {
  const result = appEnvSchema.safeParse(raw);
  if (!result.success) {
    // Key names only: issue messages or inputs could contain secret values (C-103).
    const keys = [...new Set(result.error.issues.map((issue) => issue.path.join(".") || "(root)"))];
    throw new Error(`Invalid environment: ${keys.join(", ")}`);
  }
  return result.data;
}
