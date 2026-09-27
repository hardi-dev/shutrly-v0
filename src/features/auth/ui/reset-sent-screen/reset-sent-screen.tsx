import { Alert } from "@/ui/patterns/alert/alert";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { RESET_SENT_SCREEN_COPY as COPY } from "./reset-sent-screen.copy";

/**
 * Reset request sent (auth.pen DccPx / NkvJG): the same confirmation for every email (A-5).
 * @returns the screen content inside `AuthSplitLayout`
 */
export function ResetSentScreen() {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <Alert tone="info" title={COPY.alertTitle} body={COPY.alertBody} />
      <AuthTextLink href="/login">{COPY.back}</AuthTextLink>
    </>
  );
}
