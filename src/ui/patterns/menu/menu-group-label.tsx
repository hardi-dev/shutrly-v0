import { Header } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

/** Renders an overline label inside a menu group (C10). */
export function MenuGroupLabel({
  children,
  className,
}: Readonly<{ children: string; className?: string }>) {
  return (
    <Header
      className={cn(
        "px-(--component-menu-item-padding-x) pt-(--space-2)",
        "text-(length:--font-size-overline) font-bold uppercase tracking-(--font-letter-spacing-overline)",
        "text-(--component-menu-group-label)",
        className,
      )}
    >
      {children}
    </Header>
  );
}
