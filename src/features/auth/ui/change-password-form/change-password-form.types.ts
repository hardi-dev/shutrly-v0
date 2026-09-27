import type { ChangePasswordInput } from "@/features/auth/application/use-cases/change-password/change-password.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface ChangePasswordFormProps {
  action: FormAction<ChangePasswordInput>;
  initialDone?: boolean;
}
