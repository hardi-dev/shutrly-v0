import { Button } from "@/ui/primitives/button/button";
import { Icon } from "@/ui/primitives/icon/icon";

import { GOOGLE_BUTTON_COPY } from "./google-button.copy";
import type { GoogleButtonProps } from "./google-button.types";

/**
 * "Continue with Google" as its own form, so it works without client JS and the OAuth state
 * cookie is set by the server (ADR-012).
 * @param props - the server action that starts Google sign-in
 * @returns the form with one secondary button
 */
export function GoogleButton({ action }: Readonly<GoogleButtonProps>) {
  return (
    <form action={action}>
      <Button type="submit" variant="secondary" size="lg" className="w-full">
        <Icon name="google" />
        {GOOGLE_BUTTON_COPY.label}
      </Button>
    </form>
  );
}
