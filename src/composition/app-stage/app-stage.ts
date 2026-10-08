import "server-only";

import { getScopedBindings } from "../request-context/request-context";
import { appStageSchema } from "./app-stage.schema";

/**
 * Whether this deployment serves only the landing page (ADR-021: `APP_STAGE=production` during
 * the development phase). An unreadable stage counts as production, so a misconfigured host
 * hides the app instead of exposing it.
 * @returns true on production or when the stage can't be read
 */
export async function isLandingOnly(): Promise<boolean> {
  const env = await getScopedBindings(appStageSchema).catch(() => null);
  return env === null || env.APP_STAGE === "production";
}
