export type StatusChipTone = "success" | "info" | "warning" | "danger" | "accent" | "neutral";

export interface StatusChipProps {
  tone: StatusChipTone;
  label: string;
  hasDot?: boolean;
  className?: string;
}
