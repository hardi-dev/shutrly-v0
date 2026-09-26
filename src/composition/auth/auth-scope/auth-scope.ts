import "server-only";

import { createBetterAuthIdentity } from "@/adapters/auth/identity/better-auth-identity";
import { createDrizzleAccountDirectory } from "@/adapters/db/account-directory/drizzle-account-directory";
import { createBetterAuthDatabase } from "@/adapters/db/better-auth-database/better-auth-database";
import { createDrizzleLinkRegistry } from "@/adapters/db/link-registry/drizzle-link-registry";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { createResendAuthEmailSender } from "@/adapters/email/auth-email-sender/resend-auth-email-sender";
import {
  createCapturingEmailSender,
  isEmailCaptureEnabled,
} from "@/adapters/email/capturing-email-sender/capturing-email-sender";
import { LinkOutbox } from "@/features/auth/application/link-outbox/link-outbox";
import type { AuthEmailPort } from "@/features/auth/application/ports/auth-email/auth-email.port";
import type { WorkspaceDestinationPort } from "@/features/auth/application/ports/workspace-destination/workspace-destination.port";
import type { AppEnv } from "@/shared/env/app-env.types";

import { withRequestDb } from "../../request-db/request-db";
import type { AuthScope } from "./auth-scope.types";

// SPEC GAP-2: F-02 replaces this stub with the real workspace resolver.
const onboardingUntilWorkspaceExists: WorkspaceDestinationPort = {
  resolve: () => Promise.resolve("ONBOARDING"),
};

function emailSender(env: AppEnv): AuthEmailPort {
  if (isEmailCaptureEnabled(env)) return createCapturingEmailSender();
  return createResendAuthEmailSender({ apiKey: env.RESEND_API_KEY, from: env.AUTH_EMAIL_FROM });
}

/**
 * Run `work` with request-scoped auth services over the request's database; the Pool is
 * closed after the work settles (ADR-009). The only place auth adapters meet their ports.
 * @param work - the auth work for this request
 * @returns whatever `work` resolves to
 */
export function withAuthScope<T>(work: (scope: AuthScope) => Promise<T>): Promise<T> {
  return withRequestDb((db, rc) => {
    const outbox = new LinkOutbox(emailSender(rc.env), rc.requestId);
    const accounts = createDrizzleAccountDirectory(db);
    const { identity, handler } = createBetterAuthIdentity({
      database: createBetterAuthDatabase(db),
      env: rc.env,
      accounts,
      links: createDrizzleLinkRegistry(db),
      onLink: (link) => {
        outbox.enqueue(link);
      },
    });
    return work({
      identity,
      accounts,
      rateLimiter: createNeonRateLimiter(db),
      outbox,
      destination: onboardingUntilWorkspaceExists,
      waitUntil: (promise) => {
        rc.waitUntil(promise);
      },
      requestId: rc.requestId,
      meta: { ip: rc.ip, headers: rc.headers },
      secret: rc.env.BETTER_AUTH_SECRET,
      handler,
    });
  });
}
