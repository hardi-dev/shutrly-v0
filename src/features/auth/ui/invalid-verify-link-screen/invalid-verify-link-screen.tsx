import { Alert } from "@/ui/patterns/alert/alert";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { ResendVerification } from "../resend-verification/resend-verification";
import type { VerifyScreenProps } from "../verify-pending-screen/verify-pending-screen.types";
import { INVALID_VERIFY_LINK_SCREEN_COPY as COPY } from "./invalid-verify-link-screen.copy";

/**
 * Invalid verification link (auth.pen TIvfA / ifV1Z). Without a session or pending cookie,
 * "request a new link" goes to login: an unverified sign-in gets a restricted session that can
 * resend.
 * @param props - whether resend can work, and the resend action
 * @returns the screen content inside `AuthSplitLayout`
 */
export function InvalidVerifyLinkScreen({ canResend, resendAction }: Readonly<VerifyScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <Alert tone="danger" title={COPY.alertTitle} body={COPY.alertBody} />
      {canResend ? (
        <ResendVerification action={resendAction} label={COPY.action} />
      ) : (
        <AuthTextLink href="/login">{COPY.action}</AuthTextLink>
      )}
      <AuthTextLink href="/login">{COPY.back}</AuthTextLink>
    </>
  );
}
