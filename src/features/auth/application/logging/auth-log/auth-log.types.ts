import type { AuthUserId } from "@/features/auth/domain/account/account.types";

import type { AuthLinkKind } from "../../ports/auth-email/auth-email.port";

export type AuthOperation =
  | "register"
  | "verify-email"
  | "resend-verification"
  | "login"
  | "logout"
  | "forgot-password"
  | "reset-password"
  | "change-password"
  | "update-profile"
  | "google-sign-in"
  | "access-gate"
  | "email-send"
  | "operator-status";

export type AuthLogLevel = "info" | "warn" | "error";

export interface AuthLogEvent {
  operation: AuthOperation;
  outcome: string;
  requestId: string;
  userId?: AuthUserId;
  detail?: AuthLinkKind;
}
