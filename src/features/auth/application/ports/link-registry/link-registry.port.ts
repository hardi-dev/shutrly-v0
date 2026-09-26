import "server-only";

import type { AuthUserId } from "@/features/auth/domain/account/account.types";

import type { AuthLinkKind } from "../auth-email/auth-email.port";

export interface IssuedLink {
  userId: AuthUserId;
  purpose: AuthLinkKind;
  token: string;
  ttlSeconds: number;
}

/** The latest link per user and purpose; single use, and a newer link supersedes it (A-3). */
export interface LinkRegistryPort {
  record: (link: IssuedLink) => Promise<void>;
  /** Deletes the link and returns its user when the token is current; null otherwise. */
  consume: (purpose: AuthLinkKind, token: string) => Promise<AuthUserId | null>;
  isCurrent: (purpose: AuthLinkKind, token: string) => Promise<boolean>;
}
