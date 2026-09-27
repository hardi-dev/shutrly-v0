import { Link as AriaLink } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";
import { Tooltip } from "@/ui/primitives/tooltip/tooltip";

import type { NavRailItemProps } from "./nav-rail-item.types";

/** Renders a compact, tooltip-labelled workspace rail destination (C37). */
export function NavRailItem({
  href,
  label,
  icon,
  isActive = false,
  className,
}: Readonly<NavRailItemProps>) {
  return (
    <Tooltip label={label}>
      <AriaLink
        href={href}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex size-(--space-10) items-center justify-center rounded-(--component-nav-item-radius)",
          "text-(--component-nav-item-icon) outline-none transition-colors",
          "hover:bg-(--component-nav-item-background-hover)",
          "focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
          isActive &&
            "bg-(--component-nav-item-background-active) text-(--component-nav-item-text-active)",
          className,
        )}
      >
        <Icon name={icon} aria-hidden="true" />
      </AriaLink>
    </Tooltip>
  );
}
