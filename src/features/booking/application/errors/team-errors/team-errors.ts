import "server-only";

import { DomainError } from "@/shared/errors/domain-error";

import type { TeamErrorCode } from "./team-errors.types";

export class TeamError extends DomainError {
  readonly code: TeamErrorCode;

  constructor(code: TeamErrorCode) {
    super(code);
    this.code = code;
  }
}
