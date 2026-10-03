import { z } from "zod";

export const projectFieldErrorKeySchema = z
  .enum([
    "EMPTY",
    "TOO_LONG",
    "REQUIRED",
    "INVALID",
    "NEGATIVE",
    "NOT_WHOLE",
    "TOO_LARGE",
    "TOO_MANY_DECIMALS",
    "MIN_GREATER_THAN_MAX",
    "NOT_AN_OPTION",
    "END_WITHOUT_START",
    "END_NOT_AFTER_START",
    "SESSION_REQUIRED",
    "CLIENT_INACTIVE",
    "SERVICE_INACTIVE",
    "DEFINITION_INACTIVE",
    "DUPLICATE_DEFINITION",
    "REASON_REQUIRED",
    "TO_BEFORE_FROM",
  ])
  .catch("INVALID");
