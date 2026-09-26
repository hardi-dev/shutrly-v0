import "server-only";

import type { SQL } from "drizzle-orm";
import { and, eq, sql } from "drizzle-orm";

import type { AccountDirectoryPort } from "@/features/auth/application/ports/account-directory/account-directory.port";
import { asAuthUserId, isAccountStatus } from "@/features/auth/domain/account/account";
import type { AccountRecord } from "@/features/auth/domain/account/account.types";
import { normaliseEmail } from "@/features/auth/domain/credentials/credentials";

import type { Db } from "../client/client.types";
import { account, session, user } from "../schema/auth/auth";

const CREDENTIAL = "credential";

async function loadAccount(db: Db, where: SQL): Promise<AccountRecord | null> {
  const rows = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      emailVerified: user.emailVerified,
    })
    .from(user)
    .where(where);
  const row = rows.at(0);
  if (!row) return null;
  // The CHECK constraint makes this unreachable; a failure means the schema drifted.
  if (!isAccountStatus(row.status)) throw new Error("user row has an unknown status");
  const credentials = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, row.id), eq(account.providerId, CREDENTIAL)));
  const { id, email, status, ...rest } = row;
  return {
    ...rest,
    id: asAuthUserId(id),
    email: normaliseEmail(email),
    status,
    hasPassword: credentials.length > 0,
  };
}

/**
 * The account directory over Better Auth's tables. Identity is not tenant data, so these reads
 * are keyed by the unique user ID or the unique lower-cased email (ADR-002, BR-AUTH-002).
 * @param db - the request-scoped Drizzle database
 * @returns the `AccountDirectoryPort`
 */
export function createDrizzleAccountDirectory(db: Db): AccountDirectoryPort {
  const revokeAll = async (id: string): Promise<void> => {
    await db.delete(session).where(eq(session.userId, id));
  };
  return {
    findByEmail: (email) => loadAccount(db, sql`lower(${user.email}) = ${email}`),
    getById: (id) => loadAccount(db, eq(user.id, id)),
    revokeAllSessions: revokeAll,
    async setStatusAndRevokeSessions(id, status) {
      await db.transaction(async (tx) => {
        await tx.update(user).set({ status, updatedAt: new Date() }).where(eq(user.id, id));
        await tx.delete(session).where(eq(session.userId, id));
      });
    },
    async applyGoogleTakeoverGuard(id) {
      const now = new Date();
      const isCredential = and(eq(account.userId, id), eq(account.providerId, CREDENTIAL));
      await db.transaction(async (tx) => {
        const verified = { emailVerified: true, emailVerifiedAt: now, updatedAt: now };
        await tx.update(user).set(verified).where(eq(user.id, id));
        await tx.delete(account).where(isCredential);
        await tx.delete(session).where(eq(session.userId, id));
      });
    },
  };
}
