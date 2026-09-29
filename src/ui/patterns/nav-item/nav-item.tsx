import { useContext } from "react";
import { Link as AriaLink } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { CountBadge } from "@/ui/primitives/count-badge/count-badge";
import { Icon } from "@/ui/primitives/icon/icon";
import { Tooltip } from "@/ui/primitives/tooltip/tooltip";

import type { NavItemProps } from "./nav-item.types";
import { NavItemCompactContext } from "./nav-item-context";

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
  const compact = useContext(NavItemCompactContext) || isCompact;
  const countLabel = formatCount(count);
  const accessibleLabel = countLabel ? `${label} ${countLabel}` : label;

  const item = (
    <AriaLink
      href={href}
      aria-label={accessibleLabel}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        compact
          ? "flex size-(--space-10) items-center justify-center rounded-(--component-nav-item-radius)"
          : BASE,
        "group",
        !isActive && "hover:bg-(--component-nav-item-background-hover)",
        "outline-none transition-colors",
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
          isActive
            ? "text-(--component-nav-item-text-active)"
            : "text-(--component-nav-item-icon) group-hover:text-(--component-nav-item-icon-hover)",
        )}
      />
      {!compact ? <NavItemLabel label={label} isActive={isActive} /> : null}
      {!compact && count ? <CountBadge count={count} /> : null}
    </AriaLink>
  );

  return compact ? <Tooltip label={label}>{item}</Tooltip> : item;
}

function NavItemLabel({ label, isActive }: Readonly<{ label: string; isActive: boolean }>) {
  return (
    <span
      className={cn(
        "min-w-0 flex-1 truncate text-(length:--font-size-body)",
        isActive ? "font-semibold" : "font-medium",
      )}
    >
      {label}
    </span>
  );
}

function formatCount(count: number | undefined): string | null {
  if (!count) return null;
  return count >= 100 ? "99+" : String(count);
}
