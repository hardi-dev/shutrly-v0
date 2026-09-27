import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";
import type { LoginOwnerInput } from "@/features/auth/application/use-cases/login-owner/login-owner.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface LoginScreenProps {
  action: FormAction<LoginOwnerInput>;
  googleAction: () => Promise<void>;
  initialError: AuthErrorCode | null;
}
