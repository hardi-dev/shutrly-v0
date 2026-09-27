export interface OnboardingScreenProps {
  accountName: string;
  accountEmail: string;
  action: (formData: FormData) => void | Promise<void>;
}
