import type { ResetPasswordInput } from "@/features/auth/application/use-cases/reset-password/reset-password.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface ResetPasswordFormProps {
  token: string;
  action: FormAction<ResetPasswordInput>;
}
