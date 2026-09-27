import type { RequestPasswordResetInput } from "@/features/auth/application/use-cases/request-password-reset/request-password-reset.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface ForgotPasswordScreenProps {
  action: FormAction<RequestPasswordResetInput>;
}
