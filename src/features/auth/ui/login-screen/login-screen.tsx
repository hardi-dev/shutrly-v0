import { useTranslations } from "next-intl";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "../auth-prompt/auth-prompt";
import { GoogleButton } from "../google-button/google-button";
import { LoginForm } from "../login-form/login-form";
import { LOGIN_SCREEN_COPY_NAMESPACE } from "./login-screen.copy";
import type { LoginScreenProps } from "./login-screen.types";

/**
 * Login (auth.pen amp4Y / IOC5i; error states q8b0R9, U9laqq, u9HFU).
 * @param props - the login and Google actions, and a Google error from the redirect
 * @returns the screen content inside `AuthSplitLayout`
 */
export function LoginScreen({ action, googleAction, initialError }: Readonly<LoginScreenProps>) {
  const t = useTranslations(LOGIN_SCREEN_COPY_NAMESPACE);
  return (
    <>
      <AuthIntro title={t("title")} lead={t("lead")} />
      <LoginForm
        action={action}
        initialError={initialError}
        secondaryAction={<GoogleButton action={googleAction} />}
      />
      <AuthPrompt prompt={t("switchPrompt")} href="/register" link={t("switchLink")} />
    </>
  );
}
