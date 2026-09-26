import type { z } from "zod";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { requestPasswordResetSchema } from "./request-password-reset.schema";

export type RequestPasswordResetInput = z.input<typeof requestPasswordResetSchema>;

export type RequestPasswordResetResult = AuthResult;
