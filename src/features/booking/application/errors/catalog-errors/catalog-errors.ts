import "server-only";

import { DomainError } from "@/shared/errors/domain-error";

import type { CatalogErrorCode } from "./catalog-errors.types";

export class CatalogError extends DomainError {
  readonly code: CatalogErrorCode;

  constructor(code: CatalogErrorCode) {
    super(code);
    this.code = code;
  }
}
