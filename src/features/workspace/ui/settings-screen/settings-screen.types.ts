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
  saved?: boolean;
}

export interface SettingsFieldProps {
  label: string;
  name: string;
  value: string;
  type?: string;
}
