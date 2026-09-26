import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { SessionCookies } from "../../ports/identity/identity.port";
import type { SignInOutcome } from "../continue-after-sign-in/continue-after-sign-in.types";

export interface VerifiedSession extends SessionCookies {
  outcome: SignInOutcome;
}

export type VerifyEmailResult = AuthResult<VerifiedSession>;
