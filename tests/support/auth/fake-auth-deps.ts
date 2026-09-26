import type { AuthDeps, RequestMeta } from "@/features/auth/application/auth-deps/auth-deps.types";
import { LinkOutbox } from "@/features/auth/application/link-outbox/link-outbox";
import type { OwnerDestination } from "@/features/auth/application/ports/workspace-destination/workspace-destination.port";

import { FakeAuthBackend } from "./fake-auth-backend";
import { InMemoryRateLimiter } from "./in-memory-rate-limiter";
import { RecordingEmailSender } from "./recording-email-sender";
import { uniqueIp } from "./unique";

export interface FakeAuth {
  deps: AuthDeps;
  backend: FakeAuthBackend;
  sender: RecordingEmailSender;
  /** Runs everything handed to `waitUntil`, like the Worker does after the response. */
  settle: () => Promise<void>;
}

/** Use-case dependencies over in-memory fakes; `destination` defaults to ONBOARDING. */
export function fakeAuthDeps(destination: OwnerDestination = "ONBOARDING"): FakeAuth {
  const sender = new RecordingEmailSender();
  const outbox = new LinkOutbox(sender, "test-request");
  const backend = new FakeAuthBackend((link) => {
    outbox.enqueue(link);
  });
  const background: Promise<unknown>[] = [];
  const deps: AuthDeps = {
    identity: backend.identity,
    accounts: backend.accounts,
    rateLimiter: new InMemoryRateLimiter(),
    outbox,
    destination: { resolve: () => Promise.resolve(destination) },
    waitUntil: (promise) => {
      background.push(promise);
    },
    requestId: "test-request",
  };
  const settle = async (): Promise<void> => {
    await Promise.allSettled(background.splice(0));
  };
  return { deps, backend, sender, settle };
}

/** Request metadata with a fresh IP, so rate-limit counters stay per test. */
export function meta(headers: Headers = new Headers()): RequestMeta {
  return { ip: uniqueIp(), headers };
}

/** The `token` query parameter of an emailed link. */
export function tokenFrom(url: string | undefined): string {
  if (!url) throw new Error("expected an emailed link");
  return new URL(url).searchParams.get("token") ?? "";
}
