import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";

import { AuthIntro } from "../auth-intro/auth-intro";
import { ACCOUNT_UNAVAILABLE_SCREEN_COPY as COPY } from "./account-unavailable-screen.copy";
import type { AccountUnavailableScreenProps } from "./account-unavailable-screen.types";

/**
 * Account unavailable (auth.pen kXr5x / FFue5). Static on purpose: no owner data is rendered
 * (BR-AUTH-005, AC-AUTH-013).
 * @param props - the sign-out action
 * @returns the screen content inside `AuthSplitLayout`
 */
export function AccountUnavailableScreen({
  signOutAction,
}: Readonly<AccountUnavailableScreenProps>) {
  return (
    <>
      <AuthIntro title={COPY.title} lead={COPY.lead} />
      <Alert tone="danger" title={COPY.alertTitle} body={COPY.alertBody} />
      <form action={signOutAction}>
        <Button type="submit" variant="secondary" size="lg" className="w-full">
          {COPY.signOut}
        </Button>
      </form>
    </>
  );
}
