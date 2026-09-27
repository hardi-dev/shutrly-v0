import { Link as AriaLink } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { CountBadge } from "@/ui/primitives/count-badge/count-badge";
import { Icon } from "@/ui/primitives/icon/icon";

import type { NavItemProps } from "./nav-item.types";

const BASE = [
  "flex min-w-0 items-center gap-(--component-nav-item-gap)",
  "rounded-(--component-nav-item-radius) px-(--component-nav-item-padding-x)",
  "py-(--component-nav-item-padding-y) text-(--component-nav-item-text)",
  "outline-none transition-colors",
  "hover:bg-(--component-nav-item-background-hover)",
  "focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
];

/** Renders a workspace navigation destination (C22). */
export function NavItem({
  href,
  label,
  icon,
  count,
  isActive = false,
  className,
}: Readonly<NavItemProps>) {
  let countLabel: string | null = null;
  if (count && count >= 100) {
    countLabel = "99+";
  } else if (count) {
    countLabel = String(count);
  }
  const accessibleLabel = countLabel ? `${label} ${countLabel}` : label;

  return (
    <AriaLink
      href={href}
      aria-label={accessibleLabel}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        BASE,
        isActive &&
          "bg-(--component-nav-item-background-active) text-(--component-nav-item-text-active)",
        className,
      )}
    >
      <Icon
        name={icon}
        aria-hidden="true"
        data-testid="nav-item-icon"
        className={cn(
          "text-(--component-nav-item-icon)",
          isActive && "text-(--component-nav-item-text-active)",
        )}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count ? <CountBadge count={count} /> : null}
    </AriaLink>
  );
}
