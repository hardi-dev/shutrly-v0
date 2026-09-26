import type { z } from "zod";

import type { AuthResult } from "../../errors/auth-errors/auth-errors.types";
import type { SessionCookies } from "../../ports/identity/identity.port";
import type { changePasswordSchema } from "./change-password.schema";

export type ChangePasswordInput = z.input<typeof changePasswordSchema>;

export type ChangePasswordResult = AuthResult<SessionCookies>;
