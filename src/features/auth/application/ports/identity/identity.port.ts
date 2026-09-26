import "server-only";

import type { AuthUserId } from "@/features/auth/domain/account/account.types";
import type { NormalisedEmail } from "@/features/auth/domain/credentials/credentials.types";

/** Raw `Set-Cookie` values from Better Auth; the edge copies them onto the response. */
export interface SessionCookies {
  setCookies: string[];
}

export interface SignedIn extends SessionCookies {
  ok: true;
  userId: AuthUserId;
}

export interface Refused {
  ok: false;
}

export interface NewPasswordUser {
  name: string;
  email: NormalisedEmail;
  password: string;
}

export interface UserCreation {
  created: boolean;
}

export interface PasswordCredentials {
  email: NormalisedEmail;
  password: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordChanged extends SessionCookies {
  ok: true;
}

export interface GoogleRedirects {
  callbackURL: string;
  errorCallbackURL: string;
}

export interface GoogleStart extends SessionCookies {
  url: string;
}

/** Better Auth behind a port (ADR-002): credentials, sessions and email tokens. */
export interface IdentityPort {
  getSessionUserId: (headers: Headers) => Promise<AuthUserId | null>;
  /** Creates nothing for an existing email; `created` tells the caller which case it was. */
  createPasswordUser: (input: NewPasswordUser) => Promise<UserCreation>;
  /** Issues a new link that supersedes older ones; does nothing for a verified account. */
  sendVerificationLink: (email: NormalisedEmail) => Promise<void>;
  verifyEmail: (token: string) => Promise<SignedIn | Refused>;
  signInWithPassword: (input: PasswordCredentials, headers: Headers) => Promise<SignedIn | Refused>;
  signOut: (headers: Headers) => Promise<SessionCookies>;
  sendResetLink: (email: NormalisedEmail) => Promise<void>;
  isResetLinkUsable: (token: string) => Promise<boolean>;
  resetPassword: (input: PasswordReset) => Promise<boolean>;
  changePassword: (input: PasswordChange, headers: Headers) => Promise<PasswordChanged | Refused>;
  updateName: (name: string, headers: Headers) => Promise<void>;
  googleSignInUrl: (redirects: GoogleRedirects) => Promise<GoogleStart>;
}
