import "server-only";

import { DomainError } from "@/shared/errors/domain-error";

import type { MessageTemplateErrorCode } from "./message-template-errors.types";

export class MessageTemplateError extends DomainError {
  readonly code: MessageTemplateErrorCode;

  /**
   * Creates a typed message-template failure; it never carries content (C-103).
   * @param code - the stable error code
   */
  constructor(code: MessageTemplateErrorCode) {
    super(code);
    this.code = code;
  }
}
