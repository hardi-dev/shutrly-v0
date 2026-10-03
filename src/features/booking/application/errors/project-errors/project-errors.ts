import "server-only";

import { DomainError } from "@/shared/errors/domain-error";

import type { ProjectErrorCode } from "./project-errors.types";

export class ProjectError extends DomainError {
  readonly code: ProjectErrorCode;

  constructor(code: ProjectErrorCode) {
    super(code);
    this.code = code;
  }
}
