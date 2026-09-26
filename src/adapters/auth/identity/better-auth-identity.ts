import "server-only";

import { APIError } from "better-auth/api";

import type { AuthLinkKind } from "@/features/auth/application/ports/auth-email/auth-email.port";
import type { IdentityPort } from "@/features/auth/application/ports/identity/identity.port";
import { asAuthUserId } from "@/features/auth/domain/account/account";

import { AUTH_TTL, createAuth } from "../create-auth/create-auth";
import type { Auth, IssuedToken } from "../create-auth/create-auth.types";
import { createGoogleClaimsGuard } from "../google-guard/google-guard";
import type { BetterAuthIdentity, BetterAuthIdentityDeps } from "./better-auth-identity.types";

const LINK_PATH: Record<AuthLinkKind, string> = {
  VERIFY_EMAIL: "/verify/confirm",
  RESET_PASSWORD: "/reset-password",
};
const LINK_TTL: Record<AuthLinkKind, number> = {
  VERIFY_EMAIL: AUTH_TTL.verifySeconds,
  RESET_PASSWORD: AUTH_TTL.resetSeconds,
};

function issueLinkToken(kind: AuthLinkKind, token: string): string {
  return kind === "VERIFY_EMAIL" ? `${token}.${crypto.randomUUID()}` : token;
}

function providerToken(token: string): string {
  const parts = token.split(".");
  return parts.length === 4 ? parts.slice(0, 3).join(".") : token;
}

// Better Auth refuses expected cases (bad password, bad token, no session) with APIError;
// those become "not ok". Anything else is unexpected and propagates.
async function attempt<T>(run: () => Promise<T>): Promise<T | null> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof APIError) return null;
    throw error;
  }
}

function sessionMethods(auth: Auth, deps: BetterAuthIdentityDeps) {
  return {
    async getSessionUserId(headers) {
      const current = await auth.api.getSession({ headers });
      return current ? asAuthUserId(current.user.id) : null;
    },
    async signInWithPassword({ email, password }, headers) {
      const body = { email, password };
      const result = await attempt(() =>
        auth.api.signInEmail({ body, headers, returnHeaders: true }),
      );
      if (!result) return { ok: false };
      const userId = asAuthUserId(result.response.user.id);
      return { ok: true, userId, setCookies: result.headers.getSetCookie() };
    },
    async signOut(headers) {
      const result = await attempt(() => auth.api.signOut({ headers, returnHeaders: true }));
      return { setCookies: result ? result.headers.getSetCookie() : [] };
    },
    async googleSignInUrl({ callbackURL, errorCallbackURL }) {
      const body = { provider: "google", callbackURL, errorCallbackURL, disableRedirect: true };
      const { headers, response } = await auth.api.signInSocial({ body, returnHeaders: true });
      if (!response.url) throw new Error("Better Auth returned no Google authorization URL");
      return { url: response.url, setCookies: headers.getSetCookie() };
    },
    async createPasswordUser({ name, email, password }) {
      const result = await attempt(() => auth.api.signUpEmail({ body: { name, email, password } }));
      if (!result) return { created: false };
      // With autoSignIn off, Better Auth answers an existing email with a synthetic user.
      return { created: (await deps.accounts.getById(asAuthUserId(result.user.id))) !== null };
    },
  } satisfies Partial<IdentityPort>;
}

function linkMethods(auth: Auth, deps: BetterAuthIdentityDeps) {
  return {
    async sendVerificationLink(email) {
      await auth.api.sendVerificationEmail({ body: { email } });
    },
    async verifyEmail(token) {
      const userId = await deps.links.consume("VERIFY_EMAIL", token);
      if (!userId) return { ok: false };
      const result = await attempt(() =>
        auth.api.verifyEmail({ query: { token: providerToken(token) }, returnHeaders: true }),
      );
      if (!result) return { ok: false };
      return { ok: true, userId, setCookies: result.headers.getSetCookie() };
    },
    async sendResetLink(email) {
      await auth.api.requestPasswordReset({ body: { email } });
    },
    isResetLinkUsable: (token) => deps.links.isCurrent("RESET_PASSWORD", token),
    async resetPassword({ token, newPassword }) {
      if (!(await deps.links.consume("RESET_PASSWORD", token))) return false;
      const body = { token, newPassword };
      return (await attempt(() => auth.api.resetPassword({ body }))) !== null;
    },
  } satisfies Partial<IdentityPort>;
}

function accountMethods(auth: Auth) {
  return {
    async changePassword({ currentPassword, newPassword }, headers) {
      const body = { currentPassword, newPassword, revokeOtherSessions: true };
      const result = await attempt(() =>
        auth.api.changePassword({ body, headers, returnHeaders: true }),
      );
      if (!result) return { ok: false };
      return { ok: true, setCookies: result.headers.getSetCookie() };
    },
    async updateName(name, headers) {
      await auth.api.updateUser({ body: { name }, headers });
    },
  } satisfies Partial<IdentityPort>;
}

/**
 * Better Auth behind `IdentityPort` (ADR-002), built per request over the request's database
 * (ADR-009). Every issued link is recorded in the latest-link registry before it is emailed.
 * @param deps - the database adapter, env, account directory, link registry and link sink
 * @returns the identity port and Better Auth's route handler
 */
export function createBetterAuthIdentity(deps: BetterAuthIdentityDeps): BetterAuthIdentity {
  const onToken = async ({ kind, user, token }: IssuedToken): Promise<void> => {
    const userId = asAuthUserId(user.id);
    const linkToken = issueLinkToken(kind, token);
    await deps.links.record({
      userId,
      purpose: kind,
      token: linkToken,
      ttlSeconds: LINK_TTL[kind],
    });
    const url = `${deps.env.BETTER_AUTH_URL}${LINK_PATH[kind]}?token=${encodeURIComponent(linkToken)}`;
    deps.onLink({ kind, to: user.email, name: user.name, url });
  };
  const onGoogleClaims = createGoogleClaimsGuard(deps.accounts);
  const auth = createAuth({ database: deps.database, env: deps.env, onToken, onGoogleClaims });
  const identity: IdentityPort = {
    ...sessionMethods(auth, deps),
    ...linkMethods(auth, deps),
    ...accountMethods(auth),
  };
  return { identity, handler: (request) => auth.handler(request) };
}
