import { z } from "zod";

export const clientFieldErrorKeySchema = z
  .enum([
    "EMPTY",
    "TOO_LONG",
    "INVALID",
    "TAKEN",
    "INVALID_URL",
    "DUPLICATE",
    "UNKNOWN_PLATFORM",
    "TOO_MANY",
  ])
  .catch("INVALID");
