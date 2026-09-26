import type { RegisterOwnerInput } from "@/features/auth/application/use-cases/register-owner/register-owner.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface RegisterScreenProps {
  action: FormAction<RegisterOwnerInput>;
  googleAction: () => Promise<void>;
}
