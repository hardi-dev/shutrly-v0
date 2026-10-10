import { useTranslations } from "next-intl";

import { Alert } from "@/ui/patterns/alert/alert";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { RESET_SENT_SCREEN_COPY_NAMESPACE } from "./reset-sent-screen.copy";

/**
 * Reset request sent (auth.pen DccPx / NkvJG): the same confirmation for every email (A-5).
 * @returns the screen content inside `AuthSplitLayout`
 */
export function ResetSentScreen() {
  const t = useTranslations(RESET_SENT_SCREEN_COPY_NAMESPACE);
  return (
    <>
      <AuthIntro title={t("title")} lead={t("lead")} />
      <Alert tone="info" title={t("alertTitle")} body={t("alertBody")} />
      <AuthTextLink href="/login">{t("back")}</AuthTextLink>
    </>
  );
}
