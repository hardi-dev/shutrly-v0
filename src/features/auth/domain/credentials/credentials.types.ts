import type { z } from "zod";

import type { normalisedEmailSchema } from "./credentials.schema";

export type NormalisedEmail = z.infer<typeof normalisedEmailSchema>;

export type PasswordCheck = "OK" | "TOO_SHORT" | "TOO_LONG";
