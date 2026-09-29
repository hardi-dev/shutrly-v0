import type { Control, FieldPath } from "react-hook-form";
import type { z } from "zod";

import type { updateWorkspaceProfileSchema } from "../../application/use-cases/update-workspace-profile/update-workspace-profile.schema";

export interface SettingsProfile {
  name: string;
  brandName?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  address?: string | null;
  invoicePrefix: string;
  currency: string;
}

export interface SettingsScreenProps {
  action: (formData: FormData) => void | Promise<void>;
  profile: SettingsProfile;
}

export type SettingsFormValues = z.input<typeof updateWorkspaceProfileSchema>;

export interface SettingsFieldControlProps {
  control: Control<SettingsFormValues>;
  label: string;
  name: FieldPath<SettingsFormValues>;
  type?: string;
  isOptional?: boolean;
  description?: string;
}

export interface SettingsTextareaControlProps {
  control: Control<SettingsFormValues>;
}
