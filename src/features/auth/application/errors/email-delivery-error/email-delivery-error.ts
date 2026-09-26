import "server-only";

import { DomainError } from "@/shared/errors/domain-error";

import type { AuthLinkKind } from "../../ports/auth-email/auth-email.port";

/** The email provider refused or failed a send. Never carries the link or recipient (C-103). */
export class EmailDeliveryError extends DomainError {
  readonly code = "EMAIL_DELIVERY_FAILED";
  readonly kind: AuthLinkKind;
  readonly status: number | undefined;

  /**
   * @param kind - which auth email failed
   * @param status - the provider's HTTP status, when there was a response
   */
  constructor(kind: AuthLinkKind, status?: number) {
    const suffix = status === undefined ? "" : `, HTTP ${String(status)}`;
    super(`Auth email delivery failed (${kind}${suffix})`);
    this.kind = kind;
    this.status = status;
  }
}
