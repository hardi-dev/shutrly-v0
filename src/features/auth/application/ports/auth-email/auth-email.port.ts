import "server-only";

export type AuthLinkKind = "VERIFY_EMAIL" | "RESET_PASSWORD";

export interface AuthLink {
  kind: AuthLinkKind;
  to: string;
  name: string;
  url: string;
}

/** Delivers one auth email. Throws `EmailDeliveryError` when the provider refuses it. */
export interface AuthEmailPort {
  send: (link: AuthLink) => Promise<void>;
}
