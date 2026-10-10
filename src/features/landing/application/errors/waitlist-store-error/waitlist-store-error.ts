import "server-only";

import { DomainError } from "@/shared/errors/domain-error";

/** The waitlist store refused or failed an add. Never carries the email (C-006, C-103). */
export class WaitlistStoreError extends DomainError {
  readonly code = "WAITLIST_STORE_FAILED";
  readonly status: number | undefined;

  /**
   * @param status - the provider's HTTP status, when there was a response
   */
  constructor(status?: number) {
    const suffix = status === undefined ? "" : ` (HTTP ${String(status)})`;
    super(`Waitlist store failed${suffix}`);
    this.status = status;
  }
}
