import { useTranslations } from "next-intl";

import { Alert } from "@/ui/patterns/alert/alert";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthTextLink } from "../auth-text-link/auth-text-link";
import { INVALID_RESET_LINK_SCREEN_COPY_NAMESPACE } from "./invalid-reset-link-screen.copy";

/**
 * Invalid reset link (auth.pen x5ds7 / Hf3VK): expired, used or superseded (AC-AUTH-018).
 * @returns the screen content inside `AuthSplitLayout`
 */
export function InvalidResetLinkScreen() {
  const t = useTranslations(INVALID_RESET_LINK_SCREEN_COPY_NAMESPACE);
  return (
    <>
      <AuthIntro title={t("title")} lead={t("lead")} />
      <Alert tone="danger" title={t("alertTitle")} body={t("alertBody")} />
      <AuthTextLink href="/forgot-password">{t("action")}</AuthTextLink>
      <AuthTextLink href="/login">{t("back")}</AuthTextLink>
    </>
  );
}
