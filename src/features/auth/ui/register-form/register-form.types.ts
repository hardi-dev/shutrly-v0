import type { ReactNode } from "react";

import type { RegisterOwnerInput } from "@/features/auth/application/use-cases/register-owner/register-owner.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface RegisterFormProps {
  action: FormAction<RegisterOwnerInput>;
  /** Rendered under the form, outside it: the Google button (a form of its own). */
  secondaryAction?: ReactNode;
}
