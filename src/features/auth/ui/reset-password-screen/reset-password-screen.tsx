import { useTranslations } from "next-intl";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "../auth-prompt/auth-prompt";
import { ResetPasswordForm } from "../reset-password-form/reset-password-form";
import { RESET_PASSWORD_SCREEN_COPY_NAMESPACE } from "./reset-password-screen.copy";
import type { ResetPasswordScreenProps } from "./reset-password-screen.types";

/**
 * Set new password (auth.pen RFaNT / vHZGg).
 * @param props - the link token and the reset action
 * @returns the screen content inside `AuthSplitLayout`
 */
export function ResetPasswordScreen({ token, action }: Readonly<ResetPasswordScreenProps>) {
  const t = useTranslations(RESET_PASSWORD_SCREEN_COPY_NAMESPACE);
  return (
    <>
      <AuthIntro title={t("title")} lead={t("lead")} />
      <ResetPasswordForm token={token} action={action} />
      <AuthPrompt prompt={t("switchPrompt")} href="/login" link={t("back")} />
    </>
  );
}
