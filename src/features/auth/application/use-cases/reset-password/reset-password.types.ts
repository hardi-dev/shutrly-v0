import type { z } from "zod";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { resetPasswordSchema } from "./reset-password.schema";

export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;

export type ResetPasswordResult = AuthResult;
