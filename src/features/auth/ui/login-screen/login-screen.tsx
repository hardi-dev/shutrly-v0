import { AuthIntro } from "../auth-intro/auth-intro";
import { AuthPrompt } from "../auth-prompt/auth-prompt";
import { GoogleButton } from "../google-button/google-button";
import { LoginForm } from "../login-form/login-form";
import { LOGIN_SCREEN_COPY as COPY } from "./login-screen.copy";
import type { LoginScreenProps } from "./login-screen.types";

/**
 * Login (auth.pen amp4Y / IOC5i; error states q8b0R9, U9laqq, u9HFU).
 * @param props - the login and Google actions, and a Google error from the redirect
 * @returns the screen content inside `AuthSplitLayout`
 */
export function LoginScreen({ action, googleAction, initialError }: Readonly<LoginScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <LoginForm
        action={action}
        initialError={initialError}
        secondaryAction={<GoogleButton action={googleAction} />}
      />
      <AuthPrompt prompt={COPY.switchPrompt} href="/register" link={COPY.switchLink} />
    </>
  );
}
