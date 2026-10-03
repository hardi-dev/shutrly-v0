"use client";
/* eslint-disable max-len -- semantic action item content is kept adjacent to its React Aria wrapper */

import { MenuItem as AriaMenuItem } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { Icon } from "@/ui/primitives/icon/icon";

import type { MenuItemLayout, MenuItemProps } from "./menu-item.types";

const LAYOUT_CLASSES: Record<MenuItemLayout, string> = {
  compact: cn(
    "min-h-(--space-9) gap-(--component-menu-item-gap) rounded-(--component-menu-item-radius)",
    "px-(--component-menu-item-padding-x) py-(--component-menu-item-padding-y)",
  ),
  row: cn(
    "min-h-[52px] gap-(--component-sheet-item-gap) border-t border-(--component-sheet-item-border)",
    "px-(--component-sheet-item-padding-x) text-(length:--font-size-body) font-medium",
  ),
};

function getMenuItemClassName(isDestructive: boolean, isDisabled: boolean, layout: MenuItemLayout) {
  return ({ isFocused }: { isFocused: boolean }) =>
    cn(
      "flex items-center outline-none",
      LAYOUT_CLASSES[layout],
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
  layout = "compact",
  href,
  target,
  onSelect,
}: Readonly<MenuItemProps>) {
  const isDestructive = variant === "destructive";
  return (
    <AriaMenuItem
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      textValue={label}
      isDisabled={isDisabled}
      onAction={onSelect}
      aria-label={description ? `${label} ${description}` : label}
      className={getMenuItemClassName(isDestructive, isDisabled, layout)}
    >
      <MenuItemContent
        label={label}
        description={description}
        icon={icon}
        isSelected={isSelected}
        layout={layout}
      />
    </AriaMenuItem>
  );
}

function MenuItemContent({
  label,
  description,
  icon,
  isSelected,
  layout,
}: Readonly<Pick<MenuItemProps, "label" | "description" | "icon" | "isSelected" | "layout">>) {
  return (
    <>
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
          className={
            layout === "row"
              ? "text-(--component-sheet-item-check)"
              : "text-(--component-menu-item-check)"
          }
        />
      ) : null}
    </>
  );
}
/* eslint-enable max-len -- end adjacent item content */
