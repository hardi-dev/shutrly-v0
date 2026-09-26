import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "../auth-prompt/auth-prompt";
import { GoogleButton } from "../google-button/google-button";
import { RegisterForm } from "../register-form/register-form";
import { REGISTER_SCREEN_COPY as COPY } from "./register-screen.copy";
import type { RegisterScreenProps } from "./register-screen.types";

/**
 * Register (auth.pen m3QGM / UryLp; field errors hTP6i / aIY0r).
 * @param props - the register and Google actions
 * @returns the screen content inside `AuthSplitLayout`
 */
export function RegisterScreen({ action, googleAction }: Readonly<RegisterScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <RegisterForm action={action} secondaryAction={<GoogleButton action={googleAction} />} />
      <AuthPrompt prompt={COPY.switchPrompt} href="/login" link={COPY.switchLink} />
    </>
  );
}
