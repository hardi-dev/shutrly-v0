import type { ReactNode } from "react";

import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface EmptyStateProps {
  icon: IconName;
  iconTone?: "accent" | "primary" | "danger";
  title: string;
  body: string;
  action?: ReactNode;
}
