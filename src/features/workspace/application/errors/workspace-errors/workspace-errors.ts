import "server-only";

import { DomainError } from "@/shared/errors/domain-error";

export type WorkspaceErrorCode =
  | "WORKSPACE_NOT_FOUND"
  | "DUPLICATE_NAME"
  | "ALREADY_HAS_WORKSPACE"
  | "NOT_FOUND"
  | "VALIDATION_FAILED";

export class WorkspaceError extends DomainError {
  readonly code: WorkspaceErrorCode;

  /** Creates a typed expected workspace failure. @param code - the stable workspace error code @returns a workspace domain error */
  constructor(code: WorkspaceErrorCode) {
    super(code);
    this.code = code;
  }
}
