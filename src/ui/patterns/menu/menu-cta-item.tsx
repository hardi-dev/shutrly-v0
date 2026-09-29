"use client";

import { MenuItem as AriaMenuItem } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";
import type { IconName } from "@/ui/primitives/icon/icon.types";

/** Renders a primary call-to-action row at the end of a menu, keeping it keyboard reachable (C10). */
export function MenuCtaItem({
  label,
  icon,
  isDisabled = false,
  className,
  onSelect,
}: Readonly<{
  label: string;
  icon?: IconName;
  isDisabled?: boolean;
  className?: string;
  onSelect: () => void;
}>) {
  return (
    <AriaMenuItem
      textValue={label}
      isDisabled={isDisabled}
      onAction={onSelect}
      className={cn("px-(--component-menu-item-padding-x) py-(--space-2) outline-none", className)}
    >
      {({ isFocused, isDisabled: isItemDisabled }) => (
        <span
          data-variant="primary"
          className={cn(
            "flex w-full items-center justify-center gap-(--component-button-gap) rounded-(--component-button-radius)",
            "whitespace-nowrap bg-(--component-button-primary-background) px-(--space-4) py-(--component-button-md-padding-y)",
            "text-(length:--font-size-body) leading-[18px] font-semibold text-(--component-button-primary-text)",
            isFocused &&
              "bg-(--component-button-primary-background-hover) shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]",
            isItemDisabled && "opacity-(--opacity-disabled)",
          )}
        >
          {icon ? <Icon name={icon} size="sm" aria-hidden="true" /> : null}
          {label}
        </span>
      )}
    </AriaMenuItem>
  );
}
