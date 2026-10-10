import type { AccountDirectoryPort } from "@/features/auth/application/ports/account-directory/account-directory.port";
import type { AuthLink } from "@/features/auth/application/ports/auth-email/auth-email.port";
import type { IdentityPort } from "@/features/auth/application/ports/identity/identity.port";
import type { LinkRegistryPort } from "@/features/auth/application/ports/link-registry/link-registry.port";
import type { AppLocale } from "@/shared/locale/locale.types";

import type { AuthEnv, CreateAuthDeps } from "../create-auth/create-auth.types";

export interface BetterAuthIdentityDeps {
  database: CreateAuthDeps["database"];
  env: AuthEnv;
  accounts: AccountDirectoryPort;
  links: LinkRegistryPort;
  /** The request's resolved locale; every email this adapter issues carries it (D-17). */
  locale: AppLocale;
  onLink: (link: AuthLink) => void;
}

export interface BetterAuthIdentity {
  identity: IdentityPort;
  /** Better Auth's own endpoints, including the Google callback (`/api/auth/*`). */
  handler: (request: Request) => Promise<Response>;
}
