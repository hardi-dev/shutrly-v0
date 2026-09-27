"use client";

import { MenuItem as AriaMenuItem } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import type { MenuItemProps } from "./menu-item.types";

function getMenuItemClassName(isDestructive: boolean, isDisabled: boolean) {
  return ({ isFocused }: { isFocused: boolean }) =>
    cn(
      "flex min-h-(--space-9) items-center gap-(--component-menu-item-gap)",
      "rounded-(--component-menu-item-radius) px-(--component-menu-item-padding-x)",
      "py-(--component-menu-item-padding-y) outline-none",
      "text-(--component-menu-item-text)",
      isFocused &&
        (isDestructive
          ? "bg-(--component-menu-item-background-destructive-hover)"
          : "bg-(--component-menu-item-background-hover)"),
      isDestructive && "text-(--component-menu-item-text-destructive)",
      isDisabled && "text-(--component-menu-item-text-disabled)",
    );
}

/** Renders an actionable menu row with optional icon, description and selection check (C09). */
export function MenuItem({
  label,
  description,
  icon,
  isSelected = false,
  isDisabled = false,
  variant = "default",
  onSelect,
}: Readonly<MenuItemProps>) {
  const isDestructive = variant === "destructive";

  return (
    <AriaMenuItem
      textValue={label}
      isDisabled={isDisabled}
      onAction={onSelect}
      aria-label={description ? `${label} ${description}` : label}
      className={getMenuItemClassName(isDestructive, isDisabled)}
    >
      {icon ? <Icon name={icon} aria-hidden="true" data-testid="menu-item-icon" /> : null}
      <span className="min-w-0 flex-1">
        <span className={cn("block", isSelected && "font-semibold")}>{label}</span>
        {description ? (
          <span className="block text-(length:--font-size-label) text-(--component-menu-item-description)">
            {description}
          </span>
        ) : null}
      </span>
      {isSelected ? (
        <Icon
          name="check"
          aria-hidden="true"
          data-testid="menu-item-check"
          className="text-(--component-menu-item-check)"
        />
      ) : null}
    </AriaMenuItem>
  );
}
