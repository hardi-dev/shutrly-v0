import { Alert } from "@/ui/patterns/alert/alert";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { INVALID_RESET_LINK_SCREEN_COPY as COPY } from "./invalid-reset-link-screen.copy";

/**
 * Invalid reset link (auth.pen x5ds7 / Hf3VK): expired, used or superseded (AC-AUTH-018).
 * @returns the screen content inside `AuthSplitLayout`
 */
export function InvalidResetLinkScreen() {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <Alert tone="danger" title={COPY.alertTitle} body={COPY.alertBody} />
      <AuthTextLink href="/forgot-password">{COPY.action}</AuthTextLink>
      <AuthTextLink href="/login">{COPY.back}</AuthTextLink>
    </>
  );
}
