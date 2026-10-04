import "server-only";

import { DomainError } from "@/shared/errors/domain-error";

import type { GalleryErrorCode } from "./gallery-errors.types";

export class GalleryError extends DomainError {
  readonly code: GalleryErrorCode;

  constructor(code: GalleryErrorCode) {
    super(code);
    this.code = code;
  }
}
