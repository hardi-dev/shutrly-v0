import type { AccountDirectoryPort } from "@/features/auth/application/ports/account-directory/account-directory.port";
import type { AuthLink } from "@/features/auth/application/ports/auth-email/auth-email.port";
import type { IdentityPort } from "@/features/auth/application/ports/identity/identity.port";
import type { LinkRegistryPort } from "@/features/auth/application/ports/link-registry/link-registry.port";

import type { AuthEnv, CreateAuthDeps } from "../create-auth/create-auth.types";

export interface BetterAuthIdentityDeps {
  database: CreateAuthDeps["database"];
  env: AuthEnv;
  accounts: AccountDirectoryPort;
  links: LinkRegistryPort;
  onLink: (link: AuthLink) => void;
}

export interface BetterAuthIdentity {
  identity: IdentityPort;
  /** Better Auth's own endpoints, including the Google callback (`/api/auth/*`). */
  handler: (request: Request) => Promise<Response>;
}
