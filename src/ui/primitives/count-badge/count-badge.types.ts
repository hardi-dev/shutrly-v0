export type CountBadgeVariant = "neutral" | "danger";

export interface CountBadgeProps {
  count: number;
  variant?: CountBadgeVariant;
  className?: string;
}
