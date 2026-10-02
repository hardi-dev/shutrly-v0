import "server-only";

import { DomainError } from "@/shared/errors/domain-error";

import type { SourceConfigErrorCode } from "./source-config-errors.types";

export class SourceConfigError extends DomainError {
  readonly code: SourceConfigErrorCode;

  constructor(code: SourceConfigErrorCode) {
    super(code);
    this.code = code;
  }
}
