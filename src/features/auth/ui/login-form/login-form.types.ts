import type { ReactNode } from "react";

import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import type { LoginOwnerInput } from "@/features/auth/application/use-cases/login-owner/login-owner.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface LoginFormProps {
  action: FormAction<LoginOwnerInput>;
  /** A Google error from the `?error=` redirect, shown until the next submit. */
  initialError?: AuthErrorCode | null;
  secondaryAction?: ReactNode;
}
