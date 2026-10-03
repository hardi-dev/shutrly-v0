"use client";

import { forwardRef } from "react";
import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { CountBadge } from "@/ui/primitives/count-badge/count-badge";
import { Icon } from "@/ui/primitives/icon/icon";

import type { IconButtonProps } from "./icon-button.types";

const SIZE_CLASSES = {
  sm: "size-(--space-8) p-(--component-icon-button-sm-padding)",
  md: "size-(--space-10) p-(--component-icon-button-padding)",
} as const;

/** Renders a token-backed ghost icon button for compact actions.
 * @param props - icon, accessible name, size and button state
 * @returns the icon-only button
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = "md", className, icon, badgeCount = 0, ...props },
  ref,
) {
  const label =
    badgeCount > 0
      ? `${props["aria-label"]}, ${String(Math.min(badgeCount, 99))} belum dibaca`
      : props["aria-label"];
  return (
    <AriaButton
      {...props}
      ref={ref}
      aria-label={label}
      type="button"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-(--component-icon-button-radius)",
        "text-(--component-icon-button-icon) outline-none transition-colors",
        "hover:bg-(--component-icon-button-background-hover)",
        "focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
        "disabled:opacity-(--opacity-disabled)",
        SIZE_CLASSES[size],
        className,
      )}
    >
      <Icon name={icon} aria-hidden="true" />
      {badgeCount > 0 ? (
        <CountBadge
          count={badgeCount}
          variant="danger"
          className="absolute left-(--space-5) top-(--space-1)"
        />
      ) : null}
    </AriaButton>
  );
});
