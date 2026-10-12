import { useTranslations } from "next-intl";

import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "../auth-prompt/auth-prompt";
import { GoogleButton } from "../google-button/google-button";
import { RegisterForm } from "../register-form/register-form";
import { REGISTER_SCREEN_COPY_NAMESPACE } from "./register-screen.copy";
import type { RegisterScreenProps } from "./register-screen.types";

/**
 * Register (auth.pen m3QGM / UryLp; field errors hTP6i / aIY0r).
 * @param props - the register and Google actions
 * @returns the screen content inside `AuthSplitLayout`
 */
export function RegisterScreen({ action, googleAction }: Readonly<RegisterScreenProps>) {
  const t = useTranslations(REGISTER_SCREEN_COPY_NAMESPACE);
  return (
    <>
      <AuthIntro title={t("title")} lead={t("lead")} />
      <RegisterForm action={action} secondaryAction={<GoogleButton action={googleAction} />} />
      <AuthPrompt prompt={t("switchPrompt")} href="/login" link={t("switchLink")} />
    </>
  );
}
