"use client";

import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";
import { CountBadge } from "@/ui/primitives/count-badge/count-badge";
import { Icon } from "@/ui/primitives/icon/icon";

import type { SheetItemProps, SheetItemVariant } from "./sheet-item.types";

const VARIANT_CLASSES: Record<SheetItemVariant, string> = {
  default: "text-(--component-sheet-item-text)",
  destructive: "text-(--component-sheet-item-text-destructive)",
};

/** Renders a full-width 52px action row for a Bottom Sheet (C32). */
export function SheetItem({
  label,
  description,
  icon,
  count,
  isSelected = false,
  isDisabled = false,
  variant = "default",
  onPress,
}: Readonly<SheetItemProps>) {
  return (
    <AriaButton
      type="button"
      onPress={onPress}
      isDisabled={isDisabled}
      aria-label={[label, description, count].filter((value) => value !== undefined).join(" ")}
      className={cn(
        "flex min-h-[52px] w-full items-center gap-(--component-sheet-item-gap)",
        "border-t border-(--component-sheet-item-border) px-(--component-sheet-item-padding-x)",
        "text-left outline-none data-disabled:opacity-(--opacity-disabled)",
        "data-hovered:bg-(--color-semantic-surface-sunken) data-focus-visible:bg-(--color-semantic-surface-sunken)",
        VARIANT_CLASSES[variant],
      )}
    >
      {icon ? (
        <Icon name={icon} aria-hidden="true" className="text-(--component-sheet-item-icon)" />
      ) : null}
      <SheetItemText label={label} description={description} isSelected={isSelected} />
      {count !== undefined ? <CountBadge count={count} /> : null}
      {isSelected ? (
        <Icon
          name="check"
          aria-hidden="true"
          data-testid="sheet-item-check"
          className="text-(--component-sheet-item-check)"
        />
      ) : null}
    </AriaButton>
  );
}

function SheetItemText({
  label,
  description,
  isSelected,
}: Readonly<Pick<SheetItemProps, "label" | "description" | "isSelected">>) {
  return (
    <span className={cn("min-w-0 flex-1", description && "flex flex-col gap-(--space-0-5)")}>
      <span
        className={cn(
          "block text-(length:--font-size-body) font-medium",
          isSelected && "font-semibold",
        )}
      >
        {label}
      </span>
      {description ? (
        <span className="block text-(length:--font-size-label) text-(--component-menu-item-description)">
          {description}
        </span>
      ) : null}
    </span>
  );
}
