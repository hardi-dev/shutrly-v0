import "server-only";

import type { WaitUntil } from "../auth-deps/auth-deps.types";
import { authLog } from "../logging/auth-log/auth-log";
import type { AuthEmailPort, AuthLink } from "../ports/auth-email/auth-email.port";
import type { DeliveryOutcome } from "./link-outbox.types";

/**
 * Collects the links produced during one request. The use case decides whether to await the
 * sends (resend, SPEC GAP-4) or hand them to `waitUntil` (register, forgot password; ADR-011).
 */
export class LinkOutbox {
  private readonly pending: AuthLink[] = [];
  private readonly sender: AuthEmailPort;
  private readonly requestId: string;

  /**
   * @param sender - the email port that delivers each link
   * @param requestId - logged with delivery failures
   */
  constructor(sender: AuthEmailPort, requestId: string) {
    this.sender = sender;
    this.requestId = requestId;
  }

  /**
   * Queue a link produced by the identity adapter.
   * @param link - the link and its recipient
   * @returns nothing
   */
  enqueue(link: AuthLink): void {
    this.pending.push(link);
  }

  /** The number of links not yet sent. */
  get pendingCount(): number {
    return this.pending.length;
  }

  /**
   * Send every queued link. A failed send is logged without its link and reported, not thrown.
   * @returns `SENT` when every send succeeded, otherwise `FAILED`
   */
  async flush(): Promise<DeliveryOutcome> {
    const links = this.pending.splice(0);
    const results = await Promise.allSettled(links.map((link) => this.sender.send(link)));
    const failed = links.filter((_, index) => results[index]?.status === "rejected");
    for (const link of failed) this.logFailure(link);
    return failed.length === 0 ? "SENT" : "FAILED";
  }

  /**
   * Send the queued links after the response, so response timing never depends on them.
   * @param waitUntil - the Worker's `waitUntil`
   * @returns nothing; does not schedule work when nothing is queued
   */
  flushInBackground(waitUntil: WaitUntil): void {
    if (this.pending.length === 0) return;
    waitUntil(this.flush());
  }

  private logFailure(link: AuthLink): void {
    const { requestId } = this;
    const event = { operation: "email-send", outcome: "DELIVERY_FAILED", requestId } as const;
    authLog({ ...event, detail: link.kind }, "error");
  }
}
