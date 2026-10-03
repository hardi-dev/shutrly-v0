import type { ButtonIconName } from "@/ui/primitives/button/button.types";

export interface ProjectStepCopy {
  readonly label: string;
  readonly pendingLabel: string;
  readonly icon: ButtonIconName;
  readonly toastTitle: string;
  readonly toastBody?: string;
}
