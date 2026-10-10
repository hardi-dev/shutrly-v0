import type { PasswordHasherPort } from "../../ports/password-hasher/password-hasher.port";
import type { ClientGateDeps } from "../resolve-client-access/resolve-client-access.types";

export interface SignInGalleryDeps extends ClientGateDeps {
  readonly hasher: PasswordHasherPort;
  /** 32 random hex chars for the session id. */
  readonly newSessionId: () => string;
}

export interface SignInGalleryRequest {
  readonly token: string;
  readonly ip: string;
  readonly values: unknown;
}

export type SignInGalleryResult =
  | { readonly kind: "NEUTRAL" }
  | { readonly kind: "INVALID" }
  | { readonly kind: "WRONG_PASSWORD" }
  | { readonly kind: "TOO_MANY_ATTEMPTS"; readonly minutes: number }
  | { readonly kind: "SIGNED_IN"; readonly cookie: string; readonly maxAgeSeconds: number };

/** What the sign-in action returns to the form; on success it redirects instead (D-5). */
export type ClientSignInActionResult = Exclude<SignInGalleryResult, { readonly kind: "SIGNED_IN" }>;
