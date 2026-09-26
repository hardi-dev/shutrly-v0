import type { NormalisedEmail } from "@/features/auth/domain/credentials/credentials.types";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";

/** The email to resend to, taken from the session or the pending-email cookie, never input. */
export interface ResendSubject {
  email: NormalisedEmail;
}

export type ResendVerificationResult = AuthResult;
