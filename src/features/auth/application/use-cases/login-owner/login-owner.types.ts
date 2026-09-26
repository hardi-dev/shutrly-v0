import type { z } from "zod";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { VerifiedSession } from "../verify-email/verify-email.types";
import type { loginOwnerSchema } from "./login-owner.schema";

export type LoginOwnerInput = z.input<typeof loginOwnerSchema>;

export type LoginOwnerResult = AuthResult<VerifiedSession>;
