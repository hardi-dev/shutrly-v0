import "server-only";

import type { AppLocale } from "@/shared/locale/locale.types";

export type AuthLinkKind = "VERIFY_EMAIL" | "RESET_PASSWORD";

export interface AuthLink {
  kind: AuthLinkKind;
  to: string;
  name: string;
  url: string;
  /** The locale the request resolved; the email copy follows it (D-17). */
  locale: AppLocale;
}

/** Delivers one auth email. Throws `EmailDeliveryError` when the provider refuses it. */
export interface AuthEmailPort {
  send: (link: AuthLink) => Promise<void>;
}
