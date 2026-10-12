import { useTranslations } from "next-intl";

import { Alert } from "@/ui/patterns/alert/alert";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { ResendVerification } from "../resend-verification/resend-verification";
import { VERIFY_PENDING_SCREEN_COPY_NAMESPACE } from "./verify-pending-screen.copy";
import type { VerifyScreenProps } from "./verify-pending-screen.types";

/**
 * Verification pending (auth.pen p3NbDB / TXoQI): the same text for every email (A-5),
 * with resend when the request identifies an email (SPEC GAP-3).
 * @param props - whether resend can work, and the resend action
 * @returns the screen content inside `AuthSplitLayout`
 */
export function VerifyPendingScreen({ canResend, resendAction }: Readonly<VerifyScreenProps>) {
  const t = useTranslations(VERIFY_PENDING_SCREEN_COPY_NAMESPACE);
  return (
    <>
      <AuthIntro title={t("title")} lead={t("lead")} />
      <Alert tone="info" title={t("alertTitle")} body={t("alertBody")} />
      {canResend ? <ResendVerification action={resendAction} /> : null}
      <AuthTextLink href="/login">{t("back")}</AuthTextLink>
    </>
  );
}
