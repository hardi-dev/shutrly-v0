import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";

export interface AuthErrorAlertProps {
  code: AuthErrorCode;
}
