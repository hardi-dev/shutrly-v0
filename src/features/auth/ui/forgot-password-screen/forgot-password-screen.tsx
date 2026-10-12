import { useTranslations } from "next-intl";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "../auth-prompt/auth-prompt";
import { ForgotPasswordForm } from "../forgot-password-form/forgot-password-form";
import { FORGOT_PASSWORD_SCREEN_COPY_NAMESPACE } from "./forgot-password-screen.copy";
import type { ForgotPasswordScreenProps } from "./forgot-password-screen.types";

/**
 * Forgot password (auth.pen o9WtCo / e091S).
 * @param props - the forgot-password action
 * @returns the screen content inside `AuthSplitLayout`
 */
export function ForgotPasswordScreen({ action }: Readonly<ForgotPasswordScreenProps>) {
  const t = useTranslations(FORGOT_PASSWORD_SCREEN_COPY_NAMESPACE);
  return (
    <>
      <AuthIntro title={t("title")} lead={t("lead")} />
      <ForgotPasswordForm action={action} />
      <AuthPrompt prompt={t("switchPrompt")} href="/login" link={t("back")} />
    </>
  );
}
