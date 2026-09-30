import type { BaseSyntheticEvent } from "react";
import type { UseFormReturn } from "react-hook-form";

import type {
  SettingsAction,
  SettingsProfile,
  SettingsValues,
} from "../settings-screen/settings-screen.types";

export interface SettingsFormOptions {
  profile: SettingsProfile;
  action: SettingsAction;
  onSaved: () => void;
}

export interface SettingsForm {
  form: UseFormReturn<SettingsValues, unknown, SettingsValues>;
  hasServerError: boolean;
  isSubmitting: boolean;
  onSubmit: (event?: BaseSyntheticEvent) => void;
}
