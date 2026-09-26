import "server-only";

import type { OwnerDestination } from "../../ports/workspace-destination/workspace-destination.port";

/** SPEC GAP-2: the F-02 routes for each owner destination. */
export const DESTINATION_PATH: Record<OwnerDestination, string> = {
  ONBOARDING: "/onboarding/workspace",
  WORKSPACE: "/workspace",
};

/** The auth screens that the access gate and the Google hand-off send people to. */
export const AUTH_PATH = {
  login: "/login",
  verify: "/verify",
  unavailable: "/account-unavailable",
  googleContinue: "/auth/continue",
} as const;
