import { useTranslations } from "next-intl";

import { Button } from "@/ui/primitives/button/button";

import { GOOGLE_BUTTON_COPY_NAMESPACE } from "./google-button.copy";
import type { GoogleButtonProps } from "./google-button.types";

/**
 * "Continue with Google" as its own form, so it works without client JS and the OAuth state
 * cookie is set by the server (ADR-012).
 * @param props - the server action that starts Google sign-in
 * @returns the form with one secondary button
 */
export function GoogleButton({ action }: Readonly<GoogleButtonProps>) {
  const t = useTranslations(GOOGLE_BUTTON_COPY_NAMESPACE);
  return (
    <form action={action}>
      <Button type="submit" variant="secondary" size="lg" className="w-full">
        {t("label")}
      </Button>
    </form>
  );
}
