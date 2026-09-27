import { cn } from "@/ui/cn/cn";

/** Renders an overline label inside a menu group (C10). */
export function MenuGroupLabel({ children }: Readonly<{ children: string }>) {
  return (
    <div
      className={cn(
        "px-(--component-menu-item-padding-x) py-(--space-1)",
        "text-(length:--font-size-overline) font-semibold uppercase",
        "text-(--component-menu-group-label)",
      )}
    >
      {children}
    </div>
  );
}
