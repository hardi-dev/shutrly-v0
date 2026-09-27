import type { ChangePasswordInput } from "@/features/auth/application/use-cases/change-password/change-password.types";
import type { UpdateDisplayNameInput } from "@/features/auth/application/use-cases/update-display-name/update-display-name.types";

import type { FormAction } from "../use-auth-form/use-auth-form.types";

export interface AccountView {
  email: string;
  name: string;
  hasPassword: boolean;
}

export interface AccountSectionsProps {
  account: AccountView;
  updateName: FormAction<UpdateDisplayNameInput>;
  changePassword: FormAction<ChangePasswordInput>;
}
