import type { ResendVerificationResult } from "@/features/auth/application/use-cases/resend-verification/resend-verification.types";

export interface VerifyScreenProps {
  /** A restricted session or a valid pending-email cookie identifies whom to resend to. */
  canResend: boolean;
  resendAction: () => Promise<ResendVerificationResult>;
}
