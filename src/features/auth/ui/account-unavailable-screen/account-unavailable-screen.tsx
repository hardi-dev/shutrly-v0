import { useTranslations } from "next-intl";

import { Alert } from "@/ui/patterns/alert/alert";
import { Button } from "@/ui/primitives/button/button";

import { AuthIntro } from "../auth-intro/auth-intro";
import { ACCOUNT_UNAVAILABLE_SCREEN_COPY_NAMESPACE } from "./account-unavailable-screen.copy";
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
  const t = useTranslations(ACCOUNT_UNAVAILABLE_SCREEN_COPY_NAMESPACE);
  return (
    <>
      <AuthIntro title={t("title")} lead={t("lead")} />
      <Alert tone="danger" title={t("alertTitle")} body={t("alertBody")} />
      <form action={signOutAction}>
        <Button type="submit" variant="secondary" size="lg" className="w-full">
          {t("signOut")}
        </Button>
      </form>
    </>
  );
}
