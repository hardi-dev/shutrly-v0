import "server-only";

import { betterAuth } from "better-auth";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/features/auth/domain/credentials/credentials";

import type {
  AccountHookData,
  CreateAuthDeps,
  GoogleClaims,
  HookContext,
  TokenMail,
  TokenUser,
  UserHookData,
} from "./create-auth.types";

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

/** A-2 session lifetime and refresh; A-3 link lifetimes. */
export const AUTH_TTL = {
  sessionSeconds: 7 * DAY,
  sessionUpdateAgeSeconds: DAY,
  verifySeconds: DAY,
  resetSeconds: HOUR,
} as const;

function pickUser(user: TokenUser): TokenUser {
  return { id: user.id, email: user.email, name: user.name };
}

/**
 * True for Better Auth's OAuth callback requests, e.g. `/callback/google`.
 * @param ctx - the endpoint context Better Auth passes to database hooks, if any
 * @returns whether the hook runs inside a social sign-in callback
 */
export function isSocialCallback(ctx: HookContext | null): boolean {
  return ctx?.path?.startsWith("/callback/") ?? false;
}

function emailOptions({ onToken }: CreateAuthDeps) {
  return {
    emailAndPassword: {
      enabled: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      // Unverified users get a restricted session instead (BR-AUTH-003, AC-AUTH-009).
      requireEmailVerification: false,
      autoSignIn: false,
      resetPasswordTokenExpiresIn: AUTH_TTL.resetSeconds,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: ({ user, token }: TokenMail) =>
        onToken({ kind: "RESET_PASSWORD", user: pickUser(user), token }),
    },
    emailVerification: {
      sendOnSignUp: false,
      autoSignInAfterVerification: true,
      expiresIn: AUTH_TTL.verifySeconds,
      sendVerificationEmail: ({ user, token }: TokenMail) =>
        onToken({ kind: "VERIFY_EMAIL", user: pickUser(user), token }),
    },
  };
}

function googleOptions({ env, onGoogleClaims }: CreateAuthDeps) {
  return {
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        // Runs with the ID-token claims before Better Auth looks up the local user (BR-AUTH-007).
        mapProfileToUser: async (profile: GoogleClaims) => {
          await onGoogleClaims({ email: profile.email, email_verified: profile.email_verified });
          return {};
        },
      },
    },
    account: {
      // Google is deliberately not trusted, so Better Auth always requires Google's
      // email_verified before it links (BR-AUTH-006; ADR-012 wording, see plan decisions).
      accountLinking: { enabled: true, trustedProviders: [] },
      // Never refresh or store provider tokens on sign-in (ADR-012).
      updateAccountOnSignIn: false,
    },
  };
}

function databaseHooks() {
  const withoutTokens = {
    accessToken: null,
    refreshToken: null,
    idToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
  };
  return {
    user: {
      create: {
        before: (user: UserHookData, ctx: HookContext | null) =>
          // AC-AUTH-028: no account from an unverified Google email.
          Promise.resolve(
            isSocialCallback(ctx) && !user.emailVerified
              ? false
              : { data: { ...user, emailVerifiedAt: user.emailVerified ? new Date() : null } },
          ),
      },
      update: {
        before: (user: Partial<UserHookData>) =>
          Promise.resolve(
            user.emailVerified === true && !user.emailVerifiedAt
              ? { data: { ...user, emailVerifiedAt: new Date() } }
              : undefined,
          ),
      },
    },
    account: {
      create: {
        // ADR-012: keep the Google link, drop every provider token.
        before: (acc: AccountHookData) =>
          Promise.resolve(
            acc.providerId === "google" ? { data: { ...acc, ...withoutTokens } } : undefined,
          ),
      },
    },
  };
}

/**
 * Build Better Auth for one request. ADR-009 forbids sharing the Pool behind `database`
 * across requests, so this runs per request; only the options are fixed.
 * @param deps - the request's database adapter, the env, and the token and Google callbacks
 * @returns the Better Auth instance
 */
export function createAuth(deps: CreateAuthDeps) {
  return betterAuth({
    secret: deps.env.BETTER_AUTH_SECRET,
    baseURL: deps.env.BETTER_AUTH_URL,
    database: deps.database,
    // Auth limits are enforced by the application RateLimiterPort (ADR-013).
    rateLimit: { enabled: false },
    advanced: { ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] } },
    user: {
      additionalFields: {
        status: { type: "string", required: false, defaultValue: "ACTIVE", input: false },
        emailVerifiedAt: { type: "date", required: false, input: false },
      },
    },
    session: {
      expiresIn: AUTH_TTL.sessionSeconds,
      updateAge: AUTH_TTL.sessionUpdateAgeSeconds,
      // Status is read from the database on every request (AC-AUTH-014).
      cookieCache: { enabled: false },
    },
    ...emailOptions(deps),
    ...googleOptions(deps),
    databaseHooks: databaseHooks(),
  });
}
