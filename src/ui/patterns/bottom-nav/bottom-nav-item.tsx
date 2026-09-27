import { Link as AriaLink } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { CountBadge } from "@/ui/primitives/count-badge/count-badge";
import { Icon } from "@/ui/primitives/icon/icon";

import type { BottomNavItemProps } from "./bottom-nav-item.types";

/** Renders one of the four bottom navigation destinations (C34). */
export function BottomNavItem({
  href,
  label,
  icon,
  count,
  isActive = false,
  className,
}: Readonly<BottomNavItemProps>) {
  return (
    <AriaLink
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-h-(--space-12) w-(--space-16) flex-col items-center justify-center gap-(--component-bottom-nav-item-gap)",
        "rounded-(--component-nav-item-radius) text-(--component-bottom-nav-item-text)",
        "outline-none transition-colors focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
        isActive && "font-semibold text-(--component-bottom-nav-item-active)",
        className,
      )}
    >
      <span className="relative">
        <Icon
          name={icon}
          aria-hidden="true"
          className={cn(
            "text-(--component-bottom-nav-item-icon)",
            isActive && "text-(--component-bottom-nav-item-active)",
          )}
        />
        {count ? (
          <CountBadge count={count} className="absolute -right-(--space-2) -top-(--space-1)" />
        ) : null}
      </span>
      <span className="text-(length:--font-size-caption)">{label}</span>
    </AriaLink>
  );
}
