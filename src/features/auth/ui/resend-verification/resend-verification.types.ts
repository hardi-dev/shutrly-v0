import type { ResendVerificationResult } from "@/features/auth/application/use-cases/resend-verification/resend-verification.types";

export interface ResendVerificationProps {
  action: () => Promise<ResendVerificationResult>;
  /** The button text; the invalid-link screen reuses the control with its own label. */
  label?: string;
}

export interface CooldownProps {
  secondsLeft: number;
}
