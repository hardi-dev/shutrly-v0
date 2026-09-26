import { RecordingEmailSender } from "@tests/support/auth/recording-email-sender";
import { uniqueIp } from "@tests/support/auth/unique";

import { createBetterAuthIdentity } from "@/adapters/auth/identity/better-auth-identity";
import { createDrizzleAccountDirectory } from "@/adapters/db/account-directory/drizzle-account-directory";
import { createBetterAuthDatabase } from "@/adapters/db/better-auth-database/better-auth-database";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleLinkRegistry } from "@/adapters/db/link-registry/drizzle-link-registry";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import type { AuthDeps, RequestMeta } from "@/features/auth/application/auth-deps/auth-deps.types";
import { LinkOutbox } from "@/features/auth/application/link-outbox/link-outbox";
import { parseAppEnv } from "@/shared/env/app-env";
import type { AppEnv } from "@/shared/env/app-env.types";

import { openTestDb } from "../../helpers/test-db";

export interface AuthHarness {
  db: Db;
  env: AppEnv;
  deps: AuthDeps;
  sender: RecordingEmailSender;
  handler: (request: Request) => Promise<Response>;
  settle: () => Promise<void>;
  close: () => Promise<void>;
}

/** The real auth adapters over the shared non-production database (ADR-009). */
export async function openAuthHarness(): Promise<AuthHarness> {
  const { db, close } = await openTestDb();
  const env = parseAppEnv(process.env);
  const sender = new RecordingEmailSender();
  const outbox = new LinkOutbox(sender, "test-request");
  const accounts = createDrizzleAccountDirectory(db);
  const { identity, handler } = createBetterAuthIdentity({
    database: createBetterAuthDatabase(db),
    env,
    accounts,
    links: createDrizzleLinkRegistry(db),
    onLink: (link) => {
      outbox.enqueue(link);
    },
  });
  const background: Promise<unknown>[] = [];
  const deps: AuthDeps = {
    identity,
    accounts,
    rateLimiter: createNeonRateLimiter(db),
    outbox,
    destination: { resolve: () => Promise.resolve("ONBOARDING") },
    waitUntil: (promise) => {
      background.push(promise);
    },
    requestId: "test-request",
  };
  const settle = async (): Promise<void> => {
    await Promise.allSettled(background.splice(0));
  };
  return { db, env, deps, sender, handler, settle, close };
}

/** Request metadata with a fresh IP, so rate-limit counters stay per test. */
export function meta(headers: Headers = new Headers()): RequestMeta {
  return { ip: uniqueIp(), headers };
}

/** A `cookie` header carrying the given `Set-Cookie` values. */
export function cookieHeaders(setCookies: string[]): Headers {
  return new Headers({ cookie: setCookies.map((cookie) => cookie.split(";")[0]).join("; ") });
}
