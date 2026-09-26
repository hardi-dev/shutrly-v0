import type { AuthDeps } from "../../auth-deps/auth-deps.types";

export type SignInOutcome =
  | { kind: "OWNER"; path: string }
  | { kind: "RESTRICTED"; path: "/verify" }
  | { kind: "UNAVAILABLE"; path: "/account-unavailable" };

export type ContinueDeps = Pick<AuthDeps, "accounts" | "destination" | "requestId">;
