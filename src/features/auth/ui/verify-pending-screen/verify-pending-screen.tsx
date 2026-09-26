import { Alert } from "@/ui/patterns/alert/alert";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { ResendVerification } from "../resend-verification/resend-verification";
import { VERIFY_PENDING_SCREEN_COPY as COPY } from "./verify-pending-screen.copy";
import type { VerifyScreenProps } from "./verify-pending-screen.types";

/**
 * Verification pending (auth.pen p3NbDB / TXoQI): the same text for every email (A-5),
 * with resend when the request identifies an email (SPEC GAP-3).
 * @param props - whether resend can work, and the resend action
 * @returns the screen content inside `AuthSplitLayout`
 */
export function VerifyPendingScreen({ canResend, resendAction }: Readonly<VerifyScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <Alert tone="info" title={COPY.alertTitle} body={COPY.alertBody} />
      {canResend ? <ResendVerification action={resendAction} /> : null}
      <AuthTextLink href="/login">{COPY.back}</AuthTextLink>
    </>
  );
}
