import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "../auth-prompt/auth-prompt";
import { ForgotPasswordForm } from "../forgot-password-form/forgot-password-form";
import { FORGOT_PASSWORD_SCREEN_COPY as COPY } from "./forgot-password-screen.copy";
import type { ForgotPasswordScreenProps } from "./forgot-password-screen.types";

/**
 * Forgot password (auth.pen o9WtCo / e091S).
 * @param props - the forgot-password action
 * @returns the screen content inside `AuthSplitLayout`
 */
export function ForgotPasswordScreen({ action }: Readonly<ForgotPasswordScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <ForgotPasswordForm action={action} />
      <AuthPrompt prompt={COPY.switchPrompt} href="/login" link={COPY.back} />
    </>
  );
}
