import "server-only";

import { and, eq, gt } from "drizzle-orm";

import type { AuthLinkKind } from "@/features/auth/application/ports/auth-email/auth-email.port";
import type { LinkRegistryPort } from "@/features/auth/application/ports/link-registry/link-registry.port";
import { asAuthUserId } from "@/features/auth/domain/account/account";
import { sha256Hex } from "@/shared/crypto/sha256-hex/sha256-hex";

import type { Db } from "../client/client.types";
import { authLatestLink } from "../schema/auth/auth";

/**
 * The latest-link registry (R-2): Better Auth 1.7 verification JWTs are reusable and older
 * reset tokens stay valid, so only the latest link per user and purpose is accepted, once (A-3).
 * @param db - the request-scoped Drizzle database
 * @param now - the clock, for tests
 * @returns the `LinkRegistryPort`
 */
export function createDrizzleLinkRegistry(
  db: Db,
  now: () => Date = () => new Date(),
): LinkRegistryPort {
  const current = async (purpose: AuthLinkKind, token: string) =>
    and(
      eq(authLatestLink.purpose, purpose),
      eq(authLatestLink.tokenHash, await sha256Hex(token)),
      gt(authLatestLink.expiresAt, now()),
    );
  return {
    async record({ userId, purpose, token, ttlSeconds }) {
      const tokenHash = await sha256Hex(token);
      const createdAt = now();
      const expiresAt = new Date(createdAt.getTime() + ttlSeconds * 1000);
      await db
        .insert(authLatestLink)
        .values({ userId, purpose, tokenHash, expiresAt, createdAt })
        .onConflictDoUpdate({
          target: [authLatestLink.userId, authLatestLink.purpose],
          set: { tokenHash, expiresAt, createdAt },
        });
    },
    // One DELETE … RETURNING, so two concurrent clicks cannot both succeed.
    async consume(purpose, token) {
      const rows = await db
        .delete(authLatestLink)
        .where(await current(purpose, token))
        .returning({ userId: authLatestLink.userId });
      const userId = rows.at(0)?.userId;
      return userId === undefined ? null : asAuthUserId(userId);
    },
    async isCurrent(purpose, token) {
      const rows = await db
        .select({ userId: authLatestLink.userId })
        .from(authLatestLink)
        .where(await current(purpose, token));
      return rows.length === 1;
    },
  };
}
