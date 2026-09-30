import type { Control } from "react-hook-form";

import type {
  UpdateWorkspaceProfileFailure,
  UpdateWorkspaceProfileField,
  UpdateWorkspaceProfileInput,
} from "@/features/workspace/application/use-cases/update-workspace-profile/update-workspace-profile.types";

export interface SettingsProfile {
  name: string;
  brandName?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  address?: string | null;
  invoicePrefix: string;
  currency: string;
}

export type SettingsValues = UpdateWorkspaceProfileInput;

export type SettingsAction = (
  values: SettingsValues,
) => Promise<UpdateWorkspaceProfileFailure | undefined>;

export interface SettingsScreenProps {
  action: SettingsAction;
  profile: SettingsProfile;
}

export interface SettingsFieldProps {
  name: UpdateWorkspaceProfileField;
  label: string;
  type?: "text" | "email" | "tel";
  isOptional?: boolean;
  description?: string;
}

export type SettingsControl = Control<SettingsValues, unknown, SettingsValues>;
