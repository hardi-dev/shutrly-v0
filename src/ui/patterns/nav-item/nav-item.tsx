import { Link as AriaLink } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { CountBadge } from "@/ui/primitives/count-badge/count-badge";
import { Icon } from "@/ui/primitives/icon/icon";
import { Tooltip } from "@/ui/primitives/tooltip/tooltip";

import type { NavItemProps } from "./nav-item.types";

const BASE = [
  "flex min-w-0 items-center gap-(--component-nav-item-gap)",
  "rounded-(--component-nav-item-radius) px-(--component-nav-item-padding-x)",
  "py-(--component-nav-item-padding-y) text-(--component-nav-item-text)",
  "outline-none transition-colors",
  "focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
];

/** Renders a workspace navigation destination (C22). */
export function NavItem({
  href,
  label,
  icon,
  count,
  isActive = false,
  isCompact = false,
  className,
}: Readonly<NavItemProps>) {
  let countLabel: string | null = null;
  if (count && count >= 100) {
    countLabel = "99+";
  } else if (count) {
    countLabel = String(count);
  }
  const accessibleLabel = countLabel ? `${label} ${countLabel}` : label;

  const item = (
    <AriaLink
      href={href}
      aria-label={accessibleLabel}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        isCompact
          ? "flex size-(--space-10) items-center justify-center rounded-(--component-nav-item-radius)"
          : BASE,
        !isActive && "hover:bg-(--component-nav-item-background-hover)",
        "text-(--component-nav-item-icon) outline-none transition-colors",
        "focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
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
      {!isCompact ? <span className="min-w-0 flex-1 truncate">{label}</span> : null}
      {!isCompact && count ? <CountBadge count={count} /> : null}
    </AriaLink>
  );

  return isCompact ? <Tooltip label={label}>{item}</Tooltip> : item;
}
