import { cn } from "@/ui/cn/cn";

import type { CountBadgeProps } from "./count-badge.types";

/** Renders a neutral count badge and hides zero counts.
 * @param props - numeric count and optional class name
 * @returns the count badge or null for zero
 */
export function CountBadge({ count, className }: Readonly<CountBadgeProps>) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-(--component-nav-count-radius)",
        "bg-(--component-nav-count-background) px-(--component-nav-count-padding-x)",
        "py-(--component-nav-count-padding-y) text-(length:--font-size-caption)",
        "font-semibold text-(--component-nav-count-text)",
        className,
      )}
    >
      {count >= 100 ? "99+" : count}
    </span>
  );
}
