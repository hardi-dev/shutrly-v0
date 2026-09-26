import type { z } from "zod";

import type { NormalisedEmail } from "@/features/auth/domain/credentials/credentials.types";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { registerOwnerSchema } from "./register-owner.schema";

export type RegisterOwnerInput = z.input<typeof registerOwnerSchema>;

export interface PendingRegistration {
  email: NormalisedEmail;
}

export type RegisterOwnerResult = AuthResult<PendingRegistration>;
