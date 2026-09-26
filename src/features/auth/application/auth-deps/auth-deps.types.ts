import type { LinkOutbox } from "../link-outbox/link-outbox";
import type { AccountDirectoryPort } from "../ports/account-directory/account-directory.port";
import type { IdentityPort } from "../ports/identity/identity.port";
import type { RateLimiterPort } from "../ports/rate-limiter/rate-limiter.port";
import type { WorkspaceDestinationPort } from "../ports/workspace-destination/workspace-destination.port";

export type WaitUntil = (promise: Promise<unknown>) => void;

/** Everything an auth use case needs, built per request by composition (ADR-009). */
export interface AuthDeps {
  identity: IdentityPort;
  accounts: AccountDirectoryPort;
  rateLimiter: RateLimiterPort;
  outbox: LinkOutbox;
  destination: WorkspaceDestinationPort;
  waitUntil: WaitUntil;
  requestId: string;
}

export interface RequestMeta {
  ip: string;
  headers: Headers;
}
