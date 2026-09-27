import { cn } from "@/ui/cn/cn";

import type { CountBadgeProps, CountBadgeVariant } from "./count-badge.types";

const VARIANT_CLASSES: Record<CountBadgeVariant, string> = {
  neutral: "bg-(--component-nav-count-background) text-(--component-nav-count-text)",
  danger: "bg-(--component-badge-danger-background) text-(--component-badge-danger-text)",
};

/** Renders a neutral count badge and hides zero counts.
 * @param props - numeric count and optional class name
 * @returns the count badge or null for zero
 */
export function CountBadge({ count, variant = "neutral", className }: Readonly<CountBadgeProps>) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-(--component-nav-count-radius)",
        "px-(--component-nav-count-padding-x)",
        "py-(--component-nav-count-padding-y) text-(length:--font-size-caption)",
        "font-semibold",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {count >= 100 ? "99+" : count}
    </span>
  );
}
