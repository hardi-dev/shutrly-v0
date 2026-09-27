import { cn } from "@/ui/cn/cn";

import type { NavGroupLabelProps } from "./nav-group-label.types";

/** Renders the overline label for a navigation group. */
export function NavGroupLabel({ children, className }: Readonly<NavGroupLabelProps>) {
  return (
    <span
      className={cn(
        "block px-(--component-nav-item-padding-x) py-(--space-1)",
        "text-(length:--font-size-overline) font-semibold uppercase",
        "text-(--component-nav-group-label)",
        className,
      )}
    >
      {children}
    </span>
  );
}
