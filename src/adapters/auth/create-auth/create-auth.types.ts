import type { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { AuthLinkKind } from "@/features/auth/application/ports/auth-email/auth-email.port";

import type { createAuth } from "./create-auth";

export interface AuthEnv {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

export interface TokenUser {
  id: string;
  email: string;
  name: string;
}

export interface TokenMail {
  user: TokenUser;
  token: string;
}

export interface IssuedToken {
  kind: AuthLinkKind;
  user: TokenUser;
  token: string;
}

export interface GoogleClaims {
  email: string;
  email_verified: boolean;
}

export interface UserHookData {
  emailVerified: boolean;
  emailVerifiedAt?: Date | null;
}

export interface AccountHookData {
  providerId: string;
}

export interface HookContext {
  path?: string;
}

export interface CreateAuthDeps {
  database: ReturnType<typeof drizzleAdapter>;
  env: AuthEnv;
  onToken: (issued: IssuedToken) => Promise<void>;
  onGoogleClaims: (claims: GoogleClaims) => Promise<void>;
}

export type Auth = ReturnType<typeof createAuth>;
