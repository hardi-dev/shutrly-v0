import type { UpdateDisplayNameInput } from "@/features/auth/application/use-cases/update-display-name/update-display-name.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface ProfileFormProps {
  email: string;
  name: string;
  action: FormAction<UpdateDisplayNameInput>;
}
