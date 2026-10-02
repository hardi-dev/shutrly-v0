import "server-only";

import { DomainError } from "@/shared/errors/domain-error";

import type { ClientErrorCode } from "./client-errors.types";

export class ClientError extends DomainError {
  readonly code: ClientErrorCode;

  constructor(code: ClientErrorCode) {
    super(code);
    this.code = code;
  }
}
