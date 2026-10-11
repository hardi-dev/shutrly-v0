import "server-only";

import type {
  AccountRecord,
  AccountStatus,
  AuthUserId,
} from "@/features/auth/domain/account/account.types";
import type { NormalisedEmail } from "@/features/auth/domain/credentials/credentials.types";
import type { AppLocale } from "@/shared/locale/locale.types";

/** Reads and operator changes on the Better Auth `user` table (ADR-002). Not workspace data. */
export interface AccountDirectoryPort {
  findByEmail: (email: NormalisedEmail) => Promise<AccountRecord | null>;
  getById: (id: AuthUserId) => Promise<AccountRecord | null>;
  /** BR-AUTH-005: the status change and the session revocation commit together. */
  setStatusAndRevokeSessions: (id: AuthUserId, status: AccountStatus) => Promise<void>;
  revokeAllSessions: (id: AuthUserId) => Promise<void>;
  /** BR-L10N-001: changes only the given user's locale. */
  setLocale: (id: AuthUserId, locale: AppLocale) => Promise<void>;
  /** BR-AUTH-007: verify, delete the password and revoke every session, in one transaction. */
  applyGoogleTakeoverGuard: (id: AuthUserId) => Promise<void>;
}
